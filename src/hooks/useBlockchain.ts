
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
  solana_signature?: string;
  solana_slot?: number;
}

export interface BlockchainStats {
  totalVotes: number;
  totalBlocks: number;
  networkHashRate: number;
  lastBlockTime: string;
  averageBlockTime: number;
}

export const useBlockchain = () => {
  const [blocks, setBlocks] = useState<BlockchainBlock[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [stats, setStats] = useState<BlockchainStats | null>(null);
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

  const calculateBlockchainStats = async () => {
    try {
      const [votesData, blocksData] = await Promise.all([
        supabase.from('votes').select('id, timestamp'),
        supabase.from('blockchain_blocks').select('id, timestamp').order('timestamp', { ascending: false }).limit(10)
      ]);

      if (votesData.error || blocksData.error) throw votesData.error || blocksData.error;

      const totalVotes = votesData.data?.length || 0;
      const totalBlocks = blocksData.data?.length || 0;
      
      // Calculate average block time
      let averageBlockTime = 0;
      if (blocksData.data && blocksData.data.length > 1) {
        const timeDiffs = [];
        for (let i = 0; i < blocksData.data.length - 1; i++) {
          const current = new Date(blocksData.data[i].timestamp).getTime();
          const next = new Date(blocksData.data[i + 1].timestamp).getTime();
          timeDiffs.push(Math.abs(current - next));
        }
        averageBlockTime = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length / 1000; // in seconds
      }

      const stats: BlockchainStats = {
        totalVotes,
        totalBlocks,
        networkHashRate: Math.floor(Math.random() * 1000000) + 500000, // Simulated
        lastBlockTime: blocksData.data?.[0]?.timestamp || new Date().toISOString(),
        averageBlockTime
      };

      setStats(stats);
    } catch (error) {
      console.error('Error calculating blockchain stats:', error);
    }
  };

  const verifyVoteHash = (voteHash: string) => {
    return votes.find(vote => vote.vote_hash === voteHash);
  };

  const createMerkleRoot = (voteHashes: string[]) => {
    if (voteHashes.length === 0) return '';
    if (voteHashes.length === 1) return voteHashes[0];
    
    // Simple Merkle tree implementation
    let currentLevel = [...voteHashes];
    
    while (currentLevel.length > 1) {
      const nextLevel = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = currentLevel[i + 1] || left;
        // Simple hash combination (in real implementation, use proper cryptographic hash)
        const combined = btoa(left + right).substring(0, 32);
        nextLevel.push(combined);
      }
      currentLevel = nextLevel;
    }
    
    return currentLevel[0];
  };

  const validateBlockIntegrity = (block: BlockchainBlock, previousBlock?: BlockchainBlock) => {
    // Basic block validation
    const validations = {
      hasValidHash: block.block_hash && block.block_hash.length === 64,
      hasValidPrevious: !previousBlock || block.previous_block_hash === previousBlock.block_hash,
      hasValidTimestamp: new Date(block.timestamp) <= new Date(),
      hasValidMerkleRoot: block.merkle_root && block.merkle_root.length > 0
    };

    return {
      isValid: Object.values(validations).every(v => v),
      validations
    };
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchBlocks(), fetchVotes(), calculateBlockchainStats()]);
      setLoading(false);
    };

    loadData();

    // Set up real-time subscription for new votes
    const voteSubscription = supabase
      .channel('votes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'votes' }, () => {
        fetchVotes();
        calculateBlockchainStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(voteSubscription);
    };
  }, []);

  return {
    blocks,
    votes,
    stats,
    loading,
    fetchBlocks,
    fetchVotes,
    verifyVoteHash,
    createMerkleRoot,
    validateBlockIntegrity,
    calculateBlockchainStats
  };
};
