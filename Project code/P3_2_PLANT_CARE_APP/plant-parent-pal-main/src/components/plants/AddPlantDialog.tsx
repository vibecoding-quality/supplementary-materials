import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { PlantSpecies, plantEmojis, PetType } from '@/types/plants';
import { getPlantImage } from '@/lib/plant-images';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, AlertTriangle, Cat, Dog, Bird, Rabbit, Thermometer, Sun, Droplets } from 'lucide-react';

interface AddPlantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlantAdded: () => void;
}

const petOptions: { value: PetType; label: string; icon: React.ReactNode }[] = [
  { value: 'cat', label: 'Cat', icon: <Cat className="h-4 w-4" /> },
  { value: 'dog', label: 'Dog', icon: <Dog className="h-4 w-4" /> },
  { value: 'bird', label: 'Bird', icon: <Bird className="h-4 w-4" /> },
  { value: 'rabbit', label: 'Rabbit', icon: <Rabbit className="h-4 w-4" /> },
  { value: 'hamster', label: 'Small Pet', icon: <span>🐹</span> },
];

export function AddPlantDialog({ open, onOpenChange, onPlantAdded }: AddPlantDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [species, setSpecies] = useState<PlantSpecies[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>('');
  const [selectedSpecies, setSelectedSpecies] = useState<PlantSpecies | null>(null);
  const [customName, setCustomName] = useState('');
  const [nickname, setNickname] = useState('');
  const [location, setLocation] = useState('');
  const [lightCondition, setLightCondition] = useState('medium');
  const [isHeatedRoom, setIsHeatedRoom] = useState(true);
  const [minTemperature, setMinTemperature] = useState(18);
  const [maxTemperature, setMaxTemperature] = useState(24);
  const [selectedPets, setSelectedPets] = useState<PetType[]>([]);
  const [notes, setNotes] = useState('');
  const [isCustomPlant, setIsCustomPlant] = useState(false);

  useEffect(() => {
    if (open) {
      loadSpecies();
    }
  }, [open]);

  useEffect(() => {
    if (selectedSpeciesId) {
      const found = species.find(s => s.id === selectedSpeciesId);
      setSelectedSpecies(found || null);
    } else {
      setSelectedSpecies(null);
    }
  }, [selectedSpeciesId, species]);

  const loadSpecies = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('plant_species')
      .select('*')
      .order('name');
    
    if (error) {
      toast({
        title: 'Error loading plants',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      setSpecies(data as PlantSpecies[]);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setSelectedSpeciesId('');
    setSelectedSpecies(null);
    setCustomName('');
    setNickname('');
    setLocation('');
    setLightCondition('medium');
    setIsHeatedRoom(true);
    setMinTemperature(18);
    setMaxTemperature(24);
    setSelectedPets([]);
    setNotes('');
    setIsCustomPlant(false);
  };

  const togglePet = (pet: PetType) => {
    setSelectedPets(prev => 
      prev.includes(pet) 
        ? prev.filter(p => p !== pet)
        : [...prev, pet]
    );
  };

  const isToxicToSelectedPets = () => {
    if (!selectedSpecies || selectedPets.length === 0) return false;
    
    const hasCat = selectedPets.includes('cat');
    const hasDog = selectedPets.includes('dog');
    
    return (hasCat && selectedSpecies.toxic_to_cats) || (hasDog && selectedSpecies.toxic_to_dogs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!selectedSpeciesId && !customName) {
      toast({
        title: 'Please select or name a plant',
        variant: 'destructive'
      });
      return;
    }

    if (minTemperature > maxTemperature) {
      toast({
        title: 'Temperature range invalid',
        description: 'Minimum temperature cannot be higher than maximum.',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);

    const { error } = await supabase.from('user_plants').insert({
      user_id: user.id,
      species_id: selectedSpeciesId || null,
      custom_name: isCustomPlant ? customName : null,
      nickname: nickname || null,
      location: location || null,
      light_condition: lightCondition,
      is_heated_room: isHeatedRoom,
      min_room_temperature: minTemperature,
      max_room_temperature: maxTemperature,
      pets: selectedPets,
      notes: notes || null
    });

    setSaving(false);

    if (error) {
      toast({
        title: 'Error adding plant',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Plant added! 🌱',
        description: 'Your new plant has been added to your collection.'
      });
      resetForm();
      onOpenChange(false);
      onPlantAdded();
    }
  };

  const getPlantEmoji = (name: string) => plantEmojis[name] || '🌿';
  const getLightLabel = (light: string) => {
    const labels: Record<string, string> = {
      low: 'Low light',
      medium: 'Medium',
      bright: 'Bright indirect',
      direct: 'Direct sun'
    };
    return labels[light] || light;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">Add a New Plant</DialogTitle>
          <DialogDescription>
            Choose from our catalog or add a custom plant
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Plant Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Plant Type</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsCustomPlant(!isCustomPlant);
                  setSelectedSpeciesId('');
                  setSelectedSpecies(null);
                  setCustomName('');
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                {isCustomPlant ? 'Choose from catalog' : 'Add custom plant'}
              </Button>
            </div>

            {isCustomPlant ? (
              <div className="space-y-2">
                <Label htmlFor="customName">Plant Name *</Label>
                <Input
                  id="customName"
                  placeholder="e.g., My Special Orchid"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  required={isCustomPlant}
                />
              </div>
            ) : (
              <Select value={selectedSpeciesId} onValueChange={setSelectedSpeciesId}>
                <SelectTrigger>
                  <SelectValue placeholder={loading ? 'Loading plants...' : 'Select a plant species'} />
                </SelectTrigger>
                <SelectContent className="max-h-60 bg-popover">
                  {species.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      <span className="mr-2">{getPlantEmoji(s.name)}</span>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Selected Plant Preview with Image */}
          {selectedSpecies && (
            <div className="rounded-lg overflow-hidden border animate-scale-in">
              {/* Plant Image */}
              <div className="h-32 bg-gradient-to-br from-sage to-sage-dark relative overflow-hidden">
                {getPlantImage(selectedSpecies.name) ? (
                  <img 
                    src={getPlantImage(selectedSpecies.name)} 
                    alt={selectedSpecies.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-6xl opacity-80">{getPlantEmoji(selectedSpecies.name)}</span>
                  </div>
                )}
              </div>
              
              <div className="p-4 space-y-3 bg-muted/30">
                <div>
                  <h4 className="font-semibold">{selectedSpecies.name}</h4>
                  <p className="text-sm text-muted-foreground italic">{selectedSpecies.scientific_name}</p>
                </div>
                
                {/* Plant Requirements */}
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline" className="gap-1">
                    <Thermometer className="h-3 w-3" />
                    {selectedSpecies.min_temperature}–{selectedSpecies.max_temperature}°C
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Sun className="h-3 w-3" />
                    {getLightLabel(selectedSpecies.light_requirement)}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Droplets className="h-3 w-3" />
                    Every {selectedSpecies.watering_frequency_days} days
                  </Badge>
                </div>
                
                {selectedSpecies.description && (
                  <p className="text-sm text-muted-foreground">{selectedSpecies.description}</p>
                )}
              
                {/* Toxicity Warning */}
                {(selectedSpecies.toxic_to_cats || selectedSpecies.toxic_to_dogs) && (
                  <div className="flex items-start gap-2 p-3 rounded-md bg-amber-50 border border-amber-200 text-amber-800">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium">Pet Safety Warning</p>
                      <p className="text-amber-700">
                        This plant is toxic to 
                        {selectedSpecies.toxic_to_cats && selectedSpecies.toxic_to_dogs 
                          ? ' cats and dogs'
                          : selectedSpecies.toxic_to_cats 
                            ? ' cats' 
                            : ' dogs'}
                        . Keep out of reach of pets.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pet Selection */}
          <div className="space-y-3">
            <Label>Pets in Your Home</Label>
            <div className="flex flex-wrap gap-2">
              {petOptions.map((pet) => (
                <button
                  key={pet.value}
                  type="button"
                  onClick={() => togglePet(pet.value)}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                    selectedPets.includes(pet.value)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-border hover:bg-muted'
                  }`}
                >
                  {pet.icon}
                  <span className="text-sm">{pet.label}</span>
                </button>
              ))}
            </div>
            
            {isToxicToSelectedPets() && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>Warning: This plant may be harmful to your pets!</span>
              </div>
            )}
          </div>

          {/* Nickname */}
          <div className="space-y-2">
            <Label htmlFor="nickname">Nickname (optional)</Label>
            <Input
              id="nickname"
              placeholder="Give your plant a fun name!"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g., Living room window, Bedroom shelf"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Light Condition */}
          <div className="space-y-2">
            <Label>Light Condition</Label>
            <Select value={lightCondition} onValueChange={setLightCondition}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="low">Low light (no direct sun)</SelectItem>
                <SelectItem value="medium">Medium light (bright indirect)</SelectItem>
                <SelectItem value="bright">Bright light (some direct sun)</SelectItem>
                <SelectItem value="direct">Direct sunlight (full sun)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Heated Room Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Heated Room</Label>
              <p className="text-sm text-muted-foreground">Is this room heated in winter?</p>
            </div>
            <Switch checked={isHeatedRoom} onCheckedChange={setIsHeatedRoom} />
          </div>

          {/* Temperature Range */}
          <div className="space-y-3">
            <Label>Room Temperature Range</Label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="minTemp" className="text-xs text-muted-foreground">Min</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="minTemp"
                    type="number"
                    min={5}
                    max={35}
                    value={minTemperature}
                    onChange={(e) => setMinTemperature(parseInt(e.target.value) || 18)}
                    className="w-20"
                  />
                  <span className="text-muted-foreground">°C</span>
                </div>
              </div>
              <span className="text-muted-foreground mt-5">to</span>
              <div className="flex-1">
                <Label htmlFor="maxTemp" className="text-xs text-muted-foreground">Max</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="maxTemp"
                    type="number"
                    min={5}
                    max={35}
                    value={maxTemperature}
                    onChange={(e) => setMaxTemperature(parseInt(e.target.value) || 24)}
                    className="w-20"
                  />
                  <span className="text-muted-foreground">°C</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any special care notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Add Plant
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
