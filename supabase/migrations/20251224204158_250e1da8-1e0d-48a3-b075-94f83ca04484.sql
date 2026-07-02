-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Users can view their own connections" ON public.follows;

-- Create more restrictive SELECT policy - users can only see who they follow
CREATE POLICY "Users can view who they follow"
ON public.follows
FOR SELECT
USING (auth.uid() = follower_id);

-- Create function to get follower count for a user (publicly accessible)
CREATE OR REPLACE FUNCTION public.get_follower_count(target_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer
  FROM public.follows
  WHERE following_id = target_user_id
$$;

-- Create function to get following count for a user (publicly accessible)
CREATE OR REPLACE FUNCTION public.get_following_count(target_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer
  FROM public.follows
  WHERE follower_id = target_user_id
$$;

-- Create function to check if current user follows a specific user
CREATE OR REPLACE FUNCTION public.is_following(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.follows
    WHERE follower_id = auth.uid()
      AND following_id = target_user_id
  )
$$;

-- Create function to get followers list (only for the profile owner)
CREATE OR REPLACE FUNCTION public.get_my_followers()
RETURNS TABLE(follower_id uuid, created_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT f.follower_id, f.created_at
  FROM public.follows f
  WHERE f.following_id = auth.uid()
$$;