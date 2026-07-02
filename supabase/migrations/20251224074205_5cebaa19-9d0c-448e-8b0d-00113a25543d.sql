-- Drop the orphaned otp_codes table (contains sensitive data, OTP system removed)
DROP TABLE IF EXISTS public.otp_codes;

-- Fix follows table RLS: Remove overly permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view follows for counting" ON public.follows;

-- Fix likes table RLS: Remove overly permissive SELECT policy  
DROP POLICY IF EXISTS "Likes are viewable by everyone" ON public.likes;

-- Create new restrictive policy for likes: users can see their own likes, post authors can see likes on their posts
CREATE POLICY "Users can view their own likes and post authors can view likes on their posts"
ON public.likes
FOR SELECT
USING (
  auth.uid() = user_id 
  OR public.is_post_author(post_id)
);

-- Add database constraints for profile fields
ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_display_name_length CHECK (char_length(display_name) <= 100),
  ADD CONSTRAINT profiles_username_length CHECK (char_length(username) <= 50),
  ADD CONSTRAINT profiles_bio_length CHECK (char_length(bio) <= 1000),
  ADD CONSTRAINT profiles_website_length CHECK (char_length(website) <= 200),
  ADD CONSTRAINT profiles_avatar_url_length CHECK (char_length(avatar_url) <= 500);