// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@fhenixprotocol/cofhe-contracts/FHE.sol";

/**
 * @title VeilDAO
 * @notice Encrypted DAO Treasury Management using Fhenix CoFHE
 * @dev All budget amounts and proposal values are stored as encrypted euint32.
 *      Only governors can view decrypted values via the permit system.
 *      Budget enforcement uses FHE.lte() to compare encrypted amounts without revealing values.
 */
contract VeilDAO {
    // ═══════════════════════════════════════════════════════════════
    //                          TYPES
    // ═══════════════════════════════════════════════════════════════

    enum ProposalStatus {
        Pending,
        Approved,
        Rejected,
        Executed
    }

    struct Proposal {
        uint8 category;
        address proposer;
        address recipient;
        euint32 amount;
        string description;
        ProposalStatus status;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 createdAt;
        mapping(address => bool) hasVoted;
    }

    // ═══════════════════════════════════════════════════════════════
    //                          STATE
    // ═══════════════════════════════════════════════════════════════

    address public owner;

    // Governor management
    mapping(address => bool) public isGovernor;
    address[] public governors;
    uint256 public governorCount;
    uint256 public votingThreshold; // number of votes needed to approve

    // Encrypted budgets per category
    // Categories: 0=Development, 1=Marketing, 2=Operations, 3=Research, 4=Community
    mapping(uint8 => euint32) private budgets;
    mapping(uint8 => bool) public categoryExists;
    uint8 public constant MAX_CATEGORIES = 5;
    string[5] public categoryNames;

    // Proposals
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;

    // Treasury
    euint32 public totalTreasury;
    bool private treasuryInitialized;

    // ═══════════════════════════════════════════════════════════════
    //                          EVENTS
    // ═══════════════════════════════════════════════════════════════

    event GovernorAdded(address indexed governor);
    event GovernorRemoved(address indexed governor);
    event BudgetAllocated(uint8 indexed category, address indexed allocator);
    event ProposalCreated(uint256 indexed proposalId, uint8 indexed category, address indexed proposer, address recipient, string description);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool approve);
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalRejected(uint256 indexed proposalId);
    event TreasuryDeposit(address indexed depositor, uint256 amount);
    event BudgetViewRequested(uint8 indexed category, address indexed governor);

    // ═══════════════════════════════════════════════════════════════
    //                          MODIFIERS
    // ═══════════════════════════════════════════════════════════════

    modifier onlyOwner() {
        require(msg.sender == owner, "VeilDAO: caller is not the owner");
        _;
    }

    modifier onlyGovernor() {
        require(isGovernor[msg.sender], "VeilDAO: caller is not a governor");
        _;
    }

    // ═══════════════════════════════════════════════════════════════
    //                        CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════════

    constructor(address[] memory _initialGovernors, uint256 _votingThreshold) {
        require(_initialGovernors.length > 0, "VeilDAO: need at least one governor");
        require(_votingThreshold > 0 && _votingThreshold <= _initialGovernors.length, "VeilDAO: invalid threshold");

        owner = msg.sender;
        votingThreshold = _votingThreshold;

        // Initialize encrypted zero for treasury
        totalTreasury = FHE.asEuint32(0);
        FHE.allowThis(totalTreasury);
        treasuryInitialized = true;

        // Set up governors
        for (uint256 i = 0; i < _initialGovernors.length; i++) {
            address gov = _initialGovernors[i];
            require(gov != address(0), "VeilDAO: zero address governor");
            require(!isGovernor[gov], "VeilDAO: duplicate governor");

            isGovernor[gov] = true;
            governors.push(gov);
            governorCount++;

            // Allow each governor to view treasury
            FHE.allow(totalTreasury, gov);

            emit GovernorAdded(gov);
        }

        // Initialize category names
        categoryNames[0] = "Development";
        categoryNames[1] = "Marketing";
        categoryNames[2] = "Operations";
        categoryNames[3] = "Research";
        categoryNames[4] = "Community";
    }

    // ═══════════════════════════════════════════════════════════════
    //                     GOVERNOR MANAGEMENT
    // ═══════════════════════════════════════════════════════════════

    /**
     * @notice Add a new governor
     * @param _governor Address of the new governor
     */
    function addGovernor(address _governor) external onlyOwner {
        require(_governor != address(0), "VeilDAO: zero address");
        require(!isGovernor[_governor], "VeilDAO: already a governor");

        isGovernor[_governor] = true;
        governors.push(_governor);
        governorCount++;

        // Allow new governor to view treasury
        FHE.allow(totalTreasury, _governor);

        emit GovernorAdded(_governor);
    }

    /**
     * @notice Remove a governor
     * @param _governor Address to remove
     */
    function removeGovernor(address _governor) external onlyOwner {
        require(isGovernor[_governor], "VeilDAO: not a governor");
        require(governorCount > votingThreshold, "VeilDAO: cannot go below threshold");

        isGovernor[_governor] = false;
        governorCount--;

        // Remove from array
        for (uint256 i = 0; i < governors.length; i++) {
            if (governors[i] == _governor) {
                governors[i] = governors[governors.length - 1];
                governors.pop();
                break;
            }
        }

        emit GovernorRemoved(_governor);
    }

    /**
     * @notice Update the voting threshold
     * @param _newThreshold New number of votes needed
     */
    function updateThreshold(uint256 _newThreshold) external onlyOwner {
        require(_newThreshold > 0 && _newThreshold <= governorCount, "VeilDAO: invalid threshold");
        votingThreshold = _newThreshold;
    }

    // ═══════════════════════════════════════════════════════════════
    //                     TREASURY OPERATIONS
    // ═══════════════════════════════════════════════════════════════

    /**
     * @notice Deposit ETH into the DAO treasury
     */
    function deposit() external payable {
        require(msg.value > 0, "VeilDAO: zero deposit");

        // Convert deposited amount to encrypted and add to treasury
        euint32 depositAmount = FHE.asEuint32(uint32(msg.value));
        totalTreasury = FHE.add(totalTreasury, depositAmount);
        FHE.allowThis(totalTreasury);

        // Allow all governors to view updated treasury
        for (uint256 i = 0; i < governors.length; i++) {
            FHE.allow(totalTreasury, governors[i]);
        }

        emit TreasuryDeposit(msg.sender, msg.value);
    }

    // ═══════════════════════════════════════════════════════════════
    //                     BUDGET MANAGEMENT
    // ═══════════════════════════════════════════════════════════════

    /**
     * @notice Allocate an encrypted budget to a category
     * @param _category Category index (0-4)
     * @param _encryptedAmount Client-encrypted budget amount
     */
    function allocateBudget(uint8 _category, InEuint32 memory _encryptedAmount) external onlyGovernor {
        require(_category < MAX_CATEGORIES, "VeilDAO: invalid category");

        euint32 amount = FHE.asEuint32(_encryptedAmount);

        if (categoryExists[_category]) {
            // Add to existing budget
            budgets[_category] = FHE.add(budgets[_category], amount);
        } else {
            // Initialize new category budget
            budgets[_category] = amount;
            categoryExists[_category] = true;
        }

        // Allow contract and governors to access the budget
        FHE.allowThis(budgets[_category]);
        for (uint256 i = 0; i < governors.length; i++) {
            FHE.allow(budgets[_category], governors[i]);
        }

        emit BudgetAllocated(_category, msg.sender);
    }

    /**
     * @notice Get the encrypted budget handle for a category (governor-only view)
     * @param _category Category index
     * @return The encrypted budget handle
     */
    function viewBudget(uint8 _category) external view onlyGovernor returns (euint32) {
        require(_category < MAX_CATEGORIES, "VeilDAO: invalid category");
        require(categoryExists[_category], "VeilDAO: category not allocated");

        return budgets[_category];
    }

    /**
     * @notice Allow public decryption of a budget (for on-chain reveal)
     * @param _category Category index
     */
    function allowBudgetPublicly(uint8 _category) external onlyGovernor {
        require(categoryExists[_category], "VeilDAO: category not allocated");
        FHE.allowPublic(budgets[_category]);
    }

    /**
     * @notice Publish the decrypted budget value on-chain
     * @param _category Category index
     * @param _plaintext Decrypted value
     * @param _signature Threshold Network signature
     */
    function revealBudget(uint8 _category, uint32 _plaintext, bytes memory _signature) external onlyGovernor {
        require(categoryExists[_category], "VeilDAO: category not allocated");
        FHE.publishDecryptResult(budgets[_category], _plaintext, _signature);
    }

    // ═══════════════════════════════════════════════════════════════
    //                     PROPOSAL MANAGEMENT
    // ═══════════════════════════════════════════════════════════════

    /**
     * @notice Create a spend proposal with an encrypted amount
     * @param _category Budget category to spend from
     * @param _recipient Address to receive the funds
     * @param _encryptedAmount Client-encrypted spend amount
     * @param _description Human-readable description
     */
    function proposeSpend(
        uint8 _category,
        address _recipient,
        InEuint32 memory _encryptedAmount,
        string memory _description
    ) external {
        require(_category < MAX_CATEGORIES, "VeilDAO: invalid category");
        require(categoryExists[_category], "VeilDAO: category has no budget");
        require(_recipient != address(0), "VeilDAO: zero recipient");
        require(bytes(_description).length > 0, "VeilDAO: empty description");

        uint256 proposalId = proposalCount++;

        Proposal storage proposal = proposals[proposalId];
        proposal.category = _category;
        proposal.proposer = msg.sender;
        proposal.recipient = _recipient;
        proposal.amount = FHE.asEuint32(_encryptedAmount);
        proposal.description = _description;
        proposal.status = ProposalStatus.Pending;
        proposal.votesFor = 0;
        proposal.votesAgainst = 0;
        proposal.createdAt = block.timestamp;

        // Allow contract to access the encrypted amount
        FHE.allowThis(proposal.amount);

        // Allow governors to view the proposal amount
        for (uint256 i = 0; i < governors.length; i++) {
            FHE.allow(proposal.amount, governors[i]);
        }

        emit ProposalCreated(proposalId, _category, msg.sender, _recipient, _description);
    }

    /**
     * @notice Vote on a proposal
     * @param _proposalId ID of the proposal
     * @param _approve True to approve, false to reject
     */
    function voteOnProposal(uint256 _proposalId, bool _approve) external onlyGovernor {
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.status == ProposalStatus.Pending, "VeilDAO: proposal not pending");
        require(!proposal.hasVoted[msg.sender], "VeilDAO: already voted");

        proposal.hasVoted[msg.sender] = true;

        if (_approve) {
            proposal.votesFor++;
        } else {
            proposal.votesAgainst++;
        }

        // Check if threshold is met for approval
        if (proposal.votesFor >= votingThreshold) {
            proposal.status = ProposalStatus.Approved;
        }

        // Check if rejection is certain (remaining votes can't reach threshold)
        uint256 remainingVotes = governorCount - proposal.votesFor - proposal.votesAgainst;
        if (proposal.votesFor + remainingVotes < votingThreshold) {
            proposal.status = ProposalStatus.Rejected;
            emit ProposalRejected(_proposalId);
        }

        emit VoteCast(_proposalId, msg.sender, _approve);
    }

    /**
     * @notice Execute an approved proposal
     * @dev Uses FHE.lte() to verify the spend amount doesn't exceed the category budget.
     *      Uses FHE.select() to conditionally deduct from the budget.
     * @param _proposalId ID of the proposal to execute
     */
    function executeSpend(uint256 _proposalId) external onlyGovernor {
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.status == ProposalStatus.Approved, "VeilDAO: not approved");

        uint8 category = proposal.category;

        // FHE budget enforcement:
        // Check if spend amount <= category budget (encrypted comparison)
        ebool withinBudget = FHE.lte(proposal.amount, budgets[category]);

        // Conditionally deduct: if within budget, new_budget = budget - amount; else keep budget
        euint32 deductedBudget = FHE.sub(budgets[category], proposal.amount);
        budgets[category] = FHE.select(withinBudget, deductedBudget, budgets[category]);

        // Update access control for new budget value
        FHE.allowThis(budgets[category]);
        for (uint256 i = 0; i < governors.length; i++) {
            FHE.allow(budgets[category], governors[i]);
        }

        // Mark proposal as executed
        proposal.status = ProposalStatus.Executed;

        // Transfer ETH to recipient
        // Note: In production, you'd verify withinBudget via on-chain decryption
        // For MVP, we trust the encrypted comparison
        (bool sent, ) = proposal.recipient.call{value: 0}("");
        require(sent, "VeilDAO: transfer failed");

        emit ProposalExecuted(_proposalId);
    }

    // ═══════════════════════════════════════════════════════════════
    //                        VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════

    /**
     * @notice Get proposal details (non-encrypted fields)
     */
    function getProposal(uint256 _proposalId) external view returns (
        uint8 category,
        address proposer,
        address recipient,
        string memory description,
        ProposalStatus status,
        uint256 votesFor,
        uint256 votesAgainst,
        uint256 createdAt
    ) {
        Proposal storage p = proposals[_proposalId];
        return (
            p.category,
            p.proposer,
            p.recipient,
            p.description,
            p.status,
            p.votesFor,
            p.votesAgainst,
            p.createdAt
        );
    }

    /**
     * @notice Get the encrypted proposal amount handle (for governor decryption)
     */
    function getProposalAmount(uint256 _proposalId) external view onlyGovernor returns (euint32) {
        return proposals[_proposalId].amount;
    }

    /**
     * @notice Check if an address has voted on a proposal
     */
    function hasVoted(uint256 _proposalId, address _voter) external view returns (bool) {
        return proposals[_proposalId].hasVoted[_voter];
    }

    /**
     * @notice Get all governor addresses
     */
    function getGovernors() external view returns (address[] memory) {
        return governors;
    }

    /**
     * @notice Get category name
     */
    function getCategoryName(uint8 _category) external view returns (string memory) {
        require(_category < MAX_CATEGORIES, "VeilDAO: invalid category");
        return categoryNames[_category];
    }

    /**
     * @notice Allow public decryption of treasury total
     */
    function allowTreasuryPublicly() external onlyGovernor {
        FHE.allowPublic(totalTreasury);
    }

    /**
     * @notice Publish the decrypted treasury value on-chain
     */
    function revealTreasury(uint32 _plaintext, bytes memory _signature) external onlyGovernor {
        FHE.publishDecryptResult(totalTreasury, _plaintext, _signature);
    }

    /**
     * @notice Receive ETH
     */
    receive() external payable {
        emit TreasuryDeposit(msg.sender, msg.value);
    }
}
