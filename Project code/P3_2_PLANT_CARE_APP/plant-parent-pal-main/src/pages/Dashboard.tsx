import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { UserPlant, CareReminder } from '@/types/plants';
import { calculateCareReminders } from '@/lib/care-utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PlantCard } from '@/components/plants/PlantCard';
import { AddPlantDialog } from '@/components/plants/AddPlantDialog';
import { CareReminders } from '@/components/plants/CareReminders';
import { PlantDetailDialog } from '@/components/plants/PlantDetailDialog';
import { 
  Plus, 
  LogOut, 
  Leaf, 
  Loader2,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function Dashboard() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [plants, setPlants] = useState<UserPlant[]>([]);
  const [reminders, setReminders] = useState<CareReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<UserPlant | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [plantToDelete, setPlantToDelete] = useState<UserPlant | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadPlants();
    }
  }, [user]);

  const loadPlants = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('user_plants')
      .select(`
        *,
        plant_species (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error loading plants',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      const typedPlants = (data || []) as UserPlant[];
      setPlants(typedPlants);
      setReminders(calculateCareReminders(typedPlants));
    }
    setLoading(false);
  };

  const handleWater = async (plant: UserPlant) => {
    const { error } = await supabase
      .from('user_plants')
      .update({ last_watered_at: new Date().toISOString() })
      .eq('id', plant.id);

    if (error) {
      toast({
        title: 'Error updating plant',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Plant watered! 💧',
        description: `${plant.nickname || plant.plant_species?.name || 'Your plant'} has been marked as watered.`
      });
      loadPlants();
    }
  };

  const handleFertilize = async (plant: UserPlant) => {
    const { error } = await supabase
      .from('user_plants')
      .update({ last_fertilized_at: new Date().toISOString() })
      .eq('id', plant.id);

    if (error) {
      toast({
        title: 'Error updating plant',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Plant fertilized! 🌱',
        description: `${plant.nickname || plant.plant_species?.name || 'Your plant'} has been marked as fertilized.`
      });
      loadPlants();
    }
  };

  const handleDelete = async () => {
    if (!plantToDelete) return;

    const { error } = await supabase
      .from('user_plants')
      .delete()
      .eq('id', plantToDelete.id);

    if (error) {
      toast({
        title: 'Error deleting plant',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Plant removed',
        description: 'The plant has been removed from your collection.'
      });
      loadPlants();
    }
    setDeleteDialogOpen(false);
    setPlantToDelete(null);
  };

  const handleReminderComplete = async (reminder: CareReminder) => {
    if (reminder.careType === 'water') {
      await handleWater(reminder.plant);
    } else if (reminder.careType === 'fertilize') {
      await handleFertilize(reminder.plant);
    } else if (reminder.careType === 'repot') {
      const { error } = await supabase
        .from('user_plants')
        .update({ last_repotted_at: new Date().toISOString() })
        .eq('id', reminder.plant.id);

      if (!error) {
        toast({
          title: 'Plant repotted! 🪴',
          description: `${reminder.plant.nickname || reminder.plant.plant_species?.name || 'Your plant'} has been marked as repotted.`
        });
        loadPlants();
      }
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const filteredPlants = plants.filter(plant => {
    const name = plant.nickname || plant.custom_name || plant.plant_species?.name || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (authLoading || (loading && plants.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Leaf className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-xl font-serif font-semibold">Plantwise</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Plant</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search your plants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Plants Grid */}
            {filteredPlants.length === 0 ? (
              <div className="text-center py-16">
                <span className="text-6xl mb-4 block animate-float">🌱</span>
                <h2 className="text-2xl font-serif mb-2">No plants yet</h2>
                <p className="text-muted-foreground mb-6">
                  Start building your plant collection!
                </p>
                <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Your First Plant
                </Button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {filteredPlants.map((plant) => (
                  <PlantCard
                    key={plant.id}
                    plant={plant}
                    onWater={handleWater}
                    onFertilize={handleFertilize}
                    onDelete={(p) => {
                      setPlantToDelete(p);
                      setDeleteDialogOpen(true);
                    }}
                    onView={(p) => {
                      setSelectedPlant(p);
                      setDetailDialogOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar - Care Reminders */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <CareReminders
                reminders={reminders}
                onMarkComplete={handleReminderComplete}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <AddPlantDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onPlantAdded={loadPlants}
      />

      <PlantDetailDialog
        plant={selectedPlant}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        onWater={() => {
          if (selectedPlant) handleWater(selectedPlant);
          setDetailDialogOpen(false);
        }}
        onFertilize={() => {
          if (selectedPlant) handleFertilize(selectedPlant);
          setDetailDialogOpen(false);
        }}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this plant?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {plantToDelete?.nickname || plantToDelete?.plant_species?.name || 'this plant'} from your collection. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
