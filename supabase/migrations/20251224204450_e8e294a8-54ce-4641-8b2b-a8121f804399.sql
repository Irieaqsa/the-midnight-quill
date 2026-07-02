-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Users can view who they follow" ON public.follows;

-- Create policy allowing users to see their own connections (both directions)
-- This is standard social platform behavior - users can see:
-- 1. Who they follow (follower_id = auth.uid())
-- 2. Who follows them (following_id = auth.uid())
-- Users CANNOT see other users' relationships
CREATE POLICY "Users can view their own connections"
ON public.follows
FOR SELECT
USING (auth.uid() = follower_id OR auth.uid() = following_id);