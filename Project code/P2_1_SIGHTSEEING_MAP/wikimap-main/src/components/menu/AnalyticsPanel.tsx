import { useMemo } from 'react';
import { Place, PLACE_TYPE_LABELS, PLACE_TYPE_ICONS } from '@/types/places';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MapPin, Clock, TrendingUp, Layers, Hash, Globe, BarChart2 } from 'lucide-react';

interface AnalyticsPanelProps {
  places: Place[];
}

// Simple NLP: Extract common words from place names and tags
function extractKeywords(places: Place[]): { word: string; count: number }[] {
  const stopWords = new Set([
    'the', 'a', 'an', 'of', 'in', 'on', 'at', 'to', 'for', 'and', 'or', 'is',
    'de', 'la', 'le', 'du', 'des', 'von', 'van', 'di', 'da', 'st', 'street',
    'road', 'lane', 'avenue', 'way', 'place', 'square', 'park', 'building'
  ]);

  const wordCounts: Record<string, number> = {};

  places.forEach((place) => {
    // Extract words from name
    const nameWords = place.name.toLowerCase()
      .replace(/[^a-záéíóúñäöüß\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w));

    nameWords.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });

    // Extract key values from tags
    place.tags?.forEach(tag => {
      const [key] = tag.split(':');
      if (!stopWords.has(key) && key.length > 2) {
        wordCounts[key] = (wordCounts[key] || 0) + 1;
      }
    });
  });

  return Object.entries(wordCounts)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);
}

// Analyze name patterns
function analyzeNamePatterns(places: Place[]): { pattern: string; count: number; emoji: string }[] {
  const patterns: Record<string, { count: number; emoji: string }> = {
    'Saint/St.': { count: 0, emoji: '⛪' },
    'Royal/King/Queen': { count: 0, emoji: '👑' },
    'Old/Ancient': { count: 0, emoji: '🏛️' },
    'National': { count: 0, emoji: '🏳️' },
    'Memorial': { count: 0, emoji: '🕯️' },
    'Museum': { count: 0, emoji: '🖼️' },
    'Castle/Palace': { count: 0, emoji: '🏰' },
    'Garden/Park': { count: 0, emoji: '🌳' },
  };

  places.forEach(place => {
    const name = place.name.toLowerCase();
    if (/\b(saint|st\.?)\b/i.test(name)) patterns['Saint/St.'].count++;
    if (/\b(royal|king|queen|prince|princess)\b/i.test(name)) patterns['Royal/King/Queen'].count++;
    if (/\b(old|ancient|historic)\b/i.test(name)) patterns['Old/Ancient'].count++;
    if (/\bnational\b/i.test(name)) patterns['National'].count++;
    if (/\b(memorial|monument)\b/i.test(name)) patterns['Memorial'].count++;
    if (/\bmuseum\b/i.test(name)) patterns['Museum'].count++;
    if (/\b(castle|palace|fortress)\b/i.test(name)) patterns['Castle/Palace'].count++;
    if (/\b(garden|park|green)\b/i.test(name)) patterns['Garden/Park'].count++;
  });

  return Object.entries(patterns)
    .filter(([, data]) => data.count > 0)
    .map(([pattern, data]) => ({ pattern, ...data }))
    .sort((a, b) => b.count - a.count);
}

export function AnalyticsPanel({ places }: AnalyticsPanelProps) {
  const analytics = useMemo(() => {
    // Type distribution
    const typeDistribution: Record<string, number> = {};
    places.forEach((place) => {
      typeDistribution[place.type] = (typeDistribution[place.type] || 0) + 1;
    });

    const sortedTypes = Object.entries(typeDistribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    const maxCount = Math.max(...sortedTypes.map(([, count]) => count), 1);

    // Places with Wikipedia info
    const withWiki = places.filter((p) => p.wikipediaUrl).length;
    const wikiPercentage = places.length > 0 ? Math.round((withWiki / places.length) * 100) : 0;

    // Places with opening hours
    const withHours = places.filter((p) => p.openingHours).length;
    const hoursPercentage = places.length > 0 ? Math.round((withHours / places.length) * 100) : 0;

    // Average tags per place
    const totalTags = places.reduce((sum, p) => sum + (p.tags?.length || 0), 0);
    const avgTags = places.length > 0 ? (totalTags / places.length).toFixed(1) : '0';

    // Average name length
    const avgNameLength = places.length > 0 
      ? (places.reduce((sum, p) => sum + p.name.length, 0) / places.length).toFixed(0)
      : '0';

    // NLP analysis
    const keywords = extractKeywords(places);
    const namePatterns = analyzeNamePatterns(places);

    return {
      typeDistribution: sortedTypes,
      maxCount,
      withWiki,
      wikiPercentage,
      withHours,
      hoursPercentage,
      avgTags,
      avgNameLength,
      totalPlaces: places.length,
      keywords,
      namePatterns,
    };
  }, [places]);

  if (places.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <Layers className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-sm">No places to analyze</p>
        <p className="text-xs">Search for a location to see analytics</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full pr-2">
      <div className="space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-primary">
                <MapPin className="h-4 w-4" />
                <span className="text-2xl font-bold">{analytics.totalPlaces}</span>
              </div>
              <p className="text-xs text-muted-foreground">Total Places</p>
            </CardContent>
          </Card>
          
          <Card className="bg-secondary/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{analytics.avgTags}</span>
              </div>
              <p className="text-xs text-muted-foreground">Avg. Tags</p>
            </CardContent>
          </Card>

          <Card className="bg-secondary/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{analytics.avgNameLength}</span>
              </div>
              <p className="text-xs text-muted-foreground">Avg. Name Len</p>
            </CardContent>
          </Card>

          <Card className="bg-secondary/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{analytics.wikiPercentage}%</span>
              </div>
              <p className="text-xs text-muted-foreground">Has Wiki</p>
            </CardContent>
          </Card>
        </div>

        {/* Type Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              Place Types
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {analytics.typeDistribution.map(([type, count]) => (
              <div key={type} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span>{PLACE_TYPE_ICONS[type as keyof typeof PLACE_TYPE_ICONS]}</span>
                    <span className="text-xs text-muted-foreground">
                      {PLACE_TYPE_LABELS[type as keyof typeof PLACE_TYPE_LABELS]}
                    </span>
                  </div>
                  <span className="text-xs font-medium">{count}</span>
                </div>
                <Progress 
                  value={(count / analytics.maxCount) * 100} 
                  className="h-1.5"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Name Pattern Analysis */}
        {analytics.namePatterns.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">🔍 Name Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {analytics.namePatterns.map(({ pattern, count, emoji }) => (
                  <div
                    key={pattern}
                    className="flex items-center gap-1.5 px-2 py-1 bg-secondary rounded-full text-xs"
                  >
                    <span>{emoji}</span>
                    <span className="text-muted-foreground">{pattern}</span>
                    <span className="font-medium text-foreground">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Keyword Cloud */}
        {analytics.keywords.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">📊 Common Keywords</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {analytics.keywords.map(({ word, count }, i) => {
                  const size = i < 3 ? 'text-sm font-semibold' : i < 6 ? 'text-xs font-medium' : 'text-xs';
                  const opacity = i < 3 ? '' : i < 6 ? 'text-foreground/80' : 'text-muted-foreground';
                  return (
                    <span
                      key={word}
                      className={`px-2 py-0.5 bg-primary/10 rounded ${size} ${opacity}`}
                      title={`${count} occurrences`}
                    >
                      {word}
                    </span>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Quality */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">📈 Data Quality</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Wikipedia Coverage</span>
                <span className="font-medium">{analytics.wikiPercentage}%</span>
              </div>
              <Progress value={analytics.wikiPercentage} className="h-1.5" />
            </div>
            
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Opening Hours</span>
                </div>
                <span className="font-medium">{analytics.hoursPercentage}%</span>
              </div>
              <Progress value={analytics.hoursPercentage} className="h-1.5" />
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
