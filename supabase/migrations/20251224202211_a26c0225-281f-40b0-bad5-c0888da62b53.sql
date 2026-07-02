-- Create table to track post views for rate limiting
CREATE TABLE public.post_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient lookups
CREATE INDEX idx_post_views_post_session ON public.post_views(post_id, session_id, viewed_at);
CREATE INDEX idx_post_views_cleanup ON public.post_views(viewed_at);

-- Enable RLS
ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anyone (needed for view tracking)
CREATE POLICY "Anyone can insert post views"
ON public.post_views
FOR INSERT
WITH CHECK (true);

-- Only allow selecting own views or for analytics
CREATE POLICY "Users can view their own view history"
ON public.post_views
FOR SELECT
USING (user_id = auth.uid() OR user_id IS NULL);

-- Replace the increment_post_view function with rate-limited version
CREATE OR REPLACE FUNCTION public.increment_post_view(post_uuid uuid, session_uuid text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  recent_view_exists boolean;
  effective_session text;
BEGIN
  -- Use provided session or generate one
  effective_session := COALESCE(session_uuid, gen_random_uuid()::text);
  
  -- Check if this session has viewed this post in the last hour
  SELECT EXISTS (
    SELECT 1 FROM public.post_views
    WHERE post_id = post_uuid 
      AND session_id = effective_session
      AND viewed_at > now() - interval '1 hour'
  ) INTO recent_view_exists;
  
  -- If recently viewed, don't increment
  IF recent_view_exists THEN
    RETURN false;
  END IF;
  
  -- Record the view
  INSERT INTO public.post_views (post_id, session_id, user_id)
  VALUES (post_uuid, effective_session, auth.uid());
  
  -- Increment the view count
  UPDATE public.posts 
  SET view_count = view_count + 1
  WHERE id = post_uuid AND status = 'published';
  
  RETURN true;
END;
$$;

-- Create cleanup function for old view records (older than 24 hours)
CREATE OR REPLACE FUNCTION public.cleanup_old_post_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.post_views WHERE viewed_at < now() - interval '24 hours';
END;
$$;