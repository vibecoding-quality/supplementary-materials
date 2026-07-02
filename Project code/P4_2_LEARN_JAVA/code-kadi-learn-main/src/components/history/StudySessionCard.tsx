import { Card } from '@/components/ui/card';
import { BookOpen, Code, Clock, Target } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface StudySessionCardProps {
  sessionType: string;
  topicTitle?: string;
  startedAt: string;
  endedAt?: string | null;
  cardsReviewed?: number;
  cardsCorrect?: number;
}

export function StudySessionCard({
  sessionType,
  topicTitle,
  startedAt,
  endedAt,
  cardsReviewed = 0,
  cardsCorrect = 0
}: StudySessionCardProps) {
  const isFlashcard = sessionType === 'flashcard';
  const accuracy = cardsReviewed > 0 ? Math.round((cardsCorrect / cardsReviewed) * 100) : 0;
  
  const duration = endedAt 
    ? Math.round((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 60000)
    : null;

  return (
    <Card className="glass-card border-border/30 p-4 hover:border-primary/30 transition-all-smooth">
      <div className="flex items-start gap-4">
        <div className={`
          w-10 h-10 rounded-lg flex items-center justify-center
          ${isFlashcard 
            ? 'bg-secondary/20 text-secondary' 
            : 'bg-primary/20 text-primary'
          }
        `}>
          {isFlashcard ? <BookOpen className="w-5 h-5" /> : <Code className="w-5 h-5" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium truncate">
              {isFlashcard ? 'Flashcard Study' : 'Code Exercise'}
            </h4>
            {topicTitle && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {topicTitle}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatDistanceToNow(new Date(startedAt), { addSuffix: true })}</span>
            </div>
            
            {duration !== null && (
              <div className="flex items-center gap-1">
                <span>{duration} min</span>
              </div>
            )}

            {cardsReviewed > 0 && (
              <div className="flex items-center gap-1">
                <Target className="w-3.5 h-3.5" />
                <span>{cardsCorrect}/{cardsReviewed} correct ({accuracy}%)</span>
              </div>
            )}
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          {format(new Date(startedAt), 'MMM d, h:mm a')}
        </div>
      </div>
    </Card>
  );
}
