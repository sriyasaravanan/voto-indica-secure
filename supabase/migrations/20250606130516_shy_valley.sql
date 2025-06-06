/*
  # Fix Elections Table RLS Policies

  1. Security Updates
    - Add RLS policy for authenticated users to insert elections
    - Add RLS policy for authenticated users to read elections
    - Add RLS policy for authenticated users to update elections
    - Ensure proper access control for election management

  2. Changes
    - Allow authenticated users to create new elections
    - Allow authenticated users to read all elections
    - Allow authenticated users to update elections they have access to
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read elections" ON elections;
DROP POLICY IF EXISTS "Users can insert elections" ON elections;
DROP POLICY IF EXISTS "Users can update elections" ON elections;

-- Create policy for reading elections (all authenticated users can read)
CREATE POLICY "Users can read elections"
  ON elections
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy for inserting elections (all authenticated users can create)
CREATE POLICY "Users can insert elections"
  ON elections
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policy for updating elections (all authenticated users can update)
CREATE POLICY "Users can update elections"
  ON elections
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);