import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface SavedQuote {
  id: string;
  quote_text: string;
  quote_reference: string;
  mood: number;
  created_at: string;
}

export function useSavedQuotes() {
  const [quotes, setQuotes] = useState<SavedQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchQuotes = async () => {
    if (!user) {
      setQuotes([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("saved_quotes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setQuotes(data || []);
    } catch (error: any) {
      console.error("Error fetching quotes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, [user]);

  const saveQuote = async (quoteText: string, quoteReference: string, mood: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("saved_quotes")
        .insert({
          user_id: user.id,
          quote_text: quoteText,
          quote_reference: quoteReference,
          mood,
        });

      if (error) throw error;
      await fetchQuotes();
      toast({ title: "Quote saved!", description: "Your inspiration has been saved." });
    } catch (error: any) {
      console.error("Error saving quote:", error);
      toast({ 
        title: "Error", 
        description: "Failed to save quote",
        variant: "destructive" 
      });
    }
  };

  const deleteQuote = async (id: string) => {
    try {
      const { error } = await supabase
        .from("saved_quotes")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setQuotes(quotes.filter(q => q.id !== id));
      toast({ title: "Quote deleted", description: "The quote has been removed." });
    } catch (error: any) {
      console.error("Error deleting quote:", error);
      toast({ 
        title: "Error", 
        description: "Failed to delete quote",
        variant: "destructive" 
      });
    }
  };

  return { quotes, loading, saveQuote, deleteQuote, refetch: fetchQuotes };
}
