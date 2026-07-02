import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CardState {
  isRead: boolean;
  isStarred: boolean;
}

interface CardProgressState {
  [cardId: string]: CardState;
}

const STORAGE_KEY = "poker-learning-progress";

export function useCardProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<CardProgressState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch progress from database when user logs in
  useEffect(() => {
    if (user) {
      fetchProgressFromDb();
    }
  }, [user]);

  // Save to localStorage as backup
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const fetchProgressFromDb = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("card_progress")
        .select("card_id, is_read, is_starred")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching progress:", error);
        return;
      }

      if (data && data.length > 0) {
        const dbProgress: CardProgressState = {};
        data.forEach((item) => {
          dbProgress[item.card_id] = {
            isRead: item.is_read,
            isStarred: item.is_starred,
          };
        });
        setProgress(dbProgress);
      }
    } catch (error) {
      console.error("Error fetching progress:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveToDb = useCallback(async (cardId: string, isRead: boolean, isStarred: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("card_progress")
        .upsert(
          {
            user_id: user.id,
            card_id: cardId,
            is_read: isRead,
            is_starred: isStarred,
          },
          {
            onConflict: "user_id,card_id",
          }
        );

      if (error) {
        console.error("Error saving progress:", error);
      }
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  }, [user]);

  const toggleRead = useCallback((cardId: string) => {
    setProgress((prev) => {
      const newIsRead = !prev[cardId]?.isRead;
      const isStarred = prev[cardId]?.isStarred ?? false;
      
      // Save to database if user is logged in
      if (user) {
        saveToDb(cardId, newIsRead, isStarred);
      }

      return {
        ...prev,
        [cardId]: {
          isRead: newIsRead,
          isStarred: isStarred,
        },
      };
    });
  }, [user, saveToDb]);

  const toggleStar = useCallback((cardId: string) => {
    setProgress((prev) => {
      const isRead = prev[cardId]?.isRead ?? false;
      const newIsStarred = !prev[cardId]?.isStarred;
      
      // Save to database if user is logged in
      if (user) {
        saveToDb(cardId, isRead, newIsStarred);
      }

      return {
        ...prev,
        [cardId]: {
          isRead: isRead,
          isStarred: newIsStarred,
        },
      };
    });
  }, [user, saveToDb]);

  const isRead = useCallback((cardId: string) => progress[cardId]?.isRead ?? false, [progress]);
  const isStarred = useCallback((cardId: string) => progress[cardId]?.isStarred ?? false, [progress]);

  return { toggleRead, toggleStar, isRead, isStarred, isLoading };
}
