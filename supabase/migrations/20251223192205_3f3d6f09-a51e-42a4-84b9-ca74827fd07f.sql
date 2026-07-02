-- Drop existing delete policy
DROP POLICY IF EXISTS "Authors can delete their own comments" ON public.comments;

-- Create new delete policy that allows comment authors AND post authors to delete
CREATE POLICY "Authors and post owners can delete comments" 
ON public.comments 
FOR DELETE 
USING (
  auth.uid() = author_id 
  OR is_post_author(post_id)
);

-- Enable realtime for comments table
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;