import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Candidate {
  id: string;
  election_id: string;
  name: string;
  party: string | null;
  image_url: string | null;
  votes_count: number;
}

export interface Election {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  status: string;
  created_by: string | null;
  created_at: string;
  candidates?: Candidate[];
}

export function useElections() {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchElections = async () => {
    try {
      const { data, error } = await supabase
        .from('elections')
        .select(`
          *,
          candidates (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setElections(data || []);
    } catch (error: any) {
      console.error('Error fetching elections:', error);
      toast.error('Failed to fetch elections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();

    // Set up real-time subscription for elections
    const electionsChannel = supabase
      .channel('elections-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'elections' },
        () => {
          fetchElections();
        }
      )
      .subscribe();

    // Set up real-time subscription for candidates (vote counts)
    const candidatesChannel = supabase
      .channel('candidates-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'candidates' },
        () => {
          fetchElections();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(electionsChannel);
      supabase.removeChannel(candidatesChannel);
    };
  }, []);

  const createElection = async (election: Omit<Election, 'id' | 'created_at' | 'candidates'>, candidates: { name: string; party: string }[]) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { data: electionData, error: electionError } = await supabase
        .from('elections')
        .insert({
          ...election,
          created_by: user.user?.id,
        })
        .select()
        .single();

      if (electionError) throw electionError;

      // Insert candidates
      if (candidates.length > 0 && electionData) {
        const { error: candidatesError } = await supabase
          .from('candidates')
          .insert(
            candidates.map(c => ({
              election_id: electionData.id,
              name: c.name,
              party: c.party,
            }))
          );

        if (candidatesError) throw candidatesError;
      }

      toast.success('Election created successfully');
      fetchElections();
      return electionData;
    } catch (error: any) {
      toast.error(error.message || 'Failed to create election');
      throw error;
    }
  };

  const updateElection = async (id: string, updates: Partial<Election>, candidates?: { id?: string; name: string; party: string }[]) => {
    try {
      const { error: electionError } = await supabase
        .from('elections')
        .update(updates)
        .eq('id', id);

      if (electionError) throw electionError;

      // Update candidates if provided
      if (candidates) {
        // Delete existing candidates
        await supabase.from('candidates').delete().eq('election_id', id);
        
        // Insert new candidates
        const { error: candidatesError } = await supabase
          .from('candidates')
          .insert(
            candidates.map(c => ({
              election_id: id,
              name: c.name,
              party: c.party,
            }))
          );

        if (candidatesError) throw candidatesError;
      }

      toast.success('Election updated successfully');
      fetchElections();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update election');
      throw error;
    }
  };

  const deleteElection = async (id: string) => {
    try {
      const { error } = await supabase
        .from('elections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Election deleted successfully');
      fetchElections();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete election');
      throw error;
    }
  };

  return {
    elections,
    loading,
    createElection,
    updateElection,
    deleteElection,
    refetch: fetchElections,
  };
}
