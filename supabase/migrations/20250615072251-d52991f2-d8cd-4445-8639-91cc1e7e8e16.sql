
-- Add unique voter_id and admin_id columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN unique_id TEXT,
ADD COLUMN aadhar_number TEXT;

-- Create unique indexes to ensure no duplicate IDs
CREATE UNIQUE INDEX idx_profiles_unique_id ON public.profiles(unique_id) WHERE unique_id IS NOT NULL;
CREATE UNIQUE INDEX idx_profiles_aadhar ON public.profiles(aadhar_number) WHERE aadhar_number IS NOT NULL;

-- Create a function to generate unique IDs
CREATE OR REPLACE FUNCTION generate_unique_voter_id()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_id TEXT;
  id_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate ID based on timestamp and random component
    new_id := 'VTR-' || 
              EXTRACT(YEAR FROM NOW())::TEXT || 
              LPAD(EXTRACT(DOY FROM NOW())::TEXT, 3, '0') || '-' ||
              LPAD((RANDOM() * 9999)::INT::TEXT, 4, '0');
    
    -- Check if ID already exists
    SELECT EXISTS(SELECT 1 FROM profiles WHERE unique_id = new_id) INTO id_exists;
    
    -- Exit loop if ID is unique
    EXIT WHEN NOT id_exists;
  END LOOP;
  
  RETURN new_id;
END;
$$;

-- Create a function to generate unique admin IDs
CREATE OR REPLACE FUNCTION generate_unique_admin_id()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_id TEXT;
  id_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate ID based on timestamp and random component
    new_id := 'ADM-' || 
              EXTRACT(YEAR FROM NOW())::TEXT || 
              LPAD(EXTRACT(DOY FROM NOW())::TEXT, 3, '0') || '-' ||
              LPAD((RANDOM() * 9999)::INT::TEXT, 4, '0');
    
    -- Check if ID already exists
    SELECT EXISTS(SELECT 1 FROM profiles WHERE unique_id = new_id) INTO id_exists;
    
    -- Exit loop if ID is unique
    EXIT WHEN NOT id_exists;
  END LOOP;
  
  RETURN new_id;
END;
$$;

-- Create a function to verify user login with unique ID and Aadhar
CREATE OR REPLACE FUNCTION verify_user_login(p_unique_id TEXT, p_aadhar_number TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Find user with matching unique_id and aadhar_number
  SELECT id, email, user_type, full_name, unique_id, aadhar_number
  INTO user_record
  FROM profiles 
  WHERE unique_id = p_unique_id 
    AND aadhar_number = p_aadhar_number;
  
  IF user_record.id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid ID or Aadhar number'
    );
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'user_id', user_record.id,
    'email', user_record.email,
    'user_type', user_record.user_type,
    'full_name', user_record.full_name,
    'unique_id', user_record.unique_id
  );
END;
$$;
