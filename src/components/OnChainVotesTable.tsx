import { useOnChainVotes } from '@/hooks/useOnChainVotes';
import { ExternalLink, RefreshCw, Loader2, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function OnChainVotesTable() {
  const { votes, loading, error, refetch, isConfigured } = useOnChainVotes();

  const truncateHash = (hash: string) => {
    if (!hash || hash.length < 16) return hash;
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  const formatTimestamp = (timestamp: number) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleString();
  };

  if (!isConfigured) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="text-center py-8">
          <Link2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-card-foreground mb-2">Smart Contract Not Configured</h3>
          <p className="text-sm text-muted-foreground">
            Deploy the voting contract and add the address to see on-chain votes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            Live On-Chain Votes
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time votes fetched directly from the Sepolia blockchain
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
            {votes.length} votes
          </Badge>
          <Button size="sm" variant="outline" onClick={refetch} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {loading && votes.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Fetching blockchain data...</span>
        </div>
      ) : votes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No votes recorded on-chain yet.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Votes will appear here once cast through the voting modal.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Block</TableHead>
                <TableHead>Vote Hash</TableHead>
                <TableHead>Voter Address</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Transaction</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {votes.slice(0, 20).map((vote, index) => (
                <TableRow key={vote.voteHash + index}>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono">
                      #{vote.blockNumber.toLocaleString()}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {truncateHash(vote.voteHash)}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    <a
                      href={`https://sepolia.etherscan.io/address/${vote.voter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      {truncateHash(vote.voter)}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatTimestamp(vote.timestamp)}
                  </TableCell>
                  <TableCell>
                    <a
                      href={`https://sepolia.etherscan.io/tx/${vote.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline text-xs"
                    >
                      View
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Data fetched directly from smart contract at{' '}
          <a
            href={`https://sepolia.etherscan.io/address/0x0D8bf6e6863541B5283aC72c5eaAFAc16C2bed08`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-mono"
          >
            0x0D8b...ed08
          </a>
        </p>
      </div>
    </div>
  );
}
