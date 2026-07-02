-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Users can view their own view history" ON public.post_views;

-- Create new SELECT policy that only allows users to see their own views
-- No longer exposes anonymous session data
CREATE POLICY "Users can view their own view history"
ON public.post_views
FOR SELECT
USING (user_id = auth.uid());