import { PlaceType, PLACE_TYPE_LABELS, PLACE_TYPE_ICONS } from '@/types/places';
import { cn } from '@/lib/utils';

interface FilterChipsProps {
  selectedTypes: PlaceType[];
  onTypeToggle: (type: PlaceType) => void;
}

const FILTER_TYPES: PlaceType[] = [
  'historic',
  'museum',
  'landmark',
  'monument',
  'nature',
  'park',
  'viewpoint',
  'religious',
  'entertainment',
  'artwork',
];

export function FilterChips({ selectedTypes, onTypeToggle }: FilterChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
      {FILTER_TYPES.map((type) => {
        const isSelected = selectedTypes.includes(type);
        return (
          <button
            key={type}
            onClick={() => onTypeToggle(type)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all',
              'border hover:shadow-sm',
              isSelected
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-card text-foreground border-border hover:bg-secondary/50'
            )}
          >
            <span>{PLACE_TYPE_ICONS[type]}</span>
            <span>{PLACE_TYPE_LABELS[type]}</span>
          </button>
        );
      })}
    </div>
  );
}
