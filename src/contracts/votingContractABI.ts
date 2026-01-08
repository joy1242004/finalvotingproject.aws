// ABI for the TransparentVoting smart contract
// Deployed on Sepolia Testnet

export const VOTING_CONTRACT_ADDRESS: string = '0x0D8bf6e6863541B5283aC72c5eaAFAc16C2bed08';

export const NETWORK_CHAIN_ID = 11155111; // Sepolia

export const NETWORK_CONFIG = {
  chainId: '0xaa36a7', // 11155111 in hex
  chainName: 'Sepolia Testnet',
  nativeCurrency: {
    name: 'SepoliaETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://sepolia.infura.io/v3/'],
  blockExplorerUrls: ['https://sepolia.etherscan.io'],
};

export const VOTING_CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "bytes32", "name": "electionId", "type": "bytes32" },
      { "internalType": "bytes32", "name": "candidateId", "type": "bytes32" }
    ],
    "name": "castVote",
    "outputs": [
      { "internalType": "bytes32", "name": "voteHash", "type": "bytes32" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "electionId", "type": "bytes32" },
      { "internalType": "address", "name": "voter", "type": "address" }
    ],
    "name": "checkHasVoted",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalVotes",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "voteHash", "type": "bytes32" }
    ],
    "name": "getVote",
    "outputs": [
      {
        "components": [
          { "internalType": "bytes32", "name": "electionId", "type": "bytes32" },
          { "internalType": "bytes32", "name": "candidateId", "type": "bytes32" },
          { "internalType": "address", "name": "voter", "type": "address" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "uint256", "name": "blockNumber", "type": "uint256" }
        ],
        "internalType": "struct TransparentVoting.Vote",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "index", "type": "uint256" }
    ],
    "name": "getVoteHashByIndex",
    "outputs": [
      { "internalType": "bytes32", "name": "", "type": "bytes32" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "voteHash", "type": "bytes32" },
      { "internalType": "bytes32", "name": "electionId", "type": "bytes32" },
      { "internalType": "bytes32", "name": "candidateId", "type": "bytes32" },
      { "internalType": "address", "name": "voter", "type": "address" }
    ],
    "name": "verifyVote",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "bytes32", "name": "voteHash", "type": "bytes32" },
      { "indexed": true, "internalType": "bytes32", "name": "electionId", "type": "bytes32" },
      { "indexed": true, "internalType": "bytes32", "name": "candidateId", "type": "bytes32" },
      { "indexed": false, "internalType": "address", "name": "voter", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "blockNumber", "type": "uint256" }
    ],
    "name": "VoteCast",
    "type": "event"
  }
] as const;

// Helper to convert UUID to bytes32
export function uuidToBytes32(uuid: string): `0x${string}` {
  const cleanUuid = uuid.replace(/-/g, '');
  return `0x${cleanUuid.padEnd(64, '0')}` as `0x${string}`;
}

// Helper to convert bytes32 back to readable format
export function bytes32ToHex(bytes32: string): string {
  return bytes32;
}
