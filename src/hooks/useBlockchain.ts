
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BlockchainBlock {
  id: string;
  block_number: number;
  block_hash: string;
  previous_block_hash: string | null;
  merkle_root: string;
  timestamp: string;
  votes_count: number;
  validator_node: string;
  is_validated: boolean;
}

export interface Vote {
  id: string;
  election_id: string;
  candidate_id: string;
  voter_id: string;
  vote_hash: string;
  block_hash: string;
  previous_block_hash: string | null;
  timestamp: string;
  verification_signature: string;
  is_verified: boolean;
}

export const useBlockchain = () => {
  const [blocks, setBlocks] = useState<BlockchainBlock[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBlocks = async () => {
    try {
      const { data, error } = await supabase
        .from('blockchain_blocks')
        .select('*')
        .order('block_number', { ascending: false })
        .limit(10);

      if (error) throw error;
      console.log('Fetched blocks:', data?.length || 0);
      setBlocks(data || []);
    } catch (error) {
      console.error('Error fetching blocks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch blockchain data",
        variant: "destructive"
      });
    }
  };

  const fetchVotes = async (electionId?: string) => {
    try {
      let query = supabase.from('votes').select('*');
      
      if (electionId) {
        query = query.eq('election_id', electionId);
      }

      const { data, error } = await query.order('timestamp', { ascending: false });

      if (error) throw error;
      console.log('Fetched votes:', data?.length || 0, 'for election:', electionId || 'all');
      setVotes(data || []);
    } catch (error) {
      console.error('Error fetching votes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch vote data",
        variant: "destructive"
      });
    }
  };

  const verifyVoteHash = (voteHash: string) => {
    return votes.find(vote => vote.vote_hash === voteHash);
  };

  // Function to refresh all data
  const refreshData = async (electionId?: string) => {
    console.log('Refreshing blockchain data...');
    await Promise.all([fetchBlocks(), fetchVotes(electionId)]);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchBlocks(), fetchVotes()]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    blocks,
    votes,
    loading,
    fetchBlocks,
    fetchVotes,
    verifyVoteHash,
    refreshData
  };
};
