-- Fix RLS policies to allow inserting new countries and meta types
-- Allow everyone to insert new countries and meta types

-- Drop existing restrictive policies first if they exist
DROP POLICY IF EXISTS "Everyone can view countries" ON public.country;
DROP POLICY IF EXISTS "Everyone can view meta types" ON public.meta_types;

-- Recreate policies for countries with insert permissions
CREATE POLICY "Everyone can view countries" 
ON public.country 
FOR SELECT 
USING (true);

CREATE POLICY "Everyone can insert countries" 
ON public.country 
FOR INSERT 
WITH CHECK (true);

-- Recreate policies for meta_types with insert permissions  
CREATE POLICY "Everyone can view meta types" 
ON public.meta_types 
FOR SELECT 
USING (true);

CREATE POLICY "Everyone can insert meta types" 
ON public.meta_types 
FOR INSERT 
WITH CHECK (true);