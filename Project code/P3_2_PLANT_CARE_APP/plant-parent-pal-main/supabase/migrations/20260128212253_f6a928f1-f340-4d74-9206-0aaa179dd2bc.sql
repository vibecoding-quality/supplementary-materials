-- Add toxicity columns to plant_species
ALTER TABLE public.plant_species 
ADD COLUMN toxic_to_cats BOOLEAN DEFAULT false,
ADD COLUMN toxic_to_dogs BOOLEAN DEFAULT false;

-- Update user_plants to have temperature range instead of single value
ALTER TABLE public.user_plants 
ADD COLUMN min_room_temperature INTEGER DEFAULT 18,
ADD COLUMN max_room_temperature INTEGER DEFAULT 24,
ADD COLUMN pets TEXT[] DEFAULT '{}';

-- Migrate existing room_temperature data to range
UPDATE public.user_plants 
SET min_room_temperature = room_temperature - 2,
    max_room_temperature = room_temperature + 2
WHERE room_temperature IS NOT NULL;

-- We'll keep room_temperature for backward compatibility but use the range going forward