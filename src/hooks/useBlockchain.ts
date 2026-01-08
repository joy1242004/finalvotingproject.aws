import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  VOTING_CONTRACT_ADDRESS, 
  NETWORK_CONFIG,
  NETWORK_CHAIN_ID,
  uuidToBytes32 
} from '@/contracts/votingContractABI';

interface TransactionResult {
  transactionHash: string;
  blockNumber: number;
  voteHash: string;
}

export function useBlockchain() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<TransactionResult | null>(null);

  const isContractConfigured = (): boolean => {
    return typeof VOTING_CONTRACT_ADDRESS === 'string' && 
           VOTING_CONTRACT_ADDRESS !== '' && 
           VOTING_CONTRACT_ADDRESS.startsWith('0x');
  };

  const switchToNetwork = async (): Promise<boolean> => {
    if (!window.ethereum) {
      toast.error('MetaMask is not installed');
      return false;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NETWORK_CONFIG.chainId }],
      });
      return true;
    } catch (switchError: any) {
      // Chain not added, try to add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [NETWORK_CONFIG],
          });
          return true;
        } catch (addError) {
          toast.error('Failed to add Sepolia network');
          console.error('Add chain error:', addError);
          return false;
        }
      }
      toast.error('Failed to switch to Sepolia network');
      console.error('Switch chain error:', switchError);
      return false;
    }
  };

  const checkNetwork = async (): Promise<boolean> => {
    if (!window.ethereum) return false;
    
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' }) as string;
      const currentChainId = parseInt(chainId, 16);
      
      if (currentChainId !== NETWORK_CHAIN_ID) {
        toast.info('Switching to Sepolia Testnet...');
        return await switchToNetwork();
      }
      return true;
    } catch (error) {
      console.error('Check network error:', error);
      return false;
    }
  };

  const castVoteOnChain = useCallback(async (
    electionId: string,
    candidateId: string,
    voterAddress: string
  ): Promise<TransactionResult | null> => {
    if (!isContractConfigured()) {
      toast.error('Smart contract not configured. Please deploy the contract first.');
      return null;
    }

    if (!window.ethereum) {
      toast.error('MetaMask is not installed');
      return null;
    }

    setIsProcessing(true);

    try {
      // Check and switch network if needed
      const isCorrectNetwork = await checkNetwork();
      if (!isCorrectNetwork) {
        setIsProcessing(false);
        return null;
      }

      // Convert UUIDs to bytes32
      const electionIdBytes32 = uuidToBytes32(electionId);
      const candidateIdBytes32 = uuidToBytes32(candidateId);

      // Encode parameters (remove 0x prefix, they're already 64 chars)
      const encodedElectionId = electionIdBytes32.slice(2);
      const encodedCandidateId = candidateIdBytes32.slice(2);
      
      // castVote(bytes32,bytes32) selector: 0x9a8a0592
      const data = `0x9a8a0592${encodedElectionId}${encodedCandidateId}`;

      toast.info('Please confirm the transaction in MetaMask...');

      // Send transaction
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: voterAddress,
          to: VOTING_CONTRACT_ADDRESS,
          data: data,
          gas: '0x30000', // 196608 gas
        }],
      }) as string;

      toast.info('Transaction submitted! Waiting for confirmation...');

      // Wait for transaction receipt
      let receipt = null;
      let attempts = 0;
      const maxAttempts = 60;

      while (!receipt && attempts < maxAttempts) {
        try {
          receipt = await window.ethereum.request({
            method: 'eth_getTransactionReceipt',
            params: [txHash],
          });
          if (!receipt) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            attempts++;
          }
        } catch (error) {
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      if (!receipt) {
        toast.warning('Transaction submitted but confirmation is taking longer. Check the explorer.');
        const result: TransactionResult = {
          transactionHash: txHash,
          blockNumber: 0,
          voteHash: txHash,
        };
        setLastTransaction(result);
        return result;
      }

      const blockNumber = parseInt((receipt as any).blockNumber, 16);
      
      const result: TransactionResult = {
        transactionHash: txHash,
        blockNumber,
        voteHash: txHash,
      };

      setLastTransaction(result);
      toast.success(`Vote recorded on-chain! Block #${blockNumber}`);

      return result;
    } catch (error: any) {
      if (error.code === 4001) {
        toast.error('Transaction rejected by user');
      } else if (error.message?.includes('insufficient funds')) {
        toast.error('Insufficient ETH for gas. Get test ETH from the Sepolia faucet.');
      } else {
        toast.error('Failed to cast vote on-chain');
        console.error('Blockchain vote error:', error);
      }
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const getExplorerUrl = (txHash: string): string => {
    return `https://sepolia.etherscan.io/tx/${txHash}`;
  };

  return {
    castVoteOnChain,
    isProcessing,
    lastTransaction,
    isContractConfigured: isContractConfigured(),
    switchToNetwork,
    checkNetwork,
    getExplorerUrl,
  };
}
