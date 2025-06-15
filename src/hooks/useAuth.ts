
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
  id: string;
  email: string;
  user_type: 'voter' | 'admin';
  voter_id: string | null;
  full_name: string | null;
  constituency: string | null;
  verified: boolean;
  unique_id: string | null;
  aadhar_number: string | null;
}

interface LoginVerificationResult {
  success: boolean;
  user_id?: string;
  email?: string;
  user_type?: string;
  full_name?: string;
  unique_id?: string;
  error?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        const profile: UserProfile = {
          id: data.id,
          email: data.email,
          user_type: data.user_type as 'voter' | 'admin',
          voter_id: data.voter_id,
          full_name: data.full_name,
          constituency: data.constituency,
          verified: data.verified,
          unique_id: data.unique_id,
          aadhar_number: data.aadhar_number
        };
        setProfile(profile);
        return profile;
      }
      return null;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const createProfile = async (userId: string, email: string, userType: 'voter' | 'admin', additionalData?: any) => {
    try {
      console.log('Creating profile for user:', userId, 'email:', email, 'type:', userType);
      
      // Generate unique ID based on user type
      const { data: uniqueId, error: idError } = await supabase
        .rpc(userType === 'voter' ? 'generate_unique_voter_id' : 'generate_unique_admin_id');

      if (idError) {
        console.error('Error generating unique ID:', idError);
        throw new Error('Failed to generate unique ID');
      }

      console.log('Generated unique ID:', uniqueId);

      const profileData = {
        id: userId,
        email: email, // Make sure email is stored
        user_type: userType,
        verified: true,
        unique_id: uniqueId,
        full_name: additionalData?.name || null,
        aadhar_number: additionalData?.aadhar || null,
        constituency: additionalData?.address || null
      };

      console.log('Inserting profile data:', profileData);

      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (error) {
        console.error('Error inserting profile:', error);
        throw error;
      }

      console.log('Profile created successfully:', data);

      if (data) {
        const profile: UserProfile = {
          id: data.id,
          email: data.email,
          user_type: data.user_type as 'voter' | 'admin',
          voter_id: data.voter_id,
          full_name: data.full_name,
          constituency: data.constituency,
          verified: data.verified,
          unique_id: data.unique_id,
          aadhar_number: data.aadhar_number
        };
        setProfile(profile);
        return { profile, uniqueId };
      }
      return null;
    } catch (error) {
      console.error('Error creating profile:', error);
      toast({
        title: "Error",
        description: "Failed to create user profile",
        variant: "destructive"
      });
      return null;
    }
  };

  const verifyLogin = async (uniqueId: string, aadharNumber: string): Promise<LoginVerificationResult> => {
    try {
      console.log('Verifying login with unique ID:', uniqueId, 'and Aadhar:', aadharNumber);
      
      const { data, error } = await supabase
        .rpc('verify_user_login', {
          p_unique_id: uniqueId,
          p_aadhar_number: aadharNumber
        });

      if (error) {
        console.error('Error verifying login:', error);
        return { success: false, error: 'Verification failed' };
      }

      console.log('Login verification response:', data);

      // Type assertion since we know the structure from our SQL function
      return data as unknown as LoginVerificationResult;
    } catch (error) {
      console.error('Error in verifyLogin:', error);
      return { success: false, error: 'Verification failed' };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      });
    } else {
      setUser(null);
      setProfile(null);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    profile,
    loading,
    fetchProfile,
    createProfile,
    verifyLogin,
    signOut
  };
};
