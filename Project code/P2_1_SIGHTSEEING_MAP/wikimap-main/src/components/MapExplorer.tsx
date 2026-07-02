import { useCallback, useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SearchBar } from '@/components/search/SearchBar';
import { FilterChips } from '@/components/search/FilterChips';
import { PlacesList } from '@/components/places/PlacesList';
import { PlaceDetail } from '@/components/places/PlaceDetail';
import { RightMenu } from '@/components/menu/RightMenu';
import { useMapState } from '@/hooks/useMapState';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { searchPlacesNearby } from '@/lib/overpass';
import { PlaceType, Place, PLACE_TYPE_ICONS } from '@/types/places';
import { Button } from '@/components/ui/button';
import { 
  Compass, 
  Layers, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw,
  User,
  Menu,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

// Fix Leaflet default marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function createCustomIcon(type: string, isSelected: boolean): L.DivIcon {
  const emoji = PLACE_TYPE_ICONS[type as keyof typeof PLACE_TYPE_ICONS] || '📍';
  const size = isSelected ? 44 : 36;
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div class="marker-inner" style="display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;font-size:${size * 0.5}px;background:${isSelected ? 'hsl(var(--primary))' : 'hsl(var(--card))'};border:3px solid ${isSelected ? 'hsl(var(--primary-foreground))' : 'hsl(var(--border))'};border-radius:50%;box-shadow:0 4px 12px -2px rgba(0,0,0,0.3);cursor:pointer;transition:transform 0.2s;pointer-events:auto;">${emoji}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export function MapExplorer() {
  const {
    center,
    zoom,
    selectedPlace,
    places,
    isLoading,
    filters,
    setCenter,
    setZoom,
    setSelectedPlace,
    setPlaces,
    setIsLoading,
    setFilters,
  } = useMapState();

  const { user, profile, signOut } = useAuth();
  const { favorites, isFavorite, addFavorite, removeFavorite } = useFavorites(user?.id);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [locationName, setLocationName] = useState('London');
  const [selectedLanguage, setSelectedLanguage] = useState(profile?.preferred_language || 'en');
  const [ageFilter, setAgeFilter] = useState<{ min: number | null; max: number | null }>({ min: null, max: null });
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Update language when profile loads
  useEffect(() => {
    if (profile?.preferred_language) {
      setSelectedLanguage(profile.preferred_language);
    }
  }, [profile]);

  // Initialize map
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
      }).setView(center, zoom);
      
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }).addTo(mapRef.current);

      // Add zoom control to bottom-left
      L.control.zoom({ position: 'bottomleft' }).addTo(mapRef.current);

      // Create markers layer
      markersLayerRef.current = L.layerGroup().addTo(mapRef.current);

      mapRef.current.on('moveend', () => {
        if (mapRef.current) {
          const newCenter = mapRef.current.getCenter();
          setCenter([newCenter.lat, newCenter.lng]);
          setZoom(mapRef.current.getZoom());
        }
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersLayerRef.current = null;
      }
    };
  }, []);

  // Update markers when places change
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;

    // Clear existing markers
    markersLayerRef.current.clearLayers();

    // Add new markers
    places.forEach((place) => {
      const marker = L.marker([place.lat, place.lng], {
        icon: createCustomIcon(place.type, selectedPlace?.id === place.id),
        interactive: true,
      });
      
      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        setSelectedPlace(place);
        if (mapRef.current) {
          mapRef.current.setView([place.lat, place.lng], Math.max(mapRef.current.getZoom(), 15), { animate: true });
        }
      });

      // Add hover effect - only change the inner div, not the marker position
      marker.on('mouseover', () => {
        const el = marker.getElement();
        if (el) {
          const inner = el.querySelector('.marker-inner') as HTMLElement;
          if (inner) {
            inner.style.transform = 'scale(1.15)';
            inner.style.boxShadow = '0 6px 20px -2px rgba(0,0,0,0.4)';
          }
          el.style.zIndex = '1000';
        }
      });

      marker.on('mouseout', () => {
        const el = marker.getElement();
        if (el) {
          const inner = el.querySelector('.marker-inner') as HTMLElement;
          if (inner) {
            inner.style.transform = 'scale(1)';
            inner.style.boxShadow = '0 4px 12px -2px rgba(0,0,0,0.3)';
          }
          el.style.zIndex = '';
        }
      });
      
      markersLayerRef.current!.addLayer(marker);
    });
  }, [places, selectedPlace, setSelectedPlace]);

  const fetchPlaces = useCallback(async () => {
    setIsLoading(true);
    try {
      const results = await searchPlacesNearby(center[0], center[1], filters.radius, filters.types);
      setPlaces(results);
    } catch (error) {
      console.error('Error fetching places:', error);
    } finally {
      setIsLoading(false);
    }
  }, [center, filters.radius, filters.types, setIsLoading, setPlaces]);

  useEffect(() => {
    const debounce = setTimeout(fetchPlaces, 800);
    return () => clearTimeout(debounce);
  }, [fetchPlaces]);

  const handleLocationSelect = useCallback((lat: number, lng: number, name: string) => {
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 14, { animate: true });
    }
    setLocationName(name.split(',')[0]);
    setSelectedPlace(null);
  }, [setSelectedPlace]);

  const handleTypeToggle = useCallback((type: PlaceType) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type];
    setFilters({ types: newTypes });
  }, [filters.types, setFilters]);

  const handleFilterChange = useCallback((newFilters: {
    types: PlaceType[];
    minAge: number | null;
    maxAge: number | null;
    radius: number;
    minTags: number;
    hasWikipedia: boolean | null;
    hasOpeningHours: boolean | null;
  }) => {
    setFilters({ types: newFilters.types, radius: newFilters.radius });
    setAgeFilter({ min: newFilters.minAge, max: newFilters.maxAge });
    // Additional filters could be applied here for local filtering
  }, [setFilters]);

  const handleLocateMe = useCallback(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (mapRef.current) {
            mapRef.current.setView([position.coords.latitude, position.coords.longitude], 15, { animate: true });
          }
          setLocationName('Your Location');
        },
        (error) => console.error('Geolocation error:', error)
      );
    }
  }, []);

  const handlePlaceSelect = useCallback((place: Place) => {
    setSelectedPlace(place);
    if (mapRef.current) {
      mapRef.current.setView([place.lat, place.lng], Math.max(mapRef.current.getZoom(), 15), { animate: true });
    }
  }, [setSelectedPlace]);

  const handleLanguageChange = useCallback((lang: string) => {
    setSelectedLanguage(lang);
  }, []);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: 'Error signing out',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully.',
      });
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-muted">
      {/* Map Container */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

      {/* Top Controls */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex items-start gap-3">
        <div className="flex-1 max-w-lg">
          <SearchBar onLocationSelect={handleLocationSelect} />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="icon"
            className="h-14 w-14 rounded-xl shadow-lg bg-card hover:bg-secondary"
            onClick={handleLocateMe}
          >
            <Compass className="h-5 w-5" />
          </Button>
          
          {user ? (
            <Button
              variant="secondary"
              size="icon"
              className="h-14 w-14 rounded-xl shadow-lg bg-card hover:bg-secondary"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="icon"
              className="h-14 w-14 rounded-xl shadow-lg bg-card hover:bg-secondary"
              onClick={() => navigate('/auth')}
            >
              <User className="h-5 w-5" />
            </Button>
          )}
          
          <Button
            variant="default"
            size="icon"
            className="h-14 w-14 rounded-xl shadow-lg"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="absolute top-24 left-4 right-[420px] z-[999]">
        <FilterChips selectedTypes={filters.types} onTypeToggle={handleTypeToggle} />
      </div>

      {/* Side Panel */}
      <div
        className={cn(
          'absolute top-0 right-0 h-full z-[1001] transition-transform duration-300',
          isPanelOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        style={{ width: '380px' }}
      >
        <Button
          variant="secondary"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full h-12 w-6 rounded-l-lg rounded-r-none shadow-lg bg-card"
          onClick={() => setIsPanelOpen(!isPanelOpen)}
        >
          {isPanelOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>

        <div className="h-full bg-card border-l shadow-xl flex flex-col">
          {selectedPlace ? (
            <PlaceDetail 
              place={selectedPlace} 
              onClose={() => setSelectedPlace(null)}
              language={selectedLanguage}
              isFavorite={isFavorite(selectedPlace.id)}
              onToggleFavorite={() => {
                if (!user) {
                  toast({
                    title: 'Sign in required',
                    description: 'Please sign in to save favorites.',
                  });
                  navigate('/auth');
                  return;
                }
                if (isFavorite(selectedPlace.id)) {
                  removeFavorite(selectedPlace.id);
                } else {
                  addFavorite(selectedPlace);
                }
              }}
            />
          ) : (
            <>
              <div className="flex-shrink-0 p-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{locationName}</h2>
                    <p className="text-sm text-muted-foreground">{places.length} places found</p>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-lg" onClick={fetchPlaces} disabled={isLoading}>
                    <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
                  </Button>
                </div>
              </div>
              <PlacesList places={places} selectedPlace={selectedPlace} onPlaceSelect={handlePlaceSelect} isLoading={isLoading} />
            </>
          )}
        </div>
      </div>

      {!isPanelOpen && (
        <Button
          variant="secondary"
          className="fixed bottom-6 right-6 z-[1000] h-14 gap-2 rounded-xl shadow-lg bg-card px-5"
          onClick={() => setIsPanelOpen(true)}
        >
          <Layers className="h-5 w-5" />
          <span className="font-medium">{places.length} places</span>
        </Button>
      )}

      {/* Right Menu */}
      <RightMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        places={places}
        favorites={favorites}
        selectedLanguage={selectedLanguage}
        onLanguageChange={handleLanguageChange}
        onPlaceSelect={(place) => {
          handlePlaceSelect(place);
          setIsMenuOpen(false);
        }}
        onFilterChange={handleFilterChange}
        currentFilters={filters}
      />
    </div>
  );
}
