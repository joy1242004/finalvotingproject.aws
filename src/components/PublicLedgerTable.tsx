import { useState } from 'react';
import { format } from 'date-fns';
import { ExternalLink, Clock, Search, Shield, Activity, Copy, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { usePublicLedger } from '@/hooks/usePublicLedger';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export function PublicLedgerTable() {
  const { entries, loading, currentPage, totalPages, totalCount, goToPage } = usePublicLedger();
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    toast.success(`${type} copied to clipboard`);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const filteredEntries = entries.filter(entry => 
    entry.voter_hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.transaction_hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.election_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.candidate_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const showPages = 5;
    
    if (totalPages <= showPages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  if (loading && entries.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-card-foreground">{totalCount}</p>
            <p className="text-sm text-muted-foreground">Total Transactions</p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-3">
          <div className="p-2 rounded-full bg-green-500/10">
            <Activity className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-card-foreground">
              {entries.length > 0 ? entries[0].block_number : 0}
            </p>
            <p className="text-sm text-muted-foreground">Latest Block</p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-3">
          <div className="p-2 rounded-full bg-blue-500/10">
            <Clock className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-card-foreground">
              {entries.length > 0 ? format(new Date(entries[0].timestamp), 'HH:mm:ss') : '--:--:--'}
            </p>
            <p className="text-sm text-muted-foreground">Last Activity</p>
          </div>
        </div>
      </div>

      {/* Live indicator and search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm text-muted-foreground">Live updates enabled</span>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by wallet, transaction, election..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      {filteredEntries.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground rounded-lg border border-border bg-card">
          {searchTerm ? 'No transactions match your search.' : 'No transactions recorded yet.'}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date & Time</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Election</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Wallet / Voter Hash</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Candidate</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Block #</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Transaction Hash</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm text-card-foreground">
                            {format(new Date(entry.timestamp), 'MMM dd, yyyy')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(entry.timestamp), 'HH:mm:ss')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-card-foreground max-w-[150px] truncate">
                      {entry.election_title}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <code className="text-xs bg-muted px-2 py-1 rounded font-mono text-primary">
                          {entry.voter_hash.slice(0, 6)}...{entry.voter_hash.slice(-4)}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(entry.voter_hash, 'Wallet address')}
                        >
                          {copiedHash === entry.voter_hash ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">{entry.candidate_name}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className="bg-primary/10 text-primary border-0">
                        #{entry.block_number}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                          {entry.transaction_hash.slice(0, 10)}...{entry.transaction_hash.slice(-6)}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(entry.transaction_hash, 'Transaction hash')}
                        >
                          {copiedHash === entry.transaction_hash ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3 text-muted-foreground" />
                          )}
                        </Button>
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalCount)} of {totalCount} transactions
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Previous</span>
                </Button>
                
                <div className="hidden sm:flex items-center gap-1 mx-2">
                  {getPageNumbers().map((page, idx) => 
                    page === 'ellipsis' ? (
                      <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">...</span>
                    ) : (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => goToPage(page)}
                        disabled={loading}
                      >
                        {page}
                      </Button>
                    )
                  )}
                </div>
                
                <span className="sm:hidden text-sm text-muted-foreground mx-2">
                  {currentPage} / {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                >
                  <span className="hidden sm:inline mr-1">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
