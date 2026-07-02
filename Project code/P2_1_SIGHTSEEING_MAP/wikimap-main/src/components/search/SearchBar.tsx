import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X, MapPin, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { searchPlacesByQuery } from '@/lib/overpass';
import { cn } from '@/lib/utils';

interface SearchResult {
  lat: number;
  lng: number;
  name: string;
}

interface SearchBarProps {
  onLocationSelect: (lat: number, lng: number, name: string) => void;
  className?: string;
}

export function SearchBar({ onLocationSelect, className }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsSearching(true);
    try {
      const searchResults = await searchPlacesByQuery(searchQuery);
      setResults(searchResults);
      setIsOpen(searchResults.length > 0);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        handleSearch(value);
      }, 300);
    },
    [handleSearch]
  );

  const handleResultClick = useCallback(
    (result: SearchResult) => {
      onLocationSelect(result.lat, result.lng, result.name);
      setQuery(result.name.split(',')[0]);
      setIsOpen(false);
    },
    [onLocationSelect]
  );

  const handleClear = useCallback(() => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search cities, places, landmarks..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          className="h-14 pl-12 pr-12 text-base bg-card border-0 shadow-panel rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg"
            onClick={handleClear}
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-xl shadow-elevated border overflow-hidden z-50 animate-scale-in">
          <ul className="py-2 max-h-80 overflow-y-auto scrollbar-thin">
            {results.map((result, index) => (
              <li key={`${result.lat}-${result.lng}-${index}`}>
                <button
                  className="w-full px-4 py-3 text-left hover:bg-secondary/50 transition-colors flex items-start gap-3"
                  onClick={() => handleResultClick(result)}
                >
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-sm line-clamp-2">{result.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
