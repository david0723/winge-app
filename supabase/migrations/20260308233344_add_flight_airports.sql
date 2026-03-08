ALTER TABLE public.user_flights
  ADD COLUMN departure_airport text,
  ADD COLUMN arrival_airport text,
  ADD COLUMN airline text;
