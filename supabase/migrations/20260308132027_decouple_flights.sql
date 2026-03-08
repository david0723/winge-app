-- Create user_flights table
CREATE TABLE public.user_flights (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  flight_number text NOT NULL,
  flight_date date NOT NULL,
  seat_number text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE(user_id, flight_number, flight_date)
);

ALTER TABLE public.user_flights ENABLE ROW LEVEL SECURITY;

-- Policies for user_flights
CREATE POLICY "Users can view flights of others"
  ON user_flights FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own flights"
  ON user_flights FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can update their own flights"
  ON user_flights FOR UPDATE
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can delete their own flights"
  ON user_flights FOR DELETE
  USING ( auth.uid() = user_id );

-- Update matches table to include flight_number and flight_date
ALTER TABLE public.matches 
  ADD COLUMN flight_number text,
  ADD COLUMN flight_date date;

-- Add a temporary default for existing rows if needed, then alter to NOT NULL, 
-- but since MVP is empty we can just do:
UPDATE public.matches SET flight_number = 'AA123', flight_date = CURRENT_DATE WHERE flight_number IS NULL;

ALTER TABLE public.matches 
  ALTER COLUMN flight_number SET NOT NULL,
  ALTER COLUMN flight_date SET NOT NULL;

-- Drop old unique constraint and add new one
ALTER TABLE public.matches DROP CONSTRAINT matches_user_id_target_id_key;
ALTER TABLE public.matches ADD CONSTRAINT matches_user_target_flight_key UNIQUE(user_id, target_id, flight_number, flight_date);

-- Remove old columns from profiles
ALTER TABLE public.profiles
  DROP COLUMN seat_number,
  DROP COLUMN flight_number,
  DROP COLUMN flight_date;
