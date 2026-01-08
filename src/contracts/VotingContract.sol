// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title TransparentVoting
 * @dev A transparent voting smart contract for on-chain vote recording
 * @notice Deploy this contract on Polygon Amoy Testnet
 * 
 * To deploy:
 * 1. Go to https://remix.ethereum.org
 * 2. Create a new file and paste this code
 * 3. Compile with Solidity 0.8.19+
 * 4. Connect MetaMask to Polygon Amoy (chainId: 80002)
 * 5. Get test MATIC from https://faucet.polygon.technology/
 * 6. Deploy and copy the contract address
 */

contract TransparentVoting {
    struct Vote {
        bytes32 electionId;
        bytes32 candidateId;
        address voter;
        uint256 timestamp;
        uint256 blockNumber;
    }

    // Mapping from vote hash to Vote struct
    mapping(bytes32 => Vote) public votes;
    
    // Mapping to track if a voter has voted in an election
    mapping(bytes32 => mapping(address => bool)) public hasVoted;
    
    // Array of all vote hashes for enumeration
    bytes32[] public voteHashes;
    
    // Events for transparency
    event VoteCast(
        bytes32 indexed voteHash,
        bytes32 indexed electionId,
        bytes32 indexed candidateId,
        address voter,
        uint256 timestamp,
        uint256 blockNumber
    );

    event ElectionCreated(
        bytes32 indexed electionId,
        string title,
        uint256 startTime,
        uint256 endTime
    );

    /**
     * @dev Cast a vote on-chain
     * @param electionId The unique identifier for the election (as bytes32)
     * @param candidateId The unique identifier for the candidate (as bytes32)
     * @return voteHash The unique hash identifying this vote
     */
    function castVote(
        bytes32 electionId,
        bytes32 candidateId
    ) external returns (bytes32 voteHash) {
        require(!hasVoted[electionId][msg.sender], "Already voted in this election");
        
        // Generate unique vote hash
        voteHash = keccak256(abi.encodePacked(
            electionId,
            candidateId,
            msg.sender,
            block.timestamp,
            block.number
        ));
        
        // Record the vote
        votes[voteHash] = Vote({
            electionId: electionId,
            candidateId: candidateId,
            voter: msg.sender,
            timestamp: block.timestamp,
            blockNumber: block.number
        });
        
        // Mark voter as having voted
        hasVoted[electionId][msg.sender] = true;
        
        // Store vote hash for enumeration
        voteHashes.push(voteHash);
        
        // Emit event for transparency
        emit VoteCast(
            voteHash,
            electionId,
            candidateId,
            msg.sender,
            block.timestamp,
            block.number
        );
        
        return voteHash;
    }

    /**
     * @dev Get vote details by hash
     * @param voteHash The unique vote hash
     * @return The Vote struct
     */
    function getVote(bytes32 voteHash) external view returns (Vote memory) {
        return votes[voteHash];
    }

    /**
     * @dev Check if an address has voted in an election
     * @param electionId The election identifier
     * @param voter The voter address
     * @return bool True if the voter has voted
     */
    function checkHasVoted(bytes32 electionId, address voter) external view returns (bool) {
        return hasVoted[electionId][voter];
    }

    /**
     * @dev Get total number of votes recorded
     * @return uint256 Total vote count
     */
    function getTotalVotes() external view returns (uint256) {
        return voteHashes.length;
    }

    /**
     * @dev Get vote hash by index
     * @param index The index in the voteHashes array
     * @return bytes32 The vote hash
     */
    function getVoteHashByIndex(uint256 index) external view returns (bytes32) {
        require(index < voteHashes.length, "Index out of bounds");
        return voteHashes[index];
    }

    /**
     * @dev Verify a vote exists and matches the claimed data
     * @param voteHash The vote hash to verify
     * @param electionId Expected election ID
     * @param candidateId Expected candidate ID
     * @param voter Expected voter address
     * @return bool True if the vote is valid and matches
     */
    function verifyVote(
        bytes32 voteHash,
        bytes32 electionId,
        bytes32 candidateId,
        address voter
    ) external view returns (bool) {
        Vote memory vote = votes[voteHash];
        return (
            vote.electionId == electionId &&
            vote.candidateId == candidateId &&
            vote.voter == voter &&
            vote.timestamp > 0
        );
    }
}
