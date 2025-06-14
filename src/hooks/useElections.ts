
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

// Standard candidate template that will be used for all elections
const STANDARD_CANDIDATES = [
  {
    name: "Rajesh Kumar",
    party: "Bharatiya Janata Party",
    symbol: "🪷",
    manifesto: "Development, Digital India, and Economic Growth"
  },
  {
    name: "Priya Sharma",
    party: "Indian National Congress",
    symbol: "✋",
    manifesto: "Social Justice, Employment, and Healthcare for All"
  },
  {
    name: "Amit Singh",
    party: "Aam Aadmi Party",
    symbol: "🧹",
    manifesto: "Corruption-free Governance and Quality Education"
  },
  {
    name: "Sunita Patel",
    party: "Bahujan Samaj Party",
    symbol: "🐘",
    manifesto: "Equality, Social Justice, and Empowerment"
  },
  {
    name: "Vikram Yadav",
    party: "Samajwadi Party",
    symbol: "🚲",
    manifesto: "Farmer Welfare and Youth Employment"
  }
];

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
        console.log('Fetching candidates for specific election:', electionId);
        query = query.eq('election_id', electionId);
      } else {
        console.log('Fetching all candidates');
      }

      const { data, error } = await query;

      if (error) throw error;
      
      console.log('Fetched candidates:', data);
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

  const ensureStandardCandidates = async (electionId: string) => {
    try {
      // Check if candidates already exist for this election
      const { data: existingCandidates, error: checkError } = await supabase
        .from('candidates')
        .select('*')
        .eq('election_id', electionId);

      if (checkError) throw checkError;

      // If candidates already exist, don't add duplicates
      if (existingCandidates && existingCandidates.length > 0) {
        console.log(`Election ${electionId} already has ${existingCandidates.length} candidates`);
        return;
      }

      // Add standard candidates to the election
      const candidatesToInsert = STANDARD_CANDIDATES.map(candidate => ({
        election_id: electionId,
        name: candidate.name,
        party: candidate.party,
        symbol: candidate.symbol,
        manifesto: candidate.manifesto
      }));

      const { error: insertError } = await supabase
        .from('candidates')
        .insert(candidatesToInsert);

      if (insertError) throw insertError;

      console.log(`Added ${candidatesToInsert.length} standard candidates to election ${electionId}`);
    } catch (error) {
      console.error('Error ensuring standard candidates:', error);
      throw error;
    }
  };

  const populateAllElectionsWithCandidates = async () => {
    try {
      // Get all elections
      const { data: allElections, error: electionsError } = await supabase
        .from('elections')
        .select('id, title');

      if (electionsError) throw electionsError;

      if (!allElections || allElections.length === 0) {
        console.log('No elections found to populate with candidates');
        return;
      }

      let electionsUpdated = 0;

      // Add standard candidates to each election that doesn't have them
      for (const election of allElections) {
        try {
          await ensureStandardCandidates(election.id);
          electionsUpdated++;
        } catch (error) {
          console.error(`Failed to add candidates to election ${election.title}:`, error);
        }
      }

      if (electionsUpdated > 0) {
        toast({
          title: "Success",
          description: `Updated ${electionsUpdated} elections with standard candidates`,
        });
        
        // Refresh candidates data
        await fetchCandidates();
      }
    } catch (error) {
      console.error('Error populating elections with candidates:', error);
      toast({
        title: "Error",
        description: "Failed to populate elections with candidates",
        variant: "destructive"
      });
    }
  };

  const createElection = async (election: Omit<Election, 'id' | 'created_at'>) => {
    try {
      const { data: newElection, error } = await supabase
        .from('elections')
        .insert([election])
        .select()
        .single();

      if (error) throw error;

      if (newElection) {
        // Ensure this new election gets the standard candidates
        await ensureStandardCandidates(newElection.id);

        toast({
          title: "Success",
          description: `Election created successfully with ${STANDARD_CANDIDATES.length} candidates`,
        });

        await fetchElections();
        return newElection;
      }
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

      // Safely handle the response type conversion
      let response: CastVoteResponse;
      
      if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
        // Convert unknown object to CastVoteResponse by checking properties
        response = {
          success: Boolean(data.success),
          vote_hash: typeof data.vote_hash === 'string' ? data.vote_hash : undefined,
          block_hash: typeof data.block_hash === 'string' ? data.block_hash : undefined,
          block_number: typeof data.block_number === 'number' ? data.block_number : undefined,
          transaction_id: typeof data.transaction_id === 'string' ? data.transaction_id : undefined,
          error: typeof data.error === 'string' ? data.error : undefined
        };
      } else {
        response = { success: false, error: 'Invalid response format' };
      }

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
      await fetchElections();
      // Don't fetch all candidates initially - only fetch when specific election is selected
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
    castVote,
    populateAllElectionsWithCandidates,
    ensureStandardCandidates
  };
};
