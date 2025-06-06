/*
  # Fix Votes Table RLS Policies

  1. Security Updates
    - Add RLS policy for authenticated users to insert votes
    - Add RLS policy for authenticated users to read their own votes
    - Ensure proper access control for vote casting

  2. Changes
    - Allow authenticated users to insert votes through the cast_vote function
    - Allow users to read votes (for results and tracking)
    - Maintain security while enabling vote functionality
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read votes" ON votes;
DROP POLICY IF EXISTS "Users can insert votes" ON votes;
DROP POLICY IF EXISTS "Authenticated users can insert votes" ON votes;
DROP POLICY IF EXISTS "Authenticated users can read votes" ON votes;

-- Create policy for reading votes (all authenticated users can read for results)
CREATE POLICY "Authenticated users can read votes"
  ON votes
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy for inserting votes (authenticated users can insert their own votes)
CREATE POLICY "Authenticated users can insert votes"
  ON votes
  FOR INSERT
  TO authenticated
  WITH CHECK (voter_id = auth.uid());

-- Ensure RLS is enabled on the votes table
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;