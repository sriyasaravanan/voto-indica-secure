
-- Update the cast_vote function to properly set voter_id
CREATE OR REPLACE FUNCTION public.cast_vote(p_election_id uuid, p_candidate_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
  v_vote_id uuid := gen_random_uuid();
  v_voter_id uuid := auth.uid();
  vote_row record;
  v_vote_hash text;
  v_block_hash text;
  v_verification_signature text;
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
  v_vote_hash := generate_vote_hash(p_election_id, p_candidate_id, v_voter_id, now());
  
  -- Generate block hash (simplified)
  v_block_hash := encode(sha256((v_vote_hash || now()::text)::bytea), 'hex');
  
  -- Generate verification signature (simplified)
  v_verification_signature := encode(sha256((v_voter_id::text || v_vote_hash)::bytea), 'hex');

  -- Insert the vote
  insert into votes (
    id, 
    election_id, 
    candidate_id, 
    voter_id,
    vote_hash,
    block_hash,
    verification_signature
  )
  values (
    v_vote_id, 
    p_election_id, 
    p_candidate_id, 
    v_voter_id,
    v_vote_hash,
    v_block_hash,
    v_verification_signature
  )
  returning * into vote_row;

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
$function$;
