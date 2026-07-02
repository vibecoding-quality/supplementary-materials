import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Code, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TopicCardProps {
  id: string;
  title: string;
  description: string | null;
  category: string;
  flashcardCount?: number;
  exerciseCount?: number;
  masteryLevel?: number;
}

export function TopicCard({
  id,
  title,
  description,
  category,
  flashcardCount = 0,
  exerciseCount = 0,
  masteryLevel = 0
}: TopicCardProps) {
  const getCategoryColor = () => {
    switch (category) {
      case 'Basics': return 'bg-success/20 text-success';
      case 'OOP': return 'bg-primary/20 text-primary';
      case 'OOP Basics': return 'bg-primary/20 text-primary';
      case 'Data Structures': return 'bg-secondary/20 text-secondary';
      case 'Advanced': return 'bg-accent/20 text-accent';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="glass-card border-border/30 p-6 hover:border-primary/30 transition-all-smooth group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor()}`}>
            {category}
          </span>
          <h3 className="text-lg font-semibold mt-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
        </div>
        
        {/* Mastery indicator */}
        {masteryLevel > 0 && (
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={`w-2 h-6 rounded-full ${
                  level <= masteryLevel 
                    ? 'bg-gradient-to-t from-primary to-secondary' 
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {description && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {description}
        </p>
      )}

      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
        <div className="flex items-center gap-1">
          <BookOpen className="w-4 h-4" />
          <span>{flashcardCount} cards</span>
        </div>
        <div className="flex items-center gap-1">
          <Code className="w-4 h-4" />
          <span>{exerciseCount} exercises</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Link to={`/flashcards?topic=${id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            <BookOpen className="w-4 h-4 mr-2" />
            Study
          </Button>
        </Link>
        <Link to={`/exercises?topic=${id}`} className="flex-1">
          <Button size="sm" className="w-full bg-gradient-to-r from-secondary to-primary hover:opacity-90">
            <Code className="w-4 h-4 mr-2" />
            Practice
          </Button>
        </Link>
      </div>
    </Card>
  );
}
