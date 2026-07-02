-- Force policies to be PERMISSIVE by explicitly specifying AS PERMISSIVE
DROP POLICY IF EXISTS "Authenticated users can create families" ON public.families;

CREATE POLICY "Authenticated users can create families" 
ON public.families 
AS PERMISSIVE
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Also fix family_members INSERT policy to be explicitly permissive
DROP POLICY IF EXISTS "Users can join or admins can add members" ON public.family_members;

CREATE POLICY "Users can join or admins can add members" 
ON public.family_members 
AS PERMISSIVE
FOR INSERT 
TO authenticated
WITH CHECK (
  (auth.uid() = user_id) 
  OR 
  (EXISTS ( 
    SELECT 1 FROM family_members fm
    WHERE fm.family_id = family_members.family_id 
    AND fm.user_id = auth.uid() 
    AND fm.role = 'admin'
  ))
);