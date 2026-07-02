import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Place } from '@/types/places';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type Favorite = Tables<'favorites'>;

export function useFavorites(userId: string | undefined) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    if (!userId) {
      setFavorites([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching favorites:', error);
        return;
      }

      setFavorites(data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const addFavorite = async (place: Place) => {
    if (!userId) return { error: new Error('Not authenticated') };

    const insertData: TablesInsert<'favorites'> = {
      user_id: userId,
      place_id: place.id,
      place_name: place.name,
      place_type: place.type,
      place_lat: place.lat,
      place_lng: place.lng,
      place_data: JSON.parse(JSON.stringify(place)),
    };

    const { data, error } = await supabase
      .from('favorites')
      .insert(insertData)
      .select()
      .single();

    if (!error && data) {
      setFavorites((prev) => [data, ...prev]);
    }

    return { error, data };
  };

  const removeFavorite = async (placeId: string) => {
    if (!userId) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('place_id', placeId);

    if (!error) {
      setFavorites((prev) => prev.filter((f) => f.place_id !== placeId));
    }

    return { error };
  };

  const updateNotes = async (placeId: string, notes: string) => {
    if (!userId) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('favorites')
      .update({ notes })
      .eq('user_id', userId)
      .eq('place_id', placeId);

    if (!error) {
      setFavorites((prev) =>
        prev.map((f) => (f.place_id === placeId ? { ...f, notes } : f))
      );
    }

    return { error };
  };

  const isFavorite = (placeId: string) => {
    return favorites.some((f) => f.place_id === placeId);
  };

  return {
    favorites,
    isLoading,
    addFavorite,
    removeFavorite,
    updateNotes,
    isFavorite,
    refetch: fetchFavorites,
  };
}
