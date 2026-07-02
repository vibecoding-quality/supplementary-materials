import { useState, useCallback } from 'react';
import { Place, PlaceType, MapViewState } from '@/types/places';

interface UseMapStateReturn {
  center: [number, number];
  zoom: number;
  selectedPlace: Place | null;
  places: Place[];
  isLoading: boolean;
  filters: {
    types: PlaceType[];
    radius: number;
    query: string;
  };
  setCenter: (center: [number, number]) => void;
  setZoom: (zoom: number) => void;
  setSelectedPlace: (place: Place | null) => void;
  setPlaces: (places: Place[]) => void;
  setIsLoading: (loading: boolean) => void;
  setFilters: (filters: Partial<UseMapStateReturn['filters']>) => void;
  updateMapView: (view: MapViewState) => void;
}

// Default to London
const DEFAULT_CENTER: [number, number] = [51.5074, -0.1278];
const DEFAULT_ZOOM = 13;

export function useMapState(): UseMapStateReturn {
  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFiltersState] = useState<UseMapStateReturn['filters']>({
    types: [],
    radius: 5000,
    query: '',
  });

  const setFilters = useCallback((newFilters: Partial<UseMapStateReturn['filters']>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const updateMapView = useCallback((view: MapViewState) => {
    setCenter(view.center);
    setZoom(view.zoom);
  }, []);

  return {
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
    updateMapView,
  };
}
