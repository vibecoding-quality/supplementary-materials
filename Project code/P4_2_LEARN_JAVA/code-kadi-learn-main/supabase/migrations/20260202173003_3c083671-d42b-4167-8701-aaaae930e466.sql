-- Add saved_for_later column to flashcard_progress
ALTER TABLE public.flashcard_progress 
ADD COLUMN saved_for_later BOOLEAN DEFAULT false;