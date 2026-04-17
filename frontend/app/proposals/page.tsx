"use client";

import { useState } from "react";
import { useWallet } from "@/lib/wallet";
import { CATEGORY_NAMES, CATEGORY_ICONS, PROPOSAL_STATUS, PROPOSAL_STATUS_COLORS } from "@/lib/contract";

interface MockProposal {
    id: number;
    category: number;
    proposer: string;
    recipient: string;
    description: string;
    status: number;
    votesFor: number;
    votesAgainst: number;
    createdAt: number;
}

// Demo proposals for UI showcase
const DEMO_PROPOSALS: MockProposal[] = [
    {
        id: 0,
        category: 0,
        proposer: "0x742d...3af5",
        recipient: "0x1234...5678",
        description: "Fund smart contract audit for VeilDAO v2",
        status: 0,
        votesFor: 1,
        votesAgainst: 0,
        createdAt: Date.now() / 1000 - 3600,
    },
    {
        id: 1,
        category: 1,
        proposer: "0x8f3d...9c2e",
        recipient: "0xabcd...efgh",
        description: "Marketing campaign for Fhenix ecosystem launch",
        status: 1,
        votesFor: 2,
        votesAgainst: 0,
        createdAt: Date.now() / 1000 - 86400,
    },
    {
        id: 2,
        category: 3,
        proposer: "0x5b2a...7d1f",
        recipient: "0x9876...5432",
        description: "Research grant for FHE optimization techniques",
        status: 3,
        votesFor: 3,
        votesAgainst: 0,
        createdAt: Date.now() / 1000 - 172800,
    },
];

export default function ProposalsPage() {
    const { isConnected, isGovernor, connect } = useWallet();
    const [showCreate, setShowCreate] = useState(false);
    const [category, setCategory] = useState(0);
    const [recipient, setRecipient] = useState("");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");

    const handleCreateProposal = async () => {
        alert(
            `In the full integration:\n\n` +
            `1. The amount (${amount}) would be encrypted via cofhejs\n` +
            `2. proposeSpend() would be called with the encrypted amount\n` +
            `3. The contract stores it as euint32 — hidden from public\n` +
            `4. Governors can decrypt to see the amount and vote`
        );
        setShowCreate(false);
        setRecipient("");
        setAmount("");
        setDescription("");
    };

    const handleVote = (proposalId: number, approve: boolean) => {
        alert(`Would call voteOnProposal(${proposalId}, ${approve}) on the contract.`);
    };

    const handleExecute = (proposalId: number) => {
        alert(
            `Would call executeSpend(${proposalId}).\n\n` +
            `The contract will:\n` +
            `1. FHE.lte(amount, budget) — encrypted comparison\n` +
            `2. FHE.select(withinBudget, deducted, original) — conditional deduction\n` +
            `3. Transfer funds if within budget`
        );
    };

    if (!isConnected) {
        return (
            <div className="connect-screen">
                <div className="connect-icon">🗳️</div>
                <h1 className="connect-title">Proposals</h1>
                <p className="connect-desc">Connect your wallet to view and create spend proposals.</p>
                <button className="btn btn-primary" onClick={connect}>Connect Wallet</button>
            </div>
        );
    }

    const StatusBadge = ({ status }: { status: number }) => {
        const classes = ["badge-pending", "badge-approved", "badge-rejected", "badge-executed"];
        return (
            <span className={`badge ${classes[status]}`}>
                {PROPOSAL_STATUS[status]}
            </span>
        );
    };

    return (
        <>
            <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                    <h1 className="page-title">Proposals</h1>
                    <p className="page-subtitle">Create, vote, and execute encrypted spend proposals</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                    + New Proposal
                </button>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <span className="stat-icon">📋</span>
                    <div className="stat-label">Total Proposals</div>
                    <div className="stat-value">{DEMO_PROPOSALS.length}</div>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">⏳</span>
                    <div className="stat-label">Pending</div>
                    <div className="stat-value" style={{ color: "var(--warning)" }}>
                        {DEMO_PROPOSALS.filter(p => p.status === 0).length}
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">✅</span>
                    <div className="stat-label">Approved</div>
                    <div className="stat-value" style={{ color: "var(--success)" }}>
                        {DEMO_PROPOSALS.filter(p => p.status === 1).length}
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">⚡</span>
                    <div className="stat-label">Executed</div>
                    <div className="stat-value" style={{ color: "var(--accent-bright)" }}>
                        {DEMO_PROPOSALS.filter(p => p.status === 3).length}
                    </div>
                </div>
            </div>

            {/* Proposals Table */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">All Proposals</h2>
                    <span className="fhe-indicator">
                        <span className="fhe-lock">🔐</span> Amounts are FHE encrypted
                    </span>
                </div>
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Category</th>
                                <th>Description</th>
                                <th>Amount</th>
                                <th>Votes</th>
                                <th>Status</th>
                                {isGovernor && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {DEMO_PROPOSALS.map((proposal) => (
                                <tr key={proposal.id}>
                                    <td style={{ fontFamily: "monospace", fontWeight: 600 }}>#{proposal.id}</td>
                                    <td>
                                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                            {CATEGORY_ICONS[proposal.category]} {CATEGORY_NAMES[proposal.category]}
                                        </span>
                                    </td>
                                    <td style={{ maxWidth: "300px" }}>{proposal.description}</td>
                                    <td>
                                        <span className="badge badge-encrypted">🔒 Encrypted</span>
                                    </td>
                                    <td>
                                        <span style={{ color: "var(--success)" }}>✓ {proposal.votesFor}</span>
                                        {" / "}
                                        <span style={{ color: "var(--danger)" }}>✗ {proposal.votesAgainst}</span>
                                    </td>
                                    <td><StatusBadge status={proposal.status} /></td>
                                    {isGovernor && (
                                        <td>
                                            <div style={{ display: "flex", gap: "6px" }}>
                                                {proposal.status === 0 && (
                                                    <>
                                                        <button className="btn btn-success btn-sm" onClick={() => handleVote(proposal.id, true)}>
                                                            Approve
                                                        </button>
                                                        <button className="btn btn-danger btn-sm" onClick={() => handleVote(proposal.id, false)}>
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                {proposal.status === 1 && (
                                                    <button className="btn btn-primary btn-sm" onClick={() => handleExecute(proposal.id)}>
                                                        Execute
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Proposal Modal */}
            {showCreate && (
                <div className="modal-overlay" onClick={() => setShowCreate(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">Create Spend Proposal</h2>

                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select className="form-select" value={category} onChange={(e) => setCategory(Number(e.target.value))}>
                                {CATEGORY_NAMES.map((name, i) => (
                                    <option key={i} value={i}>{CATEGORY_ICONS[i]} {name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Recipient Address</label>
                            <input
                                className="form-input"
                                placeholder="0x..."
                                value={recipient}
                                onChange={(e) => setRecipient(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Amount (in wei) 🔐</label>
                            <input
                                className="form-input"
                                type="number"
                                placeholder="Amount to request..."
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                            <div style={{ marginTop: "0.4rem", fontSize: "0.7rem", color: "var(--text-muted)" }}>
                                This will be encrypted via FHE before submission
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                className="form-textarea"
                                placeholder="Describe the purpose of this spend..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                            <button className="btn btn-primary" onClick={handleCreateProposal} style={{ flex: 1 }}
                                disabled={!recipient || !amount || !description}>
                                Submit Proposal
                            </button>
                            <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
