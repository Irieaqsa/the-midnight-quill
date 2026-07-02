-- Allow anyone to view follows for counting purposes
CREATE POLICY "Anyone can view follows for counting"
ON public.follows
FOR SELECT
USING (true);