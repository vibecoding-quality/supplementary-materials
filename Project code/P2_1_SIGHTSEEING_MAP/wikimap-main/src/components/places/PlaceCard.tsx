import { Place, PLACE_TYPE_ICONS, PLACE_TYPE_LABELS } from '@/types/places';
import { MapPin, ExternalLink, Clock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlaceCardProps {
  place: Place;
  isSelected: boolean;
  onClick: () => void;
  compact?: boolean;
}

export function PlaceCard({ place, isSelected, onClick, compact = false }: PlaceCardProps) {
  const icon = PLACE_TYPE_ICONS[place.type];
  const typeLabel = PLACE_TYPE_LABELS[place.type];

  if (compact) {
    return (
      <button
        onClick={onClick}
        className={cn(
          'w-full p-3 text-left rounded-xl transition-all',
          'hover:bg-secondary/50 group',
          isSelected && 'bg-primary/5 ring-1 ring-primary/20'
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0',
            isSelected ? 'bg-primary/10' : 'bg-secondary'
          )}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{place.name}</h3>
            <p className="text-xs text-muted-foreground">{typeLabel}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-4 text-left rounded-xl transition-all',
        'border hover:shadow-sm hover:border-primary/20',
        isSelected 
          ? 'bg-primary/5 border-primary/30 shadow-sm' 
          : 'bg-card border-border'
      )}
    >
      <div className="flex gap-3">
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0',
          isSelected ? 'bg-primary/10' : 'bg-secondary'
        )}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base mb-1 truncate">{place.name}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {typeLabel}
            </span>
            {place.openingHours && (
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Open
              </span>
            )}
          </div>
          {place.description && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {place.description}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
