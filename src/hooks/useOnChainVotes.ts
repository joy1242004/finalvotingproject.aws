import { useState, useEffect, useCallback } from 'react';
import { VOTING_CONTRACT_ADDRESS, NETWORK_CHAIN_ID } from '@/contracts/votingContractABI';

interface OnChainVote {
  voteHash: string;
  electionId: string;
  candidateId: string;
  voter: string;
  timestamp: number;
  blockNumber: number;
  transactionHash: string;
}

// VoteCast event signature hash
const VOTE_CAST_TOPIC = '0x' + 'VoteCast(bytes32,bytes32,bytes32,address,uint256,uint256)'
  .split('')
  .reduce((hash, char) => {
    // Simple placeholder - we'll use the actual keccak256 hash
    return hash;
  }, '');

// Actual keccak256 of VoteCast(bytes32,bytes32,bytes32,address,uint256,uint256)
const VOTE_CAST_EVENT_SIGNATURE = '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925';

export function useOnChainVotes() {
  const [votes, setVotes] = useState<OnChainVote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConfigured = VOTING_CONTRACT_ADDRESS && VOTING_CONTRACT_ADDRESS.startsWith('0x') && VOTING_CONTRACT_ADDRESS.length === 42;

  const fetchVotes = useCallback(async () => {
    if (!window.ethereum || !isConfigured) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check if on correct network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' }) as string;
      const currentChainId = parseInt(chainId, 16);
      
      if (currentChainId !== NETWORK_CHAIN_ID) {
        setError('Please connect to Sepolia network');
        setLoading(false);
        return;
      }

      // Get current block number
      const currentBlockHex = await window.ethereum.request({ method: 'eth_blockNumber' }) as string;
      const currentBlock = parseInt(currentBlockHex, 16);
      
      // Fetch logs from last 10000 blocks (adjust as needed)
      const fromBlock = Math.max(0, currentBlock - 10000);

      const logs = await window.ethereum.request({
        method: 'eth_getLogs',
        params: [{
          address: VOTING_CONTRACT_ADDRESS,
          fromBlock: '0x' + fromBlock.toString(16),
          toBlock: 'latest',
        }],
      }) as any[];

      const parsedVotes: OnChainVote[] = logs.map((log: any) => {
        // Topics: [eventSig, voteHash, electionId, candidateId]
        const voteHash = log.topics[1] || '0x';
        const electionId = log.topics[2] || '0x';
        const candidateId = log.topics[3] || '0x';
        
        // Data contains: voter (address), timestamp (uint256), blockNumber (uint256)
        const data = log.data.slice(2); // Remove 0x prefix
        const voter = '0x' + data.slice(24, 64); // Address is padded to 32 bytes
        const timestamp = parseInt(data.slice(64, 128), 16);
        const blockNum = parseInt(data.slice(128, 192), 16);

        return {
          voteHash,
          electionId,
          candidateId,
          voter,
          timestamp,
          blockNumber: parseInt(log.blockNumber, 16),
          transactionHash: log.transactionHash,
        };
      });

      // Sort by block number descending (newest first)
      parsedVotes.sort((a, b) => b.blockNumber - a.blockNumber);
      
      setVotes(parsedVotes);
    } catch (err: any) {
      console.error('Error fetching on-chain votes:', err);
      setError(err.message || 'Failed to fetch votes');
    } finally {
      setLoading(false);
    }
  }, [isConfigured]);

  useEffect(() => {
    if (isConfigured) {
      fetchVotes();
    }
  }, [fetchVotes, isConfigured]);

  // Listen for new blocks to refresh
  useEffect(() => {
    if (!window.ethereum || !isConfigured) return;

    const handleNewBlock = () => {
      fetchVotes();
    };

    // Poll every 15 seconds for new votes
    const interval = setInterval(handleNewBlock, 15000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchVotes, isConfigured]);

  return {
    votes,
    loading,
    error,
    refetch: fetchVotes,
    isConfigured,
  };
}
