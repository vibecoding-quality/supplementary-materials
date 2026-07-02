import { UserPlant, plantEmojis } from '@/types/plants';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Droplets, Sun, Thermometer, MoreVertical, AlertTriangle, Cat, Dog } from 'lucide-react';
import { getLightLabel } from '@/lib/care-utils';
import { getPlantImage } from '@/lib/plant-images';
import { format, differenceInDays } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PlantCardProps {
  plant: UserPlant;
  onWater: (plant: UserPlant) => void;
  onFertilize: (plant: UserPlant) => void;
  onDelete: (plant: UserPlant) => void;
  onView: (plant: UserPlant) => void;
}

export function PlantCard({ plant, onWater, onFertilize, onDelete, onView }: PlantCardProps) {
  const species = plant.plant_species;
  const displayName = plant.nickname || plant.custom_name || species?.name || 'Unknown Plant';
  
  const getPlantEmoji = (name: string) => plantEmojis[name] || '🌿';
  
  // Get image from our library or plant's custom image
  const plantImage = plant.image_url || (species ? getPlantImage(species.name) : undefined);
  
  const getWateringStatus = () => {
    if (!plant.last_watered_at || !species) {
      return { status: 'needs-water', label: 'Needs water', color: 'destructive' };
    }
    
    const daysSinceWatered = differenceInDays(new Date(), new Date(plant.last_watered_at));
    const daysUntilNext = species.watering_frequency_days - daysSinceWatered;
    
    if (daysUntilNext < 0) {
      return { status: 'overdue', label: `${Math.abs(daysUntilNext)} days overdue`, color: 'destructive' };
    } else if (daysUntilNext <= 1) {
      return { status: 'soon', label: 'Water soon', color: 'secondary' };
    } else {
      return { status: 'ok', label: `${daysUntilNext} days`, color: 'outline' };
    }
  };

  const isToxicToPets = () => {
    if (!species || !plant.pets || plant.pets.length === 0) return false;
    
    const hasCat = plant.pets.includes('cat');
    const hasDog = plant.pets.includes('dog');
    
    return (hasCat && species.toxic_to_cats) || (hasDog && species.toxic_to_dogs);
  };

  const waterStatus = getWateringStatus();

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 animate-fade-in">
      <div 
        className="relative h-48 bg-gradient-to-br from-sage to-sage-dark cursor-pointer overflow-hidden"
        onClick={() => onView(plant)}
      >
        {plantImage ? (
          <img 
            src={plantImage} 
            alt={displayName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-7xl opacity-80 group-hover:scale-110 transition-transform duration-300">
              {species ? getPlantEmoji(species.name) : '🌿'}
            </span>
          </div>
        )}
        
        {/* Toxicity Badge */}
        {isToxicToPets() && (
          <div className="absolute top-2 left-2 bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Pet warning
          </div>
        )}
        
        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="h-8 w-8 bg-card/80 backdrop-blur-sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover">
              <DropdownMenuItem onClick={() => onView(plant)}>View details</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onWater(plant)}>Mark as watered</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFertilize(plant)}>Mark as fertilized</DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(plant)}
                className="text-destructive focus:text-destructive"
              >
                Delete plant
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg line-clamp-1">{displayName}</h3>
          {species && (
            <p className="text-sm text-muted-foreground italic">{species.scientific_name}</p>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Badge variant={waterStatus.color as 'default' | 'destructive' | 'outline' | 'secondary'} className="gap-1">
            <Droplets className="h-3 w-3" />
            {waterStatus.label}
          </Badge>
          
          {/* Pet icons if any */}
          {plant.pets && plant.pets.length > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground">
              {plant.pets.includes('cat') && <Cat className="h-3.5 w-3.5" />}
              {plant.pets.includes('dog') && <Dog className="h-3.5 w-3.5" />}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {plant.light_condition && (
            <div className="flex items-center gap-1">
              <Sun className="h-3.5 w-3.5" />
              <span>{getLightLabel(plant.light_condition)}</span>
            </div>
          )}
          {(plant.min_room_temperature || plant.max_room_temperature) && (
            <div className="flex items-center gap-1">
              <Thermometer className="h-3.5 w-3.5" />
              <span>
                {plant.min_room_temperature ?? 18}–{plant.max_room_temperature ?? 24}°C
              </span>
            </div>
          )}
        </div>

        {plant.last_watered_at && (
          <p className="text-xs text-muted-foreground">
            Last watered: {format(new Date(plant.last_watered_at), 'MMM d, yyyy')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
