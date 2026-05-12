-- Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.sf_users(id) ON DELETE CASCADE,
  theme text DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  dashboard_config jsonb DEFAULT '{}'::jsonb,
  locale text DEFAULT 'en-US',
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Note: The users table in this project seems to be 'sf_users' based on database.types.ts
-- sf_users has UUID id.

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see and edit their own preferences
-- Assuming auth.uid() matches the id in sf_users or we proxy via server actions
CREATE POLICY "Users can view own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id); -- Server actions will handle the scoping for now since auth isn't fully wired

CREATE POLICY "Users can update own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);
