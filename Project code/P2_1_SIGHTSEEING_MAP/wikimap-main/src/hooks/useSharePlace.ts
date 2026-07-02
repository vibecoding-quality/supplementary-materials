import { supabase } from '@/integrations/supabase/client';
import { Place } from '@/types/places';
import type { TablesInsert } from '@/integrations/supabase/types';

export function useSharePlace(userId: string | undefined) {
  const createShareLink = async (place: Place) => {
    if (!userId) return { error: new Error('Not authenticated'), shareCode: null };

    const insertData: TablesInsert<'shared_places'> = {
      user_id: userId,
      place_id: place.id,
      place_name: place.name,
      place_type: place.type,
      place_lat: place.lat,
      place_lng: place.lng,
      place_data: JSON.parse(JSON.stringify(place)),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    };

    const { data, error } = await supabase
      .from('shared_places')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return { error, shareCode: null };
    }

    return { error: null, shareCode: data.share_code };
  };

  const getSharedPlace = async (shareCode: string) => {
    const { data, error } = await supabase
      .from('shared_places')
      .select('*')
      .eq('share_code', shareCode)
      .maybeSingle();

    if (error || !data) {
      return { error: error || new Error('Share link not found'), place: null };
    }

    // Check if expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return { error: new Error('Share link expired'), place: null };
    }

    // Safely cast the place_data
    const placeData = data.place_data as unknown as Place;
    return { error: null, place: placeData };
  };

  return {
    createShareLink,
    getSharedPlace,
  };
}
