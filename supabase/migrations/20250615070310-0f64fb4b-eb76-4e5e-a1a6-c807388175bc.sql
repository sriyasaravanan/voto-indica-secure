
-- Fix the cast_vote function to properly generate vote_hash
CREATE OR REPLACE FUNCTION public.cast_vote(p_election_id uuid, p_candidate_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
declare
  v_vote_id uuid := gen_random_uuid();
  v_vote_hash text;
  v_block_hash text;
  v_timestamp timestamp with time zone := now();
begin
  -- Generate vote hash first
  v_vote_hash := encode(
    digest(
      p_election_id::text || p_candidate_id::text || v_vote_id::text || v_timestamp::text || random()::text,
      'sha256'
    ),
    'hex'
  );
  
  -- Generate block hash
  v_block_hash := encode(
    digest(
      'block_' || v_vote_hash || v_timestamp::text,
      'sha256'
    ),
    'hex'
  );

  -- Insert vote with all required fields
  insert into votes (
    id, 
    election_id, 
    candidate_id, 
    vote_hash, 
    block_hash, 
    verification_signature,
    timestamp
  )
  values (
    v_vote_id, 
    p_election_id, 
    p_candidate_id, 
    v_vote_hash,
    v_block_hash,
    'verified_' || v_vote_hash,
    v_timestamp
  );

  return jsonb_build_object(
    'success', true,
    'vote_hash', v_vote_hash,
    'block_hash', v_block_hash,
    'block_number', 123,
    'transaction_id', v_vote_id::text
  );
end;
$function$
