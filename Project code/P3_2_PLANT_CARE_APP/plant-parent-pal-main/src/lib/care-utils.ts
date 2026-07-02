import { UserPlant, CareReminder, CareType } from '@/types/plants';
import { differenceInDays, addDays } from 'date-fns';

export function calculateCareReminders(plants: UserPlant[]): CareReminder[] {
  const reminders: CareReminder[] = [];
  const today = new Date();

  for (const plant of plants) {
    const species = plant.plant_species;
    if (!species) continue;

    // Water reminder
    if (plant.last_watered_at) {
      const lastWatered = new Date(plant.last_watered_at);
      const nextWatering = addDays(lastWatered, species.watering_frequency_days);
      const daysUntil = differenceInDays(nextWatering, today);
      
      if (daysUntil <= 2) {
        reminders.push({
          plant,
          careType: 'water',
          dueDate: nextWatering,
          overdue: daysUntil < 0,
          daysOverdue: Math.abs(Math.min(0, daysUntil))
        });
      }
    } else {
      // Never watered - needs water now
      reminders.push({
        plant,
        careType: 'water',
        dueDate: today,
        overdue: true,
        daysOverdue: 0
      });
    }

    // Fertilize reminder
    if (species.fertilizing_frequency_days) {
      if (plant.last_fertilized_at) {
        const lastFertilized = new Date(plant.last_fertilized_at);
        const nextFertilizing = addDays(lastFertilized, species.fertilizing_frequency_days);
        const daysUntil = differenceInDays(nextFertilizing, today);
        
        if (daysUntil <= 7) {
          reminders.push({
            plant,
            careType: 'fertilize',
            dueDate: nextFertilizing,
            overdue: daysUntil < 0,
            daysOverdue: Math.abs(Math.min(0, daysUntil))
          });
        }
      }
    }

    // Repot reminder - every 12-18 months
    if (plant.last_repotted_at) {
      const lastRepotted = new Date(plant.last_repotted_at);
      const nextRepotting = addDays(lastRepotted, 365);
      const daysUntil = differenceInDays(nextRepotting, today);
      
      if (daysUntil <= 30) {
        reminders.push({
          plant,
          careType: 'repot',
          dueDate: nextRepotting,
          overdue: daysUntil < 0,
          daysOverdue: Math.abs(Math.min(0, daysUntil))
        });
      }
    }
  }

  // Sort by urgency (overdue first, then by due date)
  return reminders.sort((a, b) => {
    if (a.overdue && !b.overdue) return -1;
    if (!a.overdue && b.overdue) return 1;
    return a.dueDate.getTime() - b.dueDate.getTime();
  });
}

export function getCareTypeLabel(type: CareType): string {
  const labels: Record<CareType, string> = {
    water: 'Water',
    fertilize: 'Fertilize',
    repot: 'Repot',
    trim: 'Trim',
    rotate: 'Rotate',
    clean: 'Clean leaves'
  };
  return labels[type];
}

export function getCareTypeColor(type: CareType): string {
  const colors: Record<CareType, string> = {
    water: 'care-badge-water',
    fertilize: 'care-badge-fertilize',
    repot: 'care-badge-repot',
    trim: 'care-badge-trim',
    rotate: 'care-badge-trim',
    clean: 'care-badge-trim'
  };
  return colors[type];
}

export function getLightLabel(light: string | null): string {
  const labels: Record<string, string> = {
    low: 'Low light',
    medium: 'Medium light',
    bright: 'Bright indirect',
    direct: 'Direct sun'
  };
  return labels[light || 'medium'] || 'Medium light';
}
