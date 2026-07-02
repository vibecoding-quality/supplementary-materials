import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Play, Lightbulb, RotateCcw, CheckCircle } from 'lucide-react';

interface CodeEditorProps {
  title: string;
  description: string;
  starterCode: string | null;
  expectedOutput: string | null;
  hints: string[] | null;
  difficulty: string;
  onSubmit?: (code: string) => void;
}

export function CodeEditor({
  title,
  description,
  starterCode,
  expectedOutput,
  hints,
  difficulty,
  onSubmit
}: CodeEditorProps) {
  const [code, setCode] = useState(starterCode || '');
  const [currentHintIndex, setCurrentHintIndex] = useState(-1);
  const [showOutput, setShowOutput] = useState(false);

  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'beginner': return 'bg-success/20 text-success';
      case 'intermediate': return 'bg-secondary/20 text-secondary';
      case 'advanced': return 'bg-primary/20 text-primary';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleShowHint = () => {
    if (hints && currentHintIndex < hints.length - 1) {
      setCurrentHintIndex(currentHintIndex + 1);
    }
  };

  const handleReset = () => {
    setCode(starterCode || '');
    setCurrentHintIndex(-1);
    setShowOutput(false);
  };

  const handleRun = () => {
    setShowOutput(true);
    onSubmit?.(code);
  };

  return (
    <Card className="glass-card border-border/30 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-semibold">{title}</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor()}`}>
            {difficulty}
          </span>
        </div>
        <p className="text-muted-foreground">{description}</p>
      </div>

      {/* Code Editor */}
      <div className="p-6">
        <Textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="font-mono text-sm bg-background/50 min-h-[250px] resize-y"
          placeholder="Write your Java code here..."
        />

        {/* Hints */}
        {hints && hints.length > 0 && (
          <div className="mt-4">
            {currentHintIndex >= 0 && (
              <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-4 mb-3">
                <div className="flex items-center gap-2 text-secondary mb-2">
                  <Lightbulb className="w-4 h-4" />
                  <span className="font-medium">Hint {currentHintIndex + 1}</span>
                </div>
                <p className="text-sm text-foreground/80">
                  {hints[currentHintIndex]}
                </p>
              </div>
            )}
            {currentHintIndex < hints.length - 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShowHint}
                className="text-secondary hover:text-secondary"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                {currentHintIndex === -1 ? 'Show Hint' : 'Next Hint'}
              </Button>
            )}
          </div>
        )}

        {/* Expected Output */}
        {showOutput && expectedOutput && (
          <div className="mt-4 bg-muted/30 border border-border/30 rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">Expected Output</span>
            </div>
            <code className="text-sm font-mono text-foreground">
              {expectedOutput}
            </code>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex-1"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={handleRun}
            className="flex-1 bg-gradient-to-r from-secondary to-primary hover:opacity-90"
          >
            <Play className="w-4 h-4 mr-2" />
            Run Code
          </Button>
        </div>
      </div>
    </Card>
  );
}
