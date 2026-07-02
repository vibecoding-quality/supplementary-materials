import { format } from "date-fns";
import { Trash2, Mail, ChevronLeft, ChevronRight } from "lucide-react";
import { SavedQuote } from "@/hooks/useSavedQuotes";
import { useState } from "react";

interface QuoteHistoryProps {
  quotes: SavedQuote[];
  onDelete: (id: string) => void;
  onSendEmail: (quote: SavedQuote) => void;
  onClose: () => void;
}

export function QuoteHistory({ quotes, onDelete, onSendEmail, onClose }: QuoteHistoryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (quotes.length === 0) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="text-center py-8">
          <p className="text-muted-foreground">No saved quotes yet.</p>
          <p className="text-sm text-muted-foreground mt-2">Get your first inspiration!</p>
        </div>
        <button
          onClick={onClose}
          className="w-full py-3 px-6 rounded-xl bg-muted text-foreground font-medium
                   hover:bg-muted/80 transition-all duration-200"
        >
          Get Today's Quote
        </button>
      </div>
    );
  }

  const currentQuote = quotes[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < quotes.length - 1;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="text-xl font-medium text-foreground">Your Saved Quotes</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {currentIndex + 1} of {quotes.length}
        </p>
      </div>

      <div className="quote-card rounded-2xl p-5 space-y-4">
        <div className="flex justify-between items-start">
          <span className="text-xs text-muted-foreground">
            {format(new Date(currentQuote.created_at), "MMM d, yyyy")}
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
            Mood: {currentQuote.mood}/10
          </span>
        </div>

        <blockquote className="text-lg text-foreground text-center leading-relaxed">
          "{currentQuote.quote_text}"
        </blockquote>

        <p className="text-sm text-secondary text-center font-medium">
          — {currentQuote.quote_reference}
        </p>

        <div className="flex justify-center gap-2 pt-2">
          <button
            onClick={() => onSendEmail(currentQuote)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 text-primary 
                     hover:bg-primary/30 transition-colors text-sm"
          >
            <Mail className="w-4 h-4" />
            Send to Email
          </button>
          <button
            onClick={() => onDelete(currentQuote.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/20 text-destructive 
                     hover:bg-destructive/30 transition-colors text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Navigation arrows */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setCurrentIndex(currentIndex - 1)}
          disabled={!hasPrev}
          className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm
                   disabled:opacity-30 disabled:cursor-not-allowed
                   hover:bg-muted transition-colors text-foreground"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>
        <button
          onClick={() => setCurrentIndex(currentIndex + 1)}
          disabled={!hasNext}
          className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm
                   disabled:opacity-30 disabled:cursor-not-allowed
                   hover:bg-muted transition-colors text-foreground"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <button
        onClick={onClose}
        className="w-full py-3 px-6 rounded-xl bg-muted text-foreground font-medium
                 hover:bg-muted/80 transition-all duration-200"
      >
        Get New Quote
      </button>
    </div>
  );
}
