import { Place } from '@/types/places';
import { PlaceCard } from './PlaceCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, Loader2 } from 'lucide-react';

interface PlacesListProps {
  places: Place[];
  selectedPlace: Place | null;
  onPlaceSelect: (place: Place) => void;
  isLoading: boolean;
}

export function PlacesList({ 
  places, 
  selectedPlace, 
  onPlaceSelect, 
  isLoading 
}: PlacesListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-3" />
        <p className="text-sm">Discovering places...</p>
      </div>
    );
  }

  if (places.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
          <MapPin className="h-8 w-8" />
        </div>
        <p className="text-base font-medium mb-1">No places found</p>
        <p className="text-sm text-center px-4">
          Try searching for a city or adjusting your filters
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-3 space-y-1">
        {places.map((place) => (
          <PlaceCard
            key={place.id}
            place={place}
            isSelected={selectedPlace?.id === place.id}
            onClick={() => onPlaceSelect(place)}
            compact
          />
        ))}
      </div>
    </ScrollArea>
  );
}
