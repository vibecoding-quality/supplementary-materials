-- Fix families INSERT policy (change from restrictive to permissive)
DROP POLICY IF EXISTS "Authenticated users can create families" ON public.families;
CREATE POLICY "Authenticated users can create families" 
ON public.families 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Fix family_members INSERT policy (change from restrictive to permissive)
DROP POLICY IF EXISTS "Family admins can add members" ON public.family_members;
CREATE POLICY "Users can join or admins can add members" 
ON public.family_members 
FOR INSERT 
TO authenticated
WITH CHECK (
  (auth.uid() = user_id) OR 
  (EXISTS (
    SELECT 1 FROM family_members fm
    WHERE fm.family_id = family_members.family_id 
    AND fm.user_id = auth.uid() 
    AND fm.role = 'admin'
  ))
);

-- Add more kid-friendly theme options
ALTER TYPE public.user_theme ADD VALUE IF NOT EXISTS 'spiderman';
ALTER TYPE public.user_theme ADD VALUE IF NOT EXISTS 'disney';
ALTER TYPE public.user_theme ADD VALUE IF NOT EXISTS 'kpop';
ALTER TYPE public.user_theme ADD VALUE IF NOT EXISTS 'football';
ALTER TYPE public.user_theme ADD VALUE IF NOT EXISTS 'basketball';
ALTER TYPE public.user_theme ADD VALUE IF NOT EXISTS 'gaming';
ALTER TYPE public.user_theme ADD VALUE IF NOT EXISTS 'anime';
ALTER TYPE public.user_theme ADD VALUE IF NOT EXISTS 'frozen';