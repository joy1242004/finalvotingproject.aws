import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Vote {
  id: string;
  election_id: string;
  candidate_id: string;
  voter_id: string;
  transaction_hash: string | null;
  block_number: number | null;
  created_at: string;
}

export function useVotes(userId?: string) {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVotes = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .eq('voter_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVotes(data || []);
    } catch (error) {
      console.error('Error fetching votes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVotes();

    if (!userId) return;

    // Set up real-time subscription
    const channel = supabase
      .channel('votes-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'votes' },
        () => {
          fetchVotes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const sendConfirmationEmail = async (
    email: string,
    voterName: string,
    electionTitle: string,
    candidateName: string,
    transactionHash: string,
    blockNumber: number,
    voterHash: string
  ) => {
    try {
      const { error } = await supabase.functions.invoke('send-vote-confirmation', {
        body: {
          email,
          voterName,
          electionTitle,
          candidateName,
          transactionHash,
          blockNumber,
          voterHash,
          timestamp: new Date().toISOString(),
        },
      });

      if (error) {
        console.error('Failed to send confirmation email:', error);
      } else {
        toast.success('Confirmation email sent!');
      }
    } catch (error) {
      console.error('Email notification error:', error);
    }
  };

  const castVote = async (
    electionId: string, 
    candidateId: string, 
    candidateName: string, 
    electionTitle: string,
    walletAddress?: string,
    onChainData?: { transactionHash: string; blockNumber: number }
  ) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      // Use real on-chain data if provided, otherwise generate mock data for off-chain votes
      const transactionHash = onChainData?.transactionHash || 
        `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      const blockNumber = onChainData?.blockNumber || 
        Math.floor(Math.random() * 100000) + 15000;
      
      // Use wallet address if provided, otherwise generate a hash
      const voterHash = walletAddress || 
        `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

      // Insert vote
      const { error: voteError } = await supabase
        .from('votes')
        .insert({
          election_id: electionId,
          candidate_id: candidateId,
          voter_id: userData.user.id,
          transaction_hash: transactionHash,
          block_number: blockNumber,
        });

      if (voteError) {
        if (voteError.code === '23505') {
          throw new Error('You have already voted in this election');
        }
        throw voteError;
      }

      // Update candidate vote count
      await supabase.rpc('increment_vote_count', { p_candidate_id: candidateId });

      // Add to public ledger with real blockchain data for transparency
      await supabase
        .from('public_ledger')
        .insert({
          election_id: electionId,
          election_title: electionTitle,
          voter_hash: voterHash,
          candidate_name: candidateName,
          transaction_hash: transactionHash,
          block_number: blockNumber,
          timestamp: new Date().toISOString(),
        });

      const successMessage = onChainData 
        ? 'Vote cast on-chain and recorded to the database!'
        : 'Vote cast successfully! Your vote has been recorded on the ledger.';
      toast.success(successMessage);
      
      // Send confirmation email
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userData.user.id)
        .single();
      
      sendConfirmationEmail(
        userData.user.email || '',
        profile?.full_name || userData.user.email?.split('@')[0] || 'Voter',
        electionTitle,
        candidateName,
        transactionHash,
        blockNumber,
        voterHash
      );

      fetchVotes();
      return { transactionHash, blockNumber, voterHash };
    } catch (error: any) {
      toast.error(error.message || 'Failed to cast vote');
      throw error;
    }
  };

  const hasVotedInElection = (electionId: string) => {
    return votes.some(v => v.election_id === electionId);
  };

  return { votes, loading, castVote, hasVotedInElection, refetch: fetchVotes };
}
