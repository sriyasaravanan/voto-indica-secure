
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Election {
  id: string;
  title: string;
  type: 'National' | 'State' | 'Local';
  constituency: string;
  start_date: string;
  end_date: string;
  status: 'Upcoming' | 'Active' | 'Completed';
  total_voters: number;
  created_at: string;
}

export interface Candidate {
  id: string;
  election_id: string;
  name: string;
  party: string;
  symbol: string;
  manifesto: string;
}

interface CastVoteResponse {
  success: boolean;
  vote_hash?: string;
  block_hash?: string;
  block_number?: number;
  transaction_id?: string;
  error?: string;
}

export const useElections = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchElections = async () => {
    try {
      const { data, error } = await supabase
        .from('elections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        const typedElections: Election[] = data.map(election => ({
          id: election.id,
          title: election.title,
          type: election.type as 'National' | 'State' | 'Local',
          constituency: election.constituency,
          start_date: election.start_date,
          end_date: election.end_date,
          status: election.status as 'Upcoming' | 'Active' | 'Completed',
          total_voters: election.total_voters,
          created_at: election.created_at
        }));
        setElections(typedElections);
      }
    } catch (error) {
      console.error('Error fetching elections:', error);
      toast({
        title: "Error",
        description: "Failed to fetch elections",
        variant: "destructive"
      });
    }
  };

  const fetchCandidates = async (electionId?: string) => {
    try {
      let query = supabase.from('candidates').select('*');
      
      if (electionId) {
        query = query.eq('election_id', electionId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCandidates(data || []);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch candidates",
        variant: "destructive"
      });
    }
  };

  const createElection = async (election: Omit<Election, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('elections')
        .insert([election])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Election created successfully and deployed to blockchain",
      });

      await fetchElections();
      return data;
    } catch (error) {
      console.error('Error creating election:', error);
      toast({
        title: "Error",
        description: "Failed to create election",
        variant: "destructive"
      });
      return null;
    }
  };

  const castVote = async (electionId: string, candidateId: string) => {
    try {
      const { data, error } = await supabase.rpc('cast_vote', {
        p_election_id: electionId,
        p_candidate_id: candidateId
      });

      if (error) throw error;

      const response = data as CastVoteResponse;

      if (response?.success) {
        toast({
          title: "Vote Cast Successfully!",
          description: `Your vote has been recorded on the blockchain. Transaction hash: ${response.vote_hash?.substring(0, 20)}...`,
        });
        return response;
      } else {
        toast({
          title: "Error",
          description: response?.error || "Failed to cast vote",
          variant: "destructive"
        });
        return null;
      }
    } catch (error) {
      console.error('Error casting vote:', error);
      toast({
        title: "Error",
        description: "Failed to cast vote",
        variant: "destructive"
      });
      return null;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchElections(), fetchCandidates()]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    elections,
    candidates,
    loading,
    fetchElections,
    fetchCandidates,
    createElection,
    castVote
  };
};
