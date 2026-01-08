-- Create function to increment vote count
CREATE OR REPLACE FUNCTION public.increment_vote_count(p_candidate_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.candidates
  SET votes_count = votes_count + 1
  WHERE id = p_candidate_id;
END;
$$;