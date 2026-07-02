-- Create a security-definer function to create a family and add the creator as admin
-- This avoids client-side inserts being blocked by RLS/column privilege edge cases.

CREATE OR REPLACE FUNCTION public.create_family_group(family_name text DEFAULT 'My Family')
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_family_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.families (name, created_by)
  VALUES (COALESCE(NULLIF(family_name, ''), 'My Family'), auth.uid())
  RETURNING id INTO new_family_id;

  INSERT INTO public.family_members (family_id, user_id, role)
  VALUES (new_family_id, auth.uid(), 'admin');

  RETURN new_family_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_family_group(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_family_group(text) TO authenticated;