import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCw, Code, CheckCircle, XCircle, Bookmark, BookmarkCheck } from 'lucide-react';

interface FlashcardProps {
  question: string;
  answer: string;
  codeExample?: string | null;
  difficulty: string;
  isSavedForLater?: boolean;
  onCorrect?: () => void;
  onIncorrect?: () => void;
  onToggleSave?: () => void;
}

export function Flashcard({ 
  question, 
  answer, 
  codeExample, 
  difficulty,
  isSavedForLater = false,
  onCorrect,
  onIncorrect,
  onToggleSave
}: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    setShowCode(false);
  };

  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'beginner': return 'bg-success/20 text-success';
      case 'intermediate': return 'bg-secondary/20 text-secondary';
      case 'advanced': return 'bg-primary/20 text-primary';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="flashcard-container w-full max-w-2xl mx-auto">
      <div 
        className={`flashcard-inner relative w-full min-h-[300px] cursor-pointer ${isFlipped ? 'flashcard-flipped' : ''}`}
        onClick={handleFlip}
      >
        {/* Front - Question */}
        <Card className="flashcard-front absolute inset-0 glass-card border-border/30 p-8 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor()}`}>
              {difficulty}
            </span>
            <div className="flex items-center gap-2">
              {isSavedForLater && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                  Saved
                </span>
              )}
              <RotateCw className="w-5 h-5 text-muted-foreground animate-pulse" />
            </div>
          </div>
          
          <div className="flex-1 flex items-center justify-center">
            <h3 className="text-xl md:text-2xl font-semibold text-center leading-relaxed">
              {question}
            </h3>
          </div>
          
          <p className="text-center text-sm text-muted-foreground mt-4">
            Click to reveal answer
          </p>
        </Card>

        {/* Back - Answer */}
        <Card className="flashcard-back absolute inset-0 glass-card border-border/30 p-8 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor()}`}>
              {difficulty}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSave?.();
                }}
                className={`h-8 px-2 ${isSavedForLater ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {isSavedForLater ? (
                  <BookmarkCheck className="w-5 h-5" />
                ) : (
                  <Bookmark className="w-5 h-5" />
                )}
              </Button>
              <RotateCw className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-lg text-center leading-relaxed mb-4">
              {answer}
            </p>
            
            {codeExample && (
              <div className="mt-4">
                {!showCode ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCode(true);
                    }}
                    className="mx-auto flex items-center gap-2"
                  >
                    <Code className="w-4 h-4" />
                    Show Code Example
                  </Button>
                ) : (
                  <pre className="code-block p-4 text-sm overflow-x-auto">
                    <code className="text-foreground/90">{codeExample}</code>
                  </pre>
                )}
              </div>
            )}
          </div>

          {/* Feedback buttons */}
          <div className="flex gap-3 justify-center mt-4" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleSave}
              className={`border-primary/50 ${isSavedForLater ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-primary'}`}
            >
              {isSavedForLater ? (
                <BookmarkCheck className="w-4 h-4 mr-2" />
              ) : (
                <Bookmark className="w-4 h-4 mr-2" />
              )}
              {isSavedForLater ? 'Saved' : 'Save for Later'}
            </Button>
            <Button
              variant="outline"
              className="border-destructive/50 text-destructive hover:bg-destructive/10"
              onClick={onIncorrect}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Need Practice
            </Button>
            <Button
              className="bg-success hover:bg-success/90"
              onClick={onCorrect}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Got It!
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
