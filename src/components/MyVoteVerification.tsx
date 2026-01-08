import { useState } from 'react';
import { Search, CheckCircle, AlertCircle, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePublicLedger, LedgerEntry } from '@/hooks/usePublicLedger';
import { useWallet } from '@/hooks/useWallet';
import { format } from 'date-fns';

export function MyVoteVerification() {
  const { entries } = usePublicLedger();
  const { address, isConnected, connect, formatAddress } = useWallet();
  const [searchHash, setSearchHash] = useState('');
  const [searchResults, setSearchResults] = useState<LedgerEntry[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    if (!searchHash.trim()) return;
    
    const results = entries.filter(
      entry => 
        entry.voter_hash.toLowerCase().includes(searchHash.toLowerCase()) ||
        entry.transaction_hash.toLowerCase().includes(searchHash.toLowerCase())
    );
    setSearchResults(results);
    setHasSearched(true);
  };

  const handleVerifyMyVotes = () => {
    if (!address) return;
    
    const results = entries.filter(
      entry => entry.voter_hash.toLowerCase() === address.toLowerCase()
    );
    setSearchResults(results);
    setSearchHash(address);
    setHasSearched(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          Verify Your Vote
        </CardTitle>
        <CardDescription>
          Search by your wallet address or transaction hash to verify your vote was recorded
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter wallet address or transaction hash..."
            value={searchHash}
            onChange={(e) => setSearchHash(e.target.value)}
            className="font-mono text-sm"
          />
          <Button onClick={handleSearch} disabled={!searchHash.trim()}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>

        {isConnected ? (
          <Button variant="outline" onClick={handleVerifyMyVotes} className="w-full">
            <Wallet className="h-4 w-4 mr-2" />
            Verify My Votes ({formatAddress(address)})
          </Button>
        ) : (
          <Button variant="outline" onClick={connect} className="w-full">
            <Wallet className="h-4 w-4 mr-2" />
            Connect Wallet to Verify Your Votes
          </Button>
        )}

        {hasSearched && (
          <div className="pt-4 border-t border-border">
            {searchResults.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Found {searchResults.length} vote(s)</span>
                </div>
                {searchResults.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-lg border border-border bg-muted/50 p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{entry.election_title}</span>
                      <Badge variant="secondary">{entry.candidate_name}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Timestamp</p>
                        <p>{format(new Date(entry.timestamp), 'PPpp')}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Block Number</p>
                        <p className="text-primary font-medium">#{entry.block_number}</p>
                      </div>
                    </div>
                    <div className="text-sm">
                      <p className="text-muted-foreground">Transaction Hash</p>
                      <code className="text-xs bg-background px-2 py-1 rounded font-mono break-all">
                        {entry.transaction_hash}
                      </code>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="h-5 w-5" />
                <span>No votes found for this address or hash</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
