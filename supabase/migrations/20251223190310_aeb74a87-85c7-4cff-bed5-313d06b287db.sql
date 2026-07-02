-- Add view_count column to posts
ALTER TABLE public.posts 
ADD COLUMN view_count INTEGER NOT NULL DEFAULT 0;

-- Create index for sorting by views
CREATE INDEX idx_posts_view_count ON public.posts(view_count DESC) WHERE status = 'published';

-- Function to increment view count (can be called by anyone for published posts)
CREATE OR REPLACE FUNCTION public.increment_post_view(post_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.posts 
  SET view_count = view_count + 1
  WHERE id = post_uuid AND status = 'published';
END;
$$;