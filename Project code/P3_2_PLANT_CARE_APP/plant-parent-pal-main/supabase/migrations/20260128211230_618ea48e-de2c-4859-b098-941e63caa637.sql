-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Create plant_species table for the 50 common plants catalog
CREATE TABLE public.plant_species (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  scientific_name TEXT,
  description TEXT,
  watering_frequency_days INTEGER NOT NULL DEFAULT 7,
  fertilizing_frequency_days INTEGER DEFAULT 30,
  light_requirement TEXT NOT NULL DEFAULT 'medium',
  min_temperature INTEGER DEFAULT 15,
  max_temperature INTEGER DEFAULT 25,
  humidity_preference TEXT DEFAULT 'medium',
  image_url TEXT,
  care_tips TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Make plant_species readable by everyone
ALTER TABLE public.plant_species ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view plant species"
ON public.plant_species FOR SELECT
USING (true);

-- Create user_plants table for user's plant collection
CREATE TABLE public.user_plants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  species_id UUID REFERENCES public.plant_species(id) ON DELETE SET NULL,
  custom_name TEXT,
  nickname TEXT,
  location TEXT,
  light_condition TEXT DEFAULT 'medium',
  is_heated_room BOOLEAN DEFAULT true,
  room_temperature INTEGER DEFAULT 20,
  notes TEXT,
  image_url TEXT,
  last_watered_at TIMESTAMP WITH TIME ZONE,
  last_fertilized_at TIMESTAMP WITH TIME ZONE,
  last_repotted_at TIMESTAMP WITH TIME ZONE,
  acquired_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_plants
ALTER TABLE public.user_plants ENABLE ROW LEVEL SECURITY;

-- User plants policies
CREATE POLICY "Users can view their own plants"
ON public.user_plants FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plants"
ON public.user_plants FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plants"
ON public.user_plants FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plants"
ON public.user_plants FOR DELETE
USING (auth.uid() = user_id);

-- Create care_logs table to track care activities
CREATE TABLE public.care_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_plant_id UUID REFERENCES public.user_plants(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  care_type TEXT NOT NULL,
  notes TEXT,
  performed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on care_logs
ALTER TABLE public.care_logs ENABLE ROW LEVEL SECURITY;

-- Care logs policies
CREATE POLICY "Users can view their own care logs"
ON public.care_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own care logs"
ON public.care_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own care logs"
ON public.care_logs FOR DELETE
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_plants_updated_at
BEFORE UPDATE ON public.user_plants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();