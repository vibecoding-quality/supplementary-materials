import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface GameProgressHook {
  visitedImages: Set<string>;
  loading: boolean;
  saveVisit: (imageId: string) => Promise<void>;
  loadProgress: () => Promise<void>;
  resetProgress: () => Promise<void>;
  totalVisited: number;
}

export const useGameProgress = (): GameProgressHook => {
  const { user } = useAuth();
  const [visitedImages, setVisitedImages] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const loadProgress = useCallback(async () => {
    if (!user) {
      setVisitedImages(new Set());
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('game_progress')
        .select('image_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error loading progress:', error);
        return;
      }

      const visited = new Set(data?.map(item => item.image_id) || []);
      setVisitedImages(visited);

      // Update profile total
      await supabase
        .from('profiles')
        .update({ total_visited: visited.size })
        .eq('user_id', user.id);
    } catch (err) {
      console.error('Error loading progress:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const saveVisit = useCallback(async (imageId: string) => {
    // Check if already visited locally first
    if (visitedImages.has(imageId)) {
      return;
    }

    // Optimistically update local state
    setVisitedImages(prev => new Set([...prev, imageId]));

    if (!user) {
      // For non-logged in users, just track locally
      return;
    }

    try {
      // Check if already exists in database
      const { data: existing } = await supabase
        .from('game_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('image_id', imageId)
        .maybeSingle();

      if (existing) {
        // Already saved
        return;
      }

      // Insert new record
      const { error } = await supabase
        .from('game_progress')
        .insert({
          user_id: user.id,
          image_id: imageId,
        });

      if (error) {
        console.error('Error saving visit:', error);
        return;
      }

      // Update profile total
      const newTotal = visitedImages.size + 1;
      await supabase
        .from('profiles')
        .update({ total_visited: newTotal })
        .eq('user_id', user.id);
    } catch (err) {
      console.error('Error saving visit:', err);
    }
  }, [user, visitedImages]);

  const resetProgress = useCallback(async () => {
    if (!user) {
      setVisitedImages(new Set());
      return;
    }

    try {
      await supabase
        .from('game_progress')
        .delete()
        .eq('user_id', user.id);

      await supabase
        .from('profiles')
        .update({ total_visited: 0 })
        .eq('user_id', user.id);

      setVisitedImages(new Set());
    } catch (err) {
      console.error('Error resetting progress:', err);
    }
  }, [user]);

  // Load progress when user changes
  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  return {
    visitedImages,
    loading,
    saveVisit,
    loadProgress,
    resetProgress,
    totalVisited: visitedImages.size
  };
};
