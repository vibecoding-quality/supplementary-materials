import { Place, PLACE_TYPE_ICONS, PLACE_TYPE_LABELS } from '@/types/places';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Heart, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FavoritesPanelProps {
  favorites: any[];
  onPlaceSelect: (place: Place) => void;
}

export function FavoritesPanel({ favorites, onPlaceSelect }: FavoritesPanelProps) {
  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <Heart className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-sm">No saved places yet</p>
        <p className="text-xs text-center mt-1">
          Click the heart icon on any place to save it here
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full pr-2">
      <div className="space-y-2">
        {favorites.map((fav) => {
          const place = fav.place_data as Place;
          const icon = PLACE_TYPE_ICONS[fav.place_type as keyof typeof PLACE_TYPE_ICONS] || '📍';
          const typeLabel = PLACE_TYPE_LABELS[fav.place_type as keyof typeof PLACE_TYPE_LABELS] || 'Place';

          return (
            <button
              key={fav.id}
              onClick={() => onPlaceSelect(place)}
              className={cn(
                'w-full p-3 text-left rounded-xl transition-all',
                'border hover:bg-secondary/50 hover:border-primary/20'
              )}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg flex-shrink-0">
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{fav.place_name}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{typeLabel}</span>
                  </div>
                  {fav.notes && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {fav.notes}
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
