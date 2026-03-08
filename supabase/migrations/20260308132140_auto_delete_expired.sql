-- Attempt to enable pg_cron (requires superuser, may fail if not supported directly in migration, but standard in Supabase)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule a job to run every midnight (UTC)
-- Deletes user_flights that are more than 1 day old
-- Because matches references profiles, not user_flights, we should also delete matches
-- The 'matches' table has ON DELETE CASCADE from profiles, but not user_flights.
-- Wait, matches has flight_date. We can delete them directly.
SELECT cron.schedule(
  'cinderella-effect-matches',
  '0 0 * * *',
  $$
    DELETE FROM public.matches WHERE flight_date < CURRENT_DATE - INTERVAL '1 day';
  $$
);

SELECT cron.schedule(
  'cinderella-effect-flights',
  '0 0 * * *',
  $$
    DELETE FROM public.user_flights WHERE flight_date < CURRENT_DATE - INTERVAL '1 day';
  $$
);
