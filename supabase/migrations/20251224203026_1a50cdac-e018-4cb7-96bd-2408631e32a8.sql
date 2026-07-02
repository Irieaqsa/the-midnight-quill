-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Users can view their own follows" ON public.follows;

-- Create new SELECT policy that allows users to see:
-- 1. Who they follow (follower_id = auth.uid())
-- 2. Who follows them (following_id = auth.uid())
CREATE POLICY "Users can view their own connections"
ON public.follows
FOR SELECT
USING (auth.uid() = follower_id OR auth.uid() = following_id);