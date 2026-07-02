import { CareReminder } from '@/types/plants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCareTypeLabel, getCareTypeColor } from '@/lib/care-utils';
import { format, formatDistanceToNow } from 'date-fns';
import { Bell, Check, Droplets, Leaf, Scissors, RotateCw } from 'lucide-react';

interface CareRemindersProps {
  reminders: CareReminder[];
  onMarkComplete: (reminder: CareReminder) => void;
}

const careIcons = {
  water: Droplets,
  fertilize: Leaf,
  repot: RotateCw,
  trim: Scissors,
  rotate: RotateCw,
  clean: Leaf
};

export function CareReminders({ reminders, onMarkComplete }: CareRemindersProps) {
  if (reminders.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5 text-primary" />
            Care Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <span className="text-4xl mb-4 block">🌿</span>
            <p>All your plants are happy!</p>
            <p className="text-sm">No care needed right now.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="h-5 w-5 text-primary" />
          Care Reminders
          {reminders.length > 0 && (
            <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
              {reminders.length}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {reminders.slice(0, 5).map((reminder, index) => {
          const Icon = careIcons[reminder.careType];
          const plantName = reminder.plant.nickname || 
            reminder.plant.custom_name || 
            reminder.plant.plant_species?.name || 
            'Unknown Plant';
          
          return (
            <div
              key={`${reminder.plant.id}-${reminder.careType}-${index}`}
              className={`flex items-center gap-3 p-3 rounded-lg border animate-fade-in ${
                reminder.overdue ? 'bg-destructive/5 border-destructive/20' : 'bg-muted/50'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`p-2 rounded-full ${getCareTypeColor(reminder.careType)}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{plantName}</p>
                <p className="text-sm text-muted-foreground">
                  {getCareTypeLabel(reminder.careType)}
                  {reminder.overdue ? (
                    <span className="text-destructive ml-1">
                      • {reminder.daysOverdue} days overdue
                    </span>
                  ) : (
                    <span className="ml-1">
                      • {formatDistanceToNow(reminder.dueDate, { addSuffix: true })}
                    </span>
                  )}
                </p>
              </div>
              <Button
                size="sm"
                variant={reminder.overdue ? 'default' : 'outline'}
                onClick={() => onMarkComplete(reminder)}
                className="shrink-0"
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
        
        {reminders.length > 5 && (
          <p className="text-center text-sm text-muted-foreground pt-2">
            +{reminders.length - 5} more reminders
          </p>
        )}
      </CardContent>
    </Card>
  );
}
