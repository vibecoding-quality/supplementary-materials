import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { LucideIcon } from 'lucide-react';

interface ProgressCardProps {
  title: string;
  value: number;
  total: number;
  icon: LucideIcon;
  gradient?: 'primary' | 'secondary' | 'success';
}

export function ProgressCard({ 
  title, 
  value, 
  total, 
  icon: Icon,
  gradient = 'primary'
}: ProgressCardProps) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  const getGradientClass = () => {
    switch (gradient) {
      case 'secondary': return 'from-secondary to-secondary/50';
      case 'success': return 'from-success to-success/50';
      default: return 'from-primary to-primary/50';
    }
  };

  return (
    <Card className="glass-card border-border/30 p-6 animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold mt-1">
            {value}<span className="text-lg text-muted-foreground">/{total}</span>
          </p>
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getGradientClass()} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{percentage}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${getGradientClass()} transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </Card>
  );
}
