import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MoodSlider } from "@/components/MoodSlider";
import { QuoteDisplay } from "@/components/QuoteDisplay";
import { QuoteHistory } from "@/components/QuoteHistory";
import { getQuoteForMood, Quote } from "@/data/quotes";
import { useAuth } from "@/hooks/useAuth";
import { useSavedQuotes, SavedQuote } from "@/hooks/useSavedQuotes";
import { useToast } from "@/hooks/use-toast";
import { LogOut, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  
  const { user, loading: authLoading, signOut } = useAuth();
  const { quotes, saveQuote, deleteQuote } = useSavedQuotes();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const handleMoodSelect = (mood: number) => {
    setTimeout(() => {
      setSelectedMood(mood);
      setQuote(getQuoteForMood(mood));
      setIsSaved(false);
    }, 500);
  };

  const handleReset = () => {
    setSelectedMood(null);
    setQuote(null);
    setIsSaved(false);
  };

  const handleSave = async () => {
    if (quote && selectedMood) {
      await saveQuote(quote.text, quote.reference, selectedMood);
      setIsSaved(true);
    }
  };

  const handleSendEmail = async (quoteToSend?: SavedQuote) => {
    const emailQuote = quoteToSend || (quote ? { 
      quote_text: quote.text, 
      quote_reference: quote.reference 
    } : null);
    
    if (!emailQuote || !user?.email) {
      toast({ 
        title: "Error", 
        description: "Unable to send email",
        variant: "destructive" 
      });
      return;
    }

    setSendingEmail(true);
    try {
      const { error } = await supabase.functions.invoke("send-quote-email", {
        body: {
          email: user.email,
          quoteText: emailQuote.quote_text,
          quoteReference: emailQuote.quote_reference,
        },
      });

      if (error) throw error;
      toast({ title: "Email sent!", description: "Check your inbox for your daily inspiration." });
    } catch (error: any) {
      console.error("Email error:", error);
      toast({ 
        title: "Email not configured", 
        description: "Please set up email sending with a RESEND_API_KEY.",
        variant: "destructive" 
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleHistorySendEmail = (savedQuote: SavedQuote) => {
    handleSendEmail(savedQuote);
  };

  if (authLoading) {
    return (
      <div className="gradient-bg flex items-center justify-center min-h-screen">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="gradient-bg flex flex-col items-center justify-center min-h-screen p-4">
      {/* Header */}
      <div className="fixed top-4 right-4 flex gap-2">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 text-foreground 
                   hover:bg-muted transition-colors text-sm"
        >
          <History className="w-4 h-4" />
          History ({quotes.length})
        </button>
        <button
          onClick={signOut}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 text-foreground 
                   hover:bg-muted transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      <div className="text-center mb-8 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Daily Inspiration
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Good Morning{user.email ? `, ${user.email.split("@")[0]}` : ""}
        </h1>
      </div>

      {/* Main Card */}
      <div className="glass-card w-full max-w-md rounded-2xl p-6 md:p-8">
        {showHistory ? (
          <QuoteHistory
            quotes={quotes}
            onDelete={deleteQuote}
            onSendEmail={handleHistorySendEmail}
            onClose={() => setShowHistory(false)}
          />
        ) : !quote ? (
          <MoodSlider onMoodSelect={handleMoodSelect} />
        ) : (
          <QuoteDisplay 
            quote={quote} 
            mood={selectedMood!} 
            onReset={handleReset}
            onSave={handleSave}
            onSendEmail={() => handleSendEmail()}
            isSaved={isSaved}
          />
        )}
      </div>

      {/* Footer */}
      <p className="mt-8 text-xs text-muted-foreground/60 text-center">
        Verses from the Holy Bible to start your day with purpose
      </p>
    </div>
  );
};

export default Index;
