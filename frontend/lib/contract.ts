// Contract ABI (simplified for frontend interaction)
export const VEILDAO_ABI = [
    // Governor Management
    "function owner() view returns (address)",
    "function isGovernor(address) view returns (bool)",
    "function getGovernors() view returns (address[])",
    "function governorCount() view returns (uint256)",
    "function votingThreshold() view returns (uint256)",
    "function addGovernor(address)",
    "function removeGovernor(address)",

    // Budget
    "function allocateBudget(uint8 category, tuple(bytes data) encryptedAmount)",
    "function viewBudget(uint8 category) view returns (bytes32)",
    "function categoryExists(uint8) view returns (bool)",
    "function getCategoryName(uint8 category) view returns (string)",
    "function allowBudgetPublicly(uint8 category)",
    "function revealBudget(uint8 category, uint32 plaintext, bytes signature)",

    // Proposals
    "function proposeSpend(uint8 category, address recipient, tuple(bytes data) encryptedAmount, string description)",
    "function voteOnProposal(uint256 proposalId, bool approve)",
    "function executeSpend(uint256 proposalId)",
    "function getProposal(uint256 proposalId) view returns (uint8 category, address proposer, address recipient, string description, uint8 status, uint256 votesFor, uint256 votesAgainst, uint256 createdAt)",
    "function getProposalAmount(uint256 proposalId) view returns (bytes32)",
    "function hasVoted(uint256 proposalId, address voter) view returns (bool)",
    "function proposalCount() view returns (uint256)",

    // Treasury
    "function deposit() payable",
    "function totalTreasury() view returns (bytes32)",
    "function allowTreasuryPublicly()",
    "function revealTreasury(uint32 plaintext, bytes signature)",

    // Events
    "event GovernorAdded(address indexed governor)",
    "event GovernorRemoved(address indexed governor)",
    "event BudgetAllocated(uint8 indexed category, address indexed allocator)",
    "event ProposalCreated(uint256 indexed proposalId, uint8 indexed category, address indexed proposer, address recipient, string description)",
    "event VoteCast(uint256 indexed proposalId, address indexed voter, bool approve)",
    "event ProposalExecuted(uint256 indexed proposalId)",
    "event ProposalRejected(uint256 indexed proposalId)",
    "event TreasuryDeposit(address indexed depositor, uint256 amount)",
] as const;

export const CATEGORY_NAMES = [
    "Development",
    "Marketing",
    "Operations",
    "Research",
    "Community",
] as const;

export const CATEGORY_ICONS = ["⚡", "📢", "⚙️", "🔬", "🤝"] as const;

export const CATEGORY_COLORS = [
    "#E4E4E7", // zinc-200
    "#D4D4D8", // zinc-300
    "#A1A1AA", // zinc-400
    "#71717A", // zinc-500
    "#52525B", // zinc-600
] as const;

export const PROPOSAL_STATUS = ["Pending", "Approved", "Rejected", "Executed"] as const;
export const PROPOSAL_STATUS_COLORS = ["#f59e0b", "#10b981", "#ef4444", "#6366f1"] as const;

// Default contract address (update after deployment)
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";

// Supported chain
export const CHAIN_CONFIG = {
    chainId: "0x66eee", // 421614 Arbitrum Sepolia
    chainName: "Arbitrum Sepolia",
    rpcUrls: ["https://sepolia-rollup.arbitrum.io/rpc"],
    blockExplorerUrls: ["https://sepolia.arbiscan.io"],
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
};
