import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface LedgerEntry {
  id: string;
  election_id: string | null;
  election_title: string;
  voter_hash: string;
  candidate_name: string;
  transaction_hash: string;
  block_number: number;
  timestamp: string;
  created_at: string;
}

const PAGE_SIZE = 10;

export function usePublicLedger() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const fetchEntries = useCallback(async (page: number) => {
    setLoading(true);
    try {
      // Get total count
      const { count, error: countError } = await supabase
        .from('public_ledger')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;
      setTotalCount(count || 0);

      // Fetch paginated data
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from('public_ledger')
        .select('*')
        .order('timestamp', { ascending: false })
        .range(from, to);

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching ledger entries:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  useEffect(() => {
    fetchEntries(currentPage);
  }, [currentPage, fetchEntries]);

  useEffect(() => {
    // Set up real-time subscription for new entries
    const channel = supabase
      .channel('ledger-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'public_ledger' },
        () => {
          // Refresh current page when new entry arrives
          fetchEntries(currentPage);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentPage, fetchEntries]);

  return { 
    entries, 
    loading, 
    currentPage,
    totalPages,
    totalCount,
    goToPage,
    refetch: () => fetchEntries(currentPage)
  };
}
