import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Stats {
  totalUsers: number;
  activeElections: number;
  totalVotes: number;
}

export function useStats() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeElections: 0,
    totalVotes: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      // Use the public function that bypasses RLS for unauthenticated access
      const { data, error } = await supabase.rpc('get_public_stats');

      if (error) {
        console.error('Error fetching stats:', error);
        return;
      }

      if (data) {
        const statsData = data as { totalUsers: number; activeElections: number; totalVotes: number };
        setStats({
          totalUsers: statsData.totalUsers || 0,
          activeElections: statsData.activeElections || 0,
          totalVotes: statsData.totalVotes || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Subscribe to real-time changes
    const profilesChannel = supabase
      .channel('stats-profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchStats)
      .subscribe();

    const electionsChannel = supabase
      .channel('stats-elections')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'elections' }, fetchStats)
      .subscribe();

    const votesChannel = supabase
      .channel('stats-votes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, fetchStats)
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(electionsChannel);
      supabase.removeChannel(votesChannel);
    };
  }, []);

  return { stats, loading, refetch: fetchStats };
}
