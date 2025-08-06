-- Add RLS policy to allow everyone to read meta_types
CREATE POLICY "Everyone can view meta types" 
ON public.meta_types 
FOR SELECT 
USING (true);

-- Add RLS policy to allow everyone to view countries
CREATE POLICY "Everyone can view countries" 
ON public.country 
FOR SELECT 
USING (true);