-- Create profiles table
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name text,
  bio text,
  avatar_url text,
  seat_number text,
  flight_number text,
  flight_date date,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (id)
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone."
  ON profiles FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own profile."
  ON profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
  ON profiles FOR UPDATE
  USING ( auth.uid() = id );

-- Create matches table
CREATE TABLE public.matches (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('liked', 'passed', 'matched')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE(user_id, target_id)
);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Matches policies
CREATE POLICY "Users can view their own matches"
  ON matches FOR SELECT
  USING ( auth.uid() = user_id OR auth.uid() = target_id );

CREATE POLICY "Users can create a match"
  ON matches FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can update a match they are involved in"
  ON matches FOR UPDATE
  USING ( auth.uid() = user_id OR auth.uid() = target_id );

-- Create messages table
CREATE TABLE public.messages (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (id)
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Messages policies
CREATE POLICY "Users can view messages of their matches"
  ON messages FOR SELECT
  USING ( 
    EXISTS (
      SELECT 1 FROM matches m 
      WHERE m.id = messages.match_id 
      AND (m.user_id = auth.uid() OR m.target_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert messages into their matches"
  ON messages FOR INSERT
  WITH CHECK ( 
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM matches m 
      WHERE m.id = messages.match_id 
      AND m.status = 'matched'
      AND (m.user_id = auth.uid() OR m.target_id = auth.uid())
    )
  );

-- Create a trigger to automatically insert a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Set up Realtime
alter publication supabase_realtime add table messages;
