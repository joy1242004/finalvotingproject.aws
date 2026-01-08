-- Create a function to get public stats that can be called without authentication
CREATE OR REPLACE FUNCTION public.get_public_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
  users_count INTEGER;
  active_elections_count INTEGER;
  votes_count INTEGER;
BEGIN
  -- Get total users count
  SELECT COUNT(*) INTO users_count FROM public.profiles;
  
  -- Get active elections count
  SELECT COUNT(*) INTO active_elections_count 
  FROM public.elections 
  WHERE status = 'active' 
    AND start_date <= NOW() 
    AND end_date >= NOW();
  
  -- Get total votes count
  SELECT COUNT(*) INTO votes_count FROM public.votes;
  
  result := json_build_object(
    'totalUsers', users_count,
    'activeElections', active_elections_count,
    'totalVotes', votes_count
  );
  
  RETURN result;
END;
$$;

-- Grant execute permission to anon role so unauthenticated users can call it
GRANT EXECUTE ON FUNCTION public.get_public_stats() TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_stats() TO authenticated;