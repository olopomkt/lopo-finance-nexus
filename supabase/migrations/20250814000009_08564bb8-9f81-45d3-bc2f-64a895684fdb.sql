-- Add user_id columns to all financial tables to enable user-specific access control
ALTER TABLE public.company_revenues ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.company_expenses ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.personal_expenses ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing records to assign them to the first user (if any exists)
-- This is a one-time migration for existing data
DO $$
DECLARE
    first_user_id UUID;
BEGIN
    -- Get the first user ID from auth.users
    SELECT id INTO first_user_id FROM auth.users LIMIT 1;
    
    -- Only update if we found a user
    IF first_user_id IS NOT NULL THEN
        UPDATE public.company_revenues SET user_id = first_user_id WHERE user_id IS NULL;
        UPDATE public.company_expenses SET user_id = first_user_id WHERE user_id IS NULL;
        UPDATE public.personal_expenses SET user_id = first_user_id WHERE user_id IS NULL;
    END IF;
END $$;

-- Make user_id columns NOT NULL after populating existing data
ALTER TABLE public.company_revenues ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.company_expenses ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.personal_expenses ALTER COLUMN user_id SET NOT NULL;

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Permitir todas as operações em company_revenues" ON public.company_revenues;
DROP POLICY IF EXISTS "Permitir todas as operações em company_expenses" ON public.company_expenses;
DROP POLICY IF EXISTS "Permitir todas as operações em personal_expenses" ON public.personal_expenses;

-- Create secure RLS policies for company_revenues
CREATE POLICY "Users can manage their own company revenues"
ON public.company_revenues
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create secure RLS policies for company_expenses
CREATE POLICY "Users can manage their own company expenses"
ON public.company_expenses
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create secure RLS policies for personal_expenses
CREATE POLICY "Users can manage their own personal expenses"
ON public.personal_expenses
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Ensure all tables have RLS enabled
ALTER TABLE public.company_revenues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_expenses ENABLE ROW LEVEL SECURITY;