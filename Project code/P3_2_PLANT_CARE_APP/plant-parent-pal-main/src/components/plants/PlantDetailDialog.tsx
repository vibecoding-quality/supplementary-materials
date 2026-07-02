import { UserPlant, plantEmojis } from '@/types/plants';
import { getLightLabel } from '@/lib/care-utils';
import { getPlantImage, analyzeLivingConditions, getSeasonalAdvice, getCurrentSeason } from '@/lib/plant-images';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Droplets, 
  Sun, 
  Thermometer, 
  Home, 
  MapPin, 
  Calendar,
  Leaf,
  Info,
  AlertTriangle,
  Cat,
  Dog,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Snowflake,
  CloudSun,
  Flower2,
  TreeDeciduous
} from 'lucide-react';

interface PlantDetailDialogProps {
  plant: UserPlant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWater: () => void;
  onFertilize: () => void;
}

const seasonIcons = {
  spring: Flower2,
  summer: Sun,
  autumn: TreeDeciduous,
  winter: Snowflake
};

export function PlantDetailDialog({ 
  plant, 
  open, 
  onOpenChange, 
  onWater, 
  onFertilize 
}: PlantDetailDialogProps) {
  if (!plant) return null;

  const species = plant.plant_species;
  const displayName = plant.nickname || plant.custom_name || species?.name || 'Unknown Plant';
  const getPlantEmoji = (name: string) => plantEmojis[name] || '🌿';
  
  // Get image from our library or plant's custom image
  const plantImage = plant.image_url || (species ? getPlantImage(species.name) : undefined);

  const isToxicToPets = () => {
    if (!species || !plant.pets || plant.pets.length === 0) return false;
    
    const hasCat = plant.pets.includes('cat');
    const hasDog = plant.pets.includes('dog');
    
    return (hasCat && species.toxic_to_cats) || (hasDog && species.toxic_to_dogs);
  };

  // Analyze living conditions
  const livingConditions = species ? analyzeLivingConditions(
    species.min_temperature,
    species.max_temperature,
    species.light_requirement,
    species.humidity_preference,
    plant.min_room_temperature,
    plant.max_room_temperature,
    plant.light_condition,
    plant.is_heated_room
  ) : [];

  // Get seasonal advice
  const seasonalAdvice = species ? getSeasonalAdvice(
    species.min_temperature,
    species.max_temperature,
    species.light_requirement,
    species.humidity_preference,
    plant.is_heated_room
  ) : [];

  const currentSeason = getCurrentSeason();
  const currentSeasonAdvice = seasonalAdvice.find(s => s.season === currentSeason);

  const getStatusIcon = (status: 'good' | 'warning' | 'danger') => {
    switch (status) {
      case 'good': return <CheckCircle2 className="h-4 w-4 text-primary" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'danger': return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
        {/* Header Image */}
        <div className="relative h-56 bg-gradient-to-br from-sage to-sage-dark">
          {plantImage ? (
            <img 
              src={plantImage} 
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-9xl opacity-80">
                {species ? getPlantEmoji(species.name) : '🌿'}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          
          {/* Toxicity Warning Badge */}
          {isToxicToPets() && (
            <div className="absolute top-4 left-4 bg-amber-500 text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4" />
              Toxic to your pets
            </div>
          )}
        </div>

        <div className="px-6 pb-6 -mt-12 relative">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-serif">{displayName}</DialogTitle>
            {species && (
              <DialogDescription className="italic">{species.scientific_name}</DialogDescription>
            )}
          </DialogHeader>

          {/* Pet Toxicity Warning */}
          {species && (species.toxic_to_cats || species.toxic_to_dogs) && (
            <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Pet Safety Warning</p>
                  <p className="text-amber-700">
                    This plant is toxic to 
                    {species.toxic_to_cats && species.toxic_to_dogs 
                      ? ' cats and dogs'
                      : species.toxic_to_cats 
                        ? ' cats' 
                        : ' dogs'}
                    . Keep out of reach.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Pets */}
          {plant.pets && plant.pets.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-muted-foreground">Your pets:</span>
              <div className="flex gap-1">
                {plant.pets.includes('cat') && (
                  <Badge variant="secondary" className="gap-1">
                    <Cat className="h-3 w-3" /> Cat
                  </Badge>
                )}
                {plant.pets.includes('dog') && (
                  <Badge variant="secondary" className="gap-1">
                    <Dog className="h-3 w-3" /> Dog
                  </Badge>
                )}
                {plant.pets.includes('bird') && (
                  <Badge variant="secondary">🐦 Bird</Badge>
                )}
                {plant.pets.includes('rabbit') && (
                  <Badge variant="secondary">🐰 Rabbit</Badge>
                )}
                {plant.pets.includes('hamster') && (
                  <Badge variant="secondary">🐹 Small Pet</Badge>
                )}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex gap-3 mb-6">
            <Button onClick={onWater} className="flex-1 gap-2">
              <Droplets className="h-4 w-4" />
              Water Now
            </Button>
            <Button onClick={onFertilize} variant="outline" className="flex-1 gap-2">
              <Leaf className="h-4 w-4" />
              Fertilize
            </Button>
          </div>

          {/* Tabs for different sections */}
          <Tabs defaultValue="conditions" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="conditions">Conditions</TabsTrigger>
              <TabsTrigger value="seasonal">Seasonal</TabsTrigger>
              <TabsTrigger value="care">Care</TabsTrigger>
            </TabsList>

            {/* Living Conditions Tab */}
            <TabsContent value="conditions" className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <CloudSun className="h-4 w-4" />
                  Living Conditions Match
                </h4>
                
                {livingConditions.map((condition, index) => (
                  <div 
                    key={condition.condition}
                    className={`p-3 rounded-lg border ${
                      condition.status === 'good' ? 'bg-primary/5 border-primary/20' :
                      condition.status === 'warning' ? 'bg-amber-50 border-amber-200' :
                      'bg-destructive/5 border-destructive/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {getStatusIcon(condition.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-sm">{condition.condition}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 grid grid-cols-2 gap-2">
                          <div>
                            <span className="opacity-70">Plant needs:</span>
                            <span className="ml-1 font-medium">{condition.plantNeeds}</span>
                          </div>
                          <div>
                            <span className="opacity-70">You provide:</span>
                            <span className="ml-1 font-medium">{condition.userProvides}</span>
                          </div>
                        </div>
                        {condition.advice && (
                          <p className="text-xs mt-2 text-foreground/80">{condition.advice}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Current Location */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                {plant.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{plant.location}</span>
                  </div>
                )}
                {plant.is_heated_room !== null && (
                  <div className="flex items-center gap-2 text-sm">
                    <Home className="h-4 w-4 text-muted-foreground" />
                    <span>{plant.is_heated_room ? 'Heated room' : 'Unheated room'}</span>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Seasonal Care Tab */}
            <TabsContent value="seasonal" className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">Year-round care guide</h4>
              
              {/* All Seasons - current season first */}
              {[...seasonalAdvice].sort((a, b) => {
                if (a.season === currentSeason) return -1;
                if (b.season === currentSeason) return 1;
                const order = ['spring', 'summer', 'autumn', 'winter'];
                return order.indexOf(a.season) - order.indexOf(b.season);
              }).map((advice) => {
                const SeasonIcon = seasonIcons[advice.season];
                const isCurrent = advice.season === currentSeason;
                
                return (
                  <div 
                    key={advice.season} 
                    className={`p-4 rounded-lg border ${
                      isCurrent 
                        ? 'bg-primary/5 border-primary/20' 
                        : 'bg-muted/30 border-border'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <SeasonIcon className={`h-5 w-5 ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`} />
                      <h4 className="font-medium">{advice.title}</h4>
                      {isCurrent && (
                        <Badge variant="secondary" className="ml-auto text-xs">Current</Badge>
                      )}
                      {advice.shouldMove && (
                        <Badge variant={isCurrent ? "secondary" : "outline"} className={`text-xs ${isCurrent ? '' : 'ml-auto'}`}>
                          {isCurrent ? 'Action needed' : 'Consider moving'}
                        </Badge>
                      )}
                    </div>
                    
                    {advice.shouldMove && advice.moveAdvice && (
                      <div className="mb-3 p-2 rounded bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                        <span>{advice.moveAdvice}</span>
                      </div>
                    )}
                    
                    <ul className="text-sm space-y-1.5">
                      {advice.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className={isCurrent ? 'text-primary mt-0.5' : 'text-muted-foreground mt-0.5'}>•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </TabsContent>

            {/* Care History Tab */}
            <TabsContent value="care" className="space-y-4">
              {/* Care Schedule */}
              {species && (
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Care Schedule
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <Droplets className="h-3 w-3" />
                      Water every {species.watering_frequency_days} days
                    </Badge>
                    {species.fertilizing_frequency_days && (
                      <Badge variant="secondary" className="gap-1">
                        <Leaf className="h-3 w-3" />
                        Fertilize every {species.fertilizing_frequency_days} days
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Care History */}
              <div className="space-y-3">
                <h4 className="font-medium">Care History</h4>
                <div className="space-y-2 text-sm">
                  {plant.last_watered_at && (
                    <p className="flex items-center gap-2">
                      <Droplets className="h-3.5 w-3.5 text-primary" />
                      Last watered: {format(new Date(plant.last_watered_at), 'MMMM d, yyyy')}
                    </p>
                  )}
                  {plant.last_fertilized_at && (
                    <p className="flex items-center gap-2">
                      <Leaf className="h-3.5 w-3.5 text-primary" />
                      Last fertilized: {format(new Date(plant.last_fertilized_at), 'MMMM d, yyyy')}
                    </p>
                  )}
                  {plant.last_repotted_at && (
                    <p className="flex items-center gap-2">
                      <Home className="h-3.5 w-3.5 text-primary" />
                      Last repotted: {format(new Date(plant.last_repotted_at), 'MMMM d, yyyy')}
                    </p>
                  )}
                  {plant.acquired_date && (
                    <p className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      Acquired: {format(new Date(plant.acquired_date), 'MMMM d, yyyy')}
                    </p>
                  )}
                </div>
              </div>

              {/* Care Tips */}
              {species?.care_tips && (
                <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary" />
                    Care Tips
                  </h4>
                  <p className="text-sm text-muted-foreground">{species.care_tips}</p>
                </div>
              )}

              {/* Notes */}
              {plant.notes && (
                <div className="space-y-2">
                  <h4 className="font-medium">Your Notes</h4>
                  <p className="text-sm text-muted-foreground">{plant.notes}</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
