import { Quote } from "@/data/quotes";
import { Mail, Save } from "lucide-react";

interface QuoteDisplayProps {
  quote: Quote;
  mood: number;
  onReset: () => void;
  onSave: () => void;
  onSendEmail: () => void;
  isSaved?: boolean;
}

export function QuoteDisplay({ quote, mood, onReset, onSave, onSendEmail, isSaved }: QuoteDisplayProps) {
  const getMoodMessage = (value: number) => {
    if (value <= 3) return "Here's a word of encouragement for you today:";
    if (value <= 6) return "Here's your inspiration for today:";
    return "Keep shining! Here's a joyful word for you:";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2">
          {getMoodMessage(mood)}
        </p>
      </div>

      <div className="quote-card rounded-2xl p-6 space-y-4">
        <div className="text-4xl text-center animate-pulse-soft">✨</div>
        
        <blockquote className="text-lg md:text-xl text-foreground text-center leading-relaxed font-medium">
          "{quote.text}"
        </blockquote>
        
        <p className="text-sm text-secondary text-center font-medium">
          — {quote.reference}
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onSave}
          disabled={isSaved}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl 
                   bg-primary text-primary-foreground font-medium
                   hover:opacity-90 transition-all duration-200 
                   disabled:opacity-50 disabled:cursor-not-allowed
                   shadow-lg shadow-primary/20"
        >
          <Save className="w-4 h-4" />
          {isSaved ? "Saved!" : "Save"}
        </button>
        <button
          onClick={onSendEmail}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl 
                   bg-secondary text-secondary-foreground font-medium
                   hover:opacity-90 transition-all duration-200"
        >
          <Mail className="w-4 h-4" />
          Email
        </button>
      </div>

      <div className="text-center space-y-4">
        <p className="text-xs text-muted-foreground">
          May this verse guide your day with peace and joy.
        </p>
        
        <button
          onClick={onReset}
          className="text-sm text-primary hover:text-primary/80 transition-colors underline underline-offset-4"
        >
          Try another mood
        </button>
      </div>
    </div>
  );
}
