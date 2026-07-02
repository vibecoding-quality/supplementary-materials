import { useState, useEffect } from 'react';
import { Place, PLACE_TYPE_ICONS, PLACE_TYPE_LABELS } from '@/types/places';
import { searchWikipedia, getWikipediaExtract } from '@/lib/wikipedia';
import { MapPin, ExternalLink, Clock, X, Loader2, Navigation, Heart, Share2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useSharePlace } from '@/hooks/useSharePlace';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface PlaceDetailProps {
  place: Place;
  onClose: () => void;
  language?: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

interface WikipediaData {
  extract: string;
  thumbnail?: string;
  pageUrl?: string;
  languageCount?: number;
}

export function PlaceDetail({ 
  place, 
  onClose, 
  language = 'en',
  isFavorite = false,
  onToggleFavorite,
}: PlaceDetailProps) {
  const [wikiData, setWikiData] = useState<WikipediaData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { createShareLink } = useSharePlace(user?.id);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchWikiData() {
      setIsLoading(true);
      setWikiData(null);

      try {
        if (place.wikipediaUrl) {
          const data = await getWikipediaExtract(place.wikipediaUrl, language);
          if (data) {
            setWikiData({
              extract: data.extract,
              thumbnail: data.thumbnail,
              pageUrl: place.wikipediaUrl,
              languageCount: data.languageCount,
            });
          }
        } else {
          const result = await searchWikipedia(place.name, place.lat, place.lng, language);
          if (result) {
            setWikiData({
              extract: result.extract,
              thumbnail: result.thumbnail,
              pageUrl: result.pageUrl,
              languageCount: result.languageCount,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching Wikipedia data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchWikiData();
  }, [place, language]);

  const icon = PLACE_TYPE_ICONS[place.type];
  const typeLabel = PLACE_TYPE_LABELS[place.type];

  const openInMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;
    window.open(url, '_blank');
  };

  const handleShare = async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to share places.',
      });
      return;
    }

    const { shareCode, error } = await createShareLink(place);
    if (error) {
      toast({
        title: 'Error sharing',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    const shareUrl = `${window.location.origin}/share/${shareCode}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: place.name,
          text: `Check out ${place.name} on Atlas!`,
          url: shareUrl,
        });
      } catch {
        // User cancelled or share failed, copy to clipboard instead
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: 'Link copied!',
          description: 'Share link has been copied to clipboard.',
        });
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: 'Link copied!',
        description: 'Share link has been copied to clipboard.',
      });
    }
  };

  return (
    <div className="h-full flex flex-col bg-card animate-slide-in-right">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-lg font-semibold truncate pr-2">{place.name}</h2>
          {wikiData?.languageCount && wikiData.languageCount > 1 && (
            <Badge variant="secondary" className="flex items-center gap-1 flex-shrink-0">
              <Globe className="h-3 w-3" />
              {wikiData.languageCount}
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="icon" className="rounded-lg flex-shrink-0" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Image */}
          {wikiData?.thumbnail && (
            <div className="rounded-xl overflow-hidden aspect-video bg-secondary">
              <img
                src={wikiData.thumbnail}
                alt={place.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Type & Location */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-xl">
              {icon}
            </div>
            <div>
              <p className="font-medium">{typeLabel}</p>
              {place.address && (
                <p className="text-sm text-muted-foreground">{place.address}</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button 
              variant="default" 
              className="flex-1 gap-2" 
              onClick={openInMaps}
            >
              <Navigation className="h-4 w-4" />
              Directions
            </Button>
            <Button 
              variant={isFavorite ? "destructive" : "secondary"} 
              size="icon" 
              className="rounded-lg"
              onClick={onToggleFavorite}
            >
              <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
            </Button>
            <Button variant="secondary" size="icon" className="rounded-lg" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Opening Hours */}
          {place.openingHours && (
            <div className="p-3 bg-secondary/50 rounded-xl">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Hours:</span>
                <span className="text-muted-foreground">{place.openingHours}</span>
              </div>
            </div>
          )}

          {/* Description / Wikipedia */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              About
            </h3>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : wikiData?.extract ? (
              <div className="space-y-3">
                <p className="text-sm leading-relaxed text-foreground/90">
                  {wikiData.extract}
                </p>
                {wikiData.pageUrl && (
                  <a
                    href={wikiData.pageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    Read more on Wikipedia
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            ) : place.description ? (
              <p className="text-sm leading-relaxed text-foreground/90">
                {place.description}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No additional information available.
              </p>
            )}
          </div>

          {/* Tags */}
          {place.tags && place.tags.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                Details
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {place.tags.slice(0, 8).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-secondary rounded-md text-xs text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Coordinates */}
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              {place.lat.toFixed(5)}, {place.lng.toFixed(5)}
            </p>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
