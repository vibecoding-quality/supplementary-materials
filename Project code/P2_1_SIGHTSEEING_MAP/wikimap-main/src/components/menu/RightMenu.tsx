import { useState } from 'react';
import { X, BarChart3, SlidersHorizontal, Heart, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { AnalyticsPanel } from './AnalyticsPanel';
import { FiltersPanel } from './FiltersPanel';
import { FavoritesPanel } from './FavoritesPanel';
import { LanguagePanel } from './LanguagePanel';
import { Place, PlaceType } from '@/types/places';

interface RightMenuProps {
  isOpen: boolean;
  onClose: () => void;
  places: Place[];
  favorites: any[];
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
  onPlaceSelect: (place: Place) => void;
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
}

export function RightMenu({
  isOpen,
  onClose,
  places,
  favorites,
  selectedLanguage,
  onLanguageChange,
  onPlaceSelect,
  onFilterChange,
  currentFilters,
}: RightMenuProps) {
  const [activeTab, setActiveTab] = useState('analytics');

  return (
    <div
      className={cn(
        'fixed top-0 right-0 h-full bg-card border-l shadow-2xl z-[1002] transition-transform duration-300',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}
      style={{ width: '420px' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Explorer Menu</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-[calc(100%-73px)]">
        <TabsList className="grid w-full grid-cols-4 p-1 mx-4 mt-2" style={{ width: 'calc(100% - 32px)' }}>
          <TabsTrigger value="analytics" className="gap-1.5 text-xs">
            <BarChart3 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="filters" className="gap-1.5 text-xs">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Filters</span>
          </TabsTrigger>
          <TabsTrigger value="favorites" className="gap-1.5 text-xs">
            <Heart className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Saved</span>
          </TabsTrigger>
          <TabsTrigger value="language" className="gap-1.5 text-xs">
            <Globe className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Lang</span>
          </TabsTrigger>
        </TabsList>

        <div className="h-[calc(100%-60px)] overflow-hidden">
          <TabsContent value="analytics" className="h-full m-0 p-4">
            <AnalyticsPanel places={places} />
          </TabsContent>
          
          <TabsContent value="filters" className="h-full m-0 p-4">
            <FiltersPanel
              onFilterChange={onFilterChange}
              currentFilters={currentFilters}
              places={places}
            />
          </TabsContent>
          
          <TabsContent value="favorites" className="h-full m-0 p-4">
            <FavoritesPanel
              favorites={favorites}
              onPlaceSelect={onPlaceSelect}
            />
          </TabsContent>
          
          <TabsContent value="language" className="h-full m-0 p-4">
            <LanguagePanel
              selectedLanguage={selectedLanguage}
              onLanguageChange={onLanguageChange}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
