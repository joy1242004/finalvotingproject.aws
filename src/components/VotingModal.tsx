import { useState } from 'react';
import { Vote, CheckCircle, Loader2, Wallet, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Election } from '@/hooks/useElections';
import { useVotes } from '@/hooks/useVotes';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { useBlockchain } from '@/hooks/useBlockchain';
import { Badge } from '@/components/ui/badge';

interface VotingModalProps {
  election: Election | null;
  open: boolean;
  onClose: () => void;
}

export function VotingModal({ election, open, onClose }: VotingModalProps) {
  const { user } = useAuth();
  const { castVote } = useVotes(user?.id);
  const { isConnected, address, connect, formatAddress } = useWallet();
  const { castVoteOnChain, isContractConfigured, isProcessing, getExplorerUrl } = useBlockchain();
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voteResult, setVoteResult] = useState<{ 
    transactionHash: string; 
    blockNumber: number; 
    voterHash: string;
    isOnChain?: boolean;
  } | null>(null);

  if (!election) return null;

  const handleVote = async () => {
    if (!selectedCandidate || !election.candidates) return;

    setIsSubmitting(true);
    
    try {
      const candidate = election.candidates.find(c => c.id === selectedCandidate);
      if (!candidate) return;

      let onChainResult = null;
      
      // If wallet connected and contract configured, cast on-chain vote first
      if (isConnected && address && isContractConfigured) {
        onChainResult = await castVoteOnChain(election.id, selectedCandidate, address);
        
        if (!onChainResult) {
          // User cancelled or error occurred
          setIsSubmitting(false);
          return;
        }
      }

      // Record vote in database with real on-chain data if available
      const result = await castVote(
        election.id, 
        selectedCandidate, 
        candidate.name, 
        election.title,
        isConnected ? address ?? undefined : undefined,
        onChainResult ? { 
          transactionHash: onChainResult.transactionHash, 
          blockNumber: onChainResult.blockNumber 
        } : undefined
      );
      
      if (result) {
        setVoteResult({
          transactionHash: onChainResult?.transactionHash || result.transactionHash,
          blockNumber: onChainResult?.blockNumber || result.blockNumber,
          voterHash: address || result.voterHash,
          isOnChain: !!onChainResult,
        });
      }
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedCandidate(null);
    setVoteResult(null);
    onClose();
  };

  const colors = ['#1a9e9e', '#e67e22', '#9b59b6', '#3498db', '#e74c3c'];

  if (voteResult) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Vote Successfully Cast!
            </DialogTitle>
            <DialogDescription>
              Your vote has been recorded {voteResult.isOnChain ? 'on the Sepolia blockchain' : 'on the ledger'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {voteResult.isOnChain && (
              <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                🔗 On-Chain Vote (Sepolia Testnet)
              </Badge>
            )}
            
            <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Voter Address</p>
                <code className="text-xs bg-background px-2 py-1 rounded font-mono break-all">
                  {voteResult.voterHash}
                </code>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Transaction Hash</p>
                <code className="text-xs bg-background px-2 py-1 rounded font-mono break-all">
                  {voteResult.transactionHash}
                </code>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Block Number</p>
                <p className="text-primary font-bold">#{voteResult.blockNumber}</p>
              </div>
            </div>
            
            {voteResult.isOnChain && (
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => window.open(getExplorerUrl(voteResult.transactionHash), '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Etherscan
              </Button>
            )}
            
            <p className="text-sm text-muted-foreground">
              You can verify your vote anytime in the Public Ledger using your wallet address or transaction hash.
            </p>
          </div>

          <Button onClick={handleClose} className="w-full">
            Done
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Vote className="h-5 w-5 text-primary" />
            {election.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!isConnected ? (
            <Alert className="border-destructive/50 bg-destructive/10">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <AlertDescription className="flex flex-col gap-3">
                <span className="text-sm font-medium text-destructive">
                  Wallet connection required to vote
                </span>
                <p className="text-xs text-muted-foreground">
                  You must connect your MetaMask wallet before casting your vote. This ensures your vote is securely recorded on the blockchain.
                </p>
                <Button variant="default" size="sm" onClick={connect} className="w-full">
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect MetaMask Wallet
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <Wallet className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600 font-medium">
                  Connected: {formatAddress(address)}
                </span>
              </div>
              
              {isContractConfigured ? (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <span className="text-xs text-purple-600">
                    🔗 On-chain voting enabled (Sepolia Testnet)
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <span className="text-xs text-amber-600">
                    ⚠️ Contract not deployed - votes will be recorded off-chain
                  </span>
                </div>
              )}
            </div>
          )}

          {isConnected && (
            <>
              <p className="text-sm text-muted-foreground">
                Select your preferred candidate below. Your vote will be recorded {isContractConfigured ? 'on the Sepolia blockchain' : 'on the public ledger'}.
              </p>

              <div className="space-y-2">
                {election.candidates?.map((candidate, index) => (
                  <button
                    key={candidate.id}
                    onClick={() => setSelectedCandidate(candidate.id)}
                    disabled={isSubmitting || isProcessing}
                    className={`w-full rounded-lg border p-4 text-left transition-all ${
                      selectedCandidate === candidate.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    } disabled:opacity-50`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: colors[index % colors.length] }}
                        >
                          {candidate.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-card-foreground">{candidate.name}</p>
                          {candidate.party && (
                            <p className="text-sm text-muted-foreground">{candidate.party}</p>
                          )}
                        </div>
                      </div>
                      {selectedCandidate === candidate.id && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting || isProcessing}>
            Cancel
          </Button>
          <Button 
            onClick={handleVote} 
            disabled={!isConnected || !selectedCandidate || isSubmitting || isProcessing}
          >
            {isSubmitting || isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isProcessing ? 'Confirming on chain...' : 'Processing...'}
              </>
            ) : !isConnected ? (
              <>
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet First
              </>
            ) : (
              <>
                <Vote className="mr-2 h-4 w-4" />
                {isContractConfigured ? 'Cast On-Chain Vote' : 'Confirm Vote'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
