
-- Update the cast_vote function to properly set voter_id from authenticated user
CREATE OR REPLACE FUNCTION public.cast_vote(p_election_id uuid, p_candidate_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
  v_vote_id uuid := gen_random_uuid();
  v_voter_id uuid := auth.uid();
  v_vote_hash text;
  v_block_hash text;
  v_timestamp timestamp with time zone := now();
begin
  -- Check if user is authenticated
  if v_voter_id is null then
    return jsonb_build_object(
      'success', false,
      'error', 'User not authenticated'
    );
  end if;

  -- Check if user has already voted in this election
  if exists (
    select 1 from votes 
    where voter_id = v_voter_id 
    and election_id = p_election_id
  ) then
    return jsonb_build_object(
      'success', false,
      'error', 'User has already voted in this election'
    );
  end if;

  -- Generate vote hash
  v_vote_hash := encode(
    digest(
      p_election_id::text || p_candidate_id::text || v_voter_id::text || v_timestamp::text || random()::text,
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

  -- Insert vote with all required fields including voter_id
  insert into votes (
    id, 
    election_id, 
    candidate_id, 
    voter_id,
    vote_hash, 
    block_hash, 
    verification_signature,
    timestamp
  )
  values (
    v_vote_id, 
    p_election_id, 
    p_candidate_id, 
    v_voter_id,
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
exception
  when others then
    return jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
end;
$function$
