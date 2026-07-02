import { useState, useMemo } from 'react';
import { Place, PlaceType, PLACE_TYPE_LABELS, PLACE_TYPE_ICONS } from '@/types/places';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { RotateCcw, Calendar, MapPin, Layers, Star, FileText } from 'lucide-react';

interface FiltersPanelProps {
  onFilterChange: (filters: {
    types: PlaceType[];
    minAge: number | null;
    maxAge: number | null;
    radius: number;
    minTags: number;
    hasWikipedia: boolean | null;
    hasOpeningHours: boolean | null;
  }) => void;
  currentFilters: {
    types: PlaceType[];
    radius: number;
  };
  places: Place[];
}

const ALL_TYPES: PlaceType[] = [
  'historic', 'museum', 'landmark', 'monument', 'religious',
  'park', 'nature', 'viewpoint', 'artwork', 'entertainment',
  'restaurant', 'cafe', 'other'
];

export function FiltersPanel({ onFilterChange, currentFilters, places }: FiltersPanelProps) {
  const [selectedTypes, setSelectedTypes] = useState<PlaceType[]>(currentFilters.types);
  const [ageRange, setAgeRange] = useState<[number, number]>([0, 3000]);
  const [radius, setRadius] = useState(currentFilters.radius);
  const [minTags, setMinTags] = useState(0);
  const [hasWikipedia, setHasWikipedia] = useState<boolean | null>(null);
  const [hasOpeningHours, setHasOpeningHours] = useState<boolean | null>(null);

  // Calculate stats from places
  const stats = useMemo(() => {
    const placesWithAge = places.filter((p) => {
      const startDate = p.tags?.find((t) => t.startsWith('start_date:'));
      return startDate != null;
    });

    const maxTags = Math.max(...places.map(p => p.tags?.length || 0), 1);
    const withWiki = places.filter(p => p.wikipediaUrl).length;
    const withHours = places.filter(p => p.openingHours).length;

    return {
      ageCount: placesWithAge.length,
      maxTags,
      withWiki,
      withHours,
      total: places.length,
    };
  }, [places]);

  const applyFilters = () => {
    onFilterChange({ 
      types: selectedTypes, 
      minAge: ageRange[0] > 0 ? ageRange[0] : null,
      maxAge: ageRange[1] < 3000 ? ageRange[1] : null,
      radius,
      minTags,
      hasWikipedia,
      hasOpeningHours,
    });
  };

  const handleTypeToggle = (type: PlaceType) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type];
    setSelectedTypes(newTypes);
  };

  const handleReset = () => {
    setSelectedTypes([]);
    setAgeRange([0, 3000]);
    setRadius(5000);
    setMinTags(0);
    setHasWikipedia(null);
    setHasOpeningHours(null);
    onFilterChange({ 
      types: [], 
      minAge: null, 
      maxAge: null, 
      radius: 5000,
      minTags: 0,
      hasWikipedia: null,
      hasOpeningHours: null,
    });
  };

  const formatAge = (years: number) => {
    if (years === 0) return 'Now';
    if (years >= 1000) return `${(years / 1000).toFixed(1)}k yrs`;
    return `${years} yrs`;
  };

  return (
    <ScrollArea className="h-full pr-2">
      <div className="space-y-4">
        {/* Reset & Apply */}
        <div className="flex justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
          <Button size="sm" onClick={applyFilters}>
            Apply Filters
          </Button>
        </div>

        {/* Search Radius */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">Search Radius</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Slider
              value={[radius]}
              min={500}
              max={20000}
              step={500}
              onValueChange={(v) => setRadius(v[0])}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>500m</span>
              <span className="font-medium text-foreground">
                {radius >= 1000 ? `${(radius / 1000).toFixed(1)} km` : `${radius}m`}
              </span>
              <span>20km</span>
            </div>
          </CardContent>
        </Card>

        {/* Age Filter */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">Age of Places</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Slider
              value={ageRange}
              min={0}
              max={3000}
              step={50}
              onValueChange={(v) => setAgeRange([v[0], v[1]])}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatAge(ageRange[0])}</span>
              <span>→</span>
              <span>{formatAge(ageRange[1])}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.ageCount} of {stats.total} have age data
            </p>
          </CardContent>
        </Card>

        {/* Detail Richness */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">Detail Richness</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Min. Tags/Details</Label>
              <Slider
                value={[minTags]}
                min={0}
                max={Math.min(stats.maxTags, 10)}
                step={1}
                onValueChange={(v) => setMinTags(v[0])}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Any</span>
                <span className="font-medium text-foreground">{minTags}+ tags</span>
                <span>{Math.min(stats.maxTags, 10)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Quality Filters */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">Data Quality</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label className="flex items-center gap-2 p-2 rounded-lg border cursor-pointer hover:bg-secondary/50">
              <Checkbox
                checked={hasWikipedia === true}
                onCheckedChange={(checked) => setHasWikipedia(checked ? true : null)}
              />
              <span className="text-sm">Has Wikipedia ({stats.withWiki})</span>
            </Label>
            <Label className="flex items-center gap-2 p-2 rounded-lg border cursor-pointer hover:bg-secondary/50">
              <Checkbox
                checked={hasOpeningHours === true}
                onCheckedChange={(checked) => setHasOpeningHours(checked ? true : null)}
              />
              <span className="text-sm">Has Opening Hours ({stats.withHours})</span>
            </Label>
          </CardContent>
        </Card>

        {/* Place Types */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {ALL_TYPES.map((type) => (
                <Label
                  key={type}
                  className="flex items-center gap-2 p-2 rounded-lg border cursor-pointer hover:bg-secondary/50 transition-colors"
                >
                  <Checkbox
                    checked={selectedTypes.includes(type)}
                    onCheckedChange={() => handleTypeToggle(type)}
                  />
                  <span className="text-base">{PLACE_TYPE_ICONS[type]}</span>
                  <span className="text-xs truncate">{PLACE_TYPE_LABELS[type]}</span>
                </Label>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
