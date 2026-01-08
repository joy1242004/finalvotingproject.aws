import { useState, useEffect } from 'react';
import { Activity, Wifi, WifiOff, ExternalLink } from 'lucide-react';
import { useBlockchain } from '@/hooks/useBlockchain';
import { VOTING_CONTRACT_ADDRESS, NETWORK_CHAIN_ID } from '@/contracts/votingContractABI';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function BlockchainStatus() {
  const { isContractConfigured, switchToNetwork } = useBlockchain();
  const [networkStatus, setNetworkStatus] = useState<'connected' | 'wrong-network' | 'disconnected'>('disconnected');
  const [currentChainId, setCurrentChainId] = useState<number | null>(null);
  const [blockHeight, setBlockHeight] = useState<string>('--');

  useEffect(() => {
    const checkNetwork = async () => {
      if (!window.ethereum) {
        setNetworkStatus('disconnected');
        return;
      }

      try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' }) as string;
        const chainIdNum = parseInt(chainId, 16);
        setCurrentChainId(chainIdNum);

        if (chainIdNum === NETWORK_CHAIN_ID) {
          setNetworkStatus('connected');
          
          // Fetch latest block number
          const block = await window.ethereum.request({ method: 'eth_blockNumber' }) as string;
          setBlockHeight(parseInt(block, 16).toLocaleString());
        } else {
          setNetworkStatus('wrong-network');
        }
      } catch (error) {
        console.error('Network check error:', error);
        setNetworkStatus('disconnected');
      }
    };

    checkNetwork();

    // Listen for chain changes
    if (window.ethereum) {
      const handleChainChanged = () => checkNetwork();
      window.ethereum.on('chainChanged', handleChainChanged);
      
      // Poll for block height updates
      const interval = setInterval(checkNetwork, 30000);

      return () => {
        window.ethereum?.removeListener('chainChanged', handleChainChanged);
        clearInterval(interval);
      };
    }
  }, []);

  const getNetworkName = (chainId: number | null) => {
    if (!chainId) return 'Not Connected';
    switch (chainId) {
      case 80002: return 'Polygon Amoy';
      case 137: return 'Polygon Mainnet';
      case 1: return 'Ethereum Mainnet';
      case 11155111: return 'Sepolia Testnet';
      default: return `Chain ${chainId}`;
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Blockchain Network Status
        </h2>
        {isContractConfigured && (
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
            Contract Deployed
          </Badge>
        )}
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex justify-between rounded-lg bg-muted p-3">
          <span className="text-sm text-muted-foreground">Network:</span>
          <div className="flex items-center gap-2">
            {networkStatus === 'connected' ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-amber-500" />
            )}
            <span className={`text-sm font-medium ${
              networkStatus === 'connected' ? 'text-green-500' : 'text-amber-500'
            }`}>
              {getNetworkName(currentChainId)}
            </span>
          </div>
        </div>
        
        <div className="flex justify-between rounded-lg bg-muted p-3">
          <span className="text-sm text-muted-foreground">Block Height:</span>
          <span className="text-sm font-medium text-card-foreground">{blockHeight}</span>
        </div>
        
        <div className="flex justify-between rounded-lg bg-muted p-3">
          <span className="text-sm text-muted-foreground">Contract:</span>
          <span className={`text-sm font-medium ${isContractConfigured ? 'text-green-500' : 'text-amber-500'}`}>
            {isContractConfigured ? 'Configured' : 'Not Deployed'}
          </span>
        </div>
        
        <div className="flex justify-between rounded-lg bg-muted p-3">
          <span className="text-sm text-muted-foreground">Status:</span>
          <span className={`text-sm font-medium ${
            networkStatus === 'connected' && isContractConfigured ? 'text-green-500' : 'text-amber-500'
          }`}>
            {networkStatus === 'connected' && isContractConfigured ? 'Ready' : 'Setup Required'}
          </span>
        </div>
      </div>

      {networkStatus === 'wrong-network' && (
        <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
          <span className="text-sm text-amber-600">
            Please switch to Sepolia Testnet for on-chain voting
          </span>
          <Button size="sm" variant="outline" onClick={switchToNetwork}>
            Switch Network
          </Button>
        </div>
      )}

      {!isContractConfigured && (
        <div className="mt-4 p-3 rounded-lg bg-muted border border-border">
          <p className="text-sm text-muted-foreground mb-2">
            To enable on-chain voting, deploy the smart contract:
          </p>
          <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Open <code className="bg-background px-1 rounded">src/contracts/VotingContract.sol</code></li>
            <li>Deploy using <a href="https://remix.ethereum.org" target="_blank" rel="noopener" className="text-primary underline">Remix IDE</a></li>
            <li>Copy the deployed address to <code className="bg-background px-1 rounded">votingContractABI.ts</code></li>
          </ol>
          <Button 
            size="sm" 
            variant="outline" 
            className="mt-2"
            onClick={() => window.open('https://sepoliafaucet.com/', '_blank')}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Get Test ETH
          </Button>
        </div>
      )}
    </div>
  );
}
