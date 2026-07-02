-- Add UPDATE policy for game_progress to allow upserts
CREATE POLICY "Users can update their own game progress"
  ON public.game_progress FOR UPDATE
  USING (auth.uid() = user_id);