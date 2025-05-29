
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
          verified: data.verified
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
      const profileData = {
        id: userId,
        email: email,
        user_type: userType,
        verified: true,
        full_name: additionalData?.name || null,
        constituency: additionalData?.address || null
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert([profileData])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const profile: UserProfile = {
          id: data.id,
          email: data.email,
          user_type: data.user_type as 'voter' | 'admin',
          voter_id: data.voter_id,
          full_name: data.full_name,
          constituency: data.constituency,
          verified: data.verified
        };
        setProfile(profile);
        return profile;
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
    signOut
  };
};
