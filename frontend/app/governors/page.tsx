"use client";

import { useState } from "react";
import { useWallet } from "@/lib/wallet";
import { Users, Target, ShieldCheck, Eye, Vote, Zap, BarChart2, Lock } from "lucide-react";

// Demo governors for UI showcase
const DEMO_GOVERNORS = [
    { address: "0x742d35Cc6634C0532925a3b844Bc9e7595f3af5d", addedAt: "2024-04-10" },
    { address: "0x8f3dA74271F5b2c56E37a72b5438A5c937C2E9c5", addedAt: "2024-04-10" },
    { address: "0x5b2aE87D5cA1eF23B90C34D9782c87d1f2b7F890", addedAt: "2024-04-12" },
];

export default function GovernorsPage() {
    const { isConnected, isGovernor, address, connect } = useWallet();
    const [showAdd, setShowAdd] = useState(false);
    const [newGovernor, setNewGovernor] = useState("");
    const [newThreshold, setNewThreshold] = useState("");

    const handleAddGovernor = async () => {
        if (!newGovernor) return;
        alert(`Would call addGovernor(${newGovernor}) on the contract.`);
        setShowAdd(false);
        setNewGovernor("");
    };

    const handleRemoveGovernor = (addr: string) => {
        if (confirm(`Remove governor ${addr.slice(0, 10)}...?`)) {
            alert(`Would call removeGovernor(${addr}) on the contract.`);
        }
    };

    if (!isConnected) {
        return (
            <div className="connect-screen">
                <div className="connect-icon" style={{ display: 'flex', justifyContent: 'center' }}><Users size={48} color="var(--primary-light)" /></div>
                <h1 className="connect-title">Governor Management</h1>
                <p className="connect-desc">Connect your wallet to view and manage DAO governors.</p>
                <button className="btn btn-primary" onClick={connect}>Connect Wallet</button>
            </div>
        );
    }

    return (
        <>
            <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                    <h1 className="page-title">Governor Management</h1>
                    <p className="page-subtitle">
                        Manage who can view encrypted data, vote on proposals, and execute treasury operations
                    </p>
                </div>
                {isGovernor && (
                    <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
                        + Add Governor
                    </button>
                )}
            </div>

            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <span className="stat-icon"><Users size={28} /></span>
                    <div className="stat-label">Active Governors</div>
                    <div className="stat-value" style={{ color: "var(--accent-bright)" }}>
                        {DEMO_GOVERNORS.length}
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-icon"><Target size={28} /></span>
                    <div className="stat-label">Voting Threshold</div>
                    <div className="stat-value" style={{ color: "var(--success)" }}>
                        2 of {DEMO_GOVERNORS.length}
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-icon"><ShieldCheck size={28} /></span>
                    <div className="stat-label">Your Role</div>
                    <div className="stat-value" style={{ fontSize: "1.25rem", color: isGovernor ? "var(--accent-bright)" : "var(--text-muted)" }}>
                        {isGovernor ? "Governor" : "Member"}
                    </div>
                </div>
            </div>

            {/* Governor List */}
            <div className="card" style={{ marginBottom: "1.5rem" }}>
                <div className="card-header">
                    <h2 className="card-title">Active Governors</h2>
                    <span className="fhe-indicator">
                        <span className="fhe-lock"><Lock size={14} /></span> Can decrypt encrypted values
                    </span>
                </div>
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Address</th>
                                <th>Added</th>
                                <th>Permissions</th>
                                {isGovernor && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {DEMO_GOVERNORS.map((gov) => (
                                <tr key={gov.address}>
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <div style={{
                                                width: "32px",
                                                height: "32px",
                                                borderRadius: "8px",
                                                background: `linear-gradient(135deg, #${gov.address.slice(2, 8)}, #${gov.address.slice(8, 14)})`,
                                                flexShrink: 0,
                                            }} />
                                            <div>
                                                <div style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "var(--text-primary)" }}>
                                                    {gov.address.slice(0, 10)}...{gov.address.slice(-8)}
                                                </div>
                                                {gov.address.toLowerCase() === address?.toLowerCase() && (
                                                    <span className="badge badge-governor" style={{ marginTop: "2px", fontSize: "0.6rem" }}>
                                                        You
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td>{gov.addedAt}</td>
                                    <td>
                                        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                                            <span className="badge badge-encrypted" style={{ fontSize: "0.6rem" }}>View Budgets</span>
                                            <span className="badge badge-encrypted" style={{ fontSize: "0.6rem" }}>Vote</span>
                                            <span className="badge badge-encrypted" style={{ fontSize: "0.6rem" }}>Execute</span>
                                        </div>
                                    </td>
                                    {isGovernor && (
                                        <td>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleRemoveGovernor(gov.address)}
                                                disabled={DEMO_GOVERNORS.length <= 2}
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Permissions Explainer */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Governor Permissions</h2>
                </div>
                <div className="card-body">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
                        {[
                            { icon: <Eye size={32} color="var(--accent-bright)" />, title: "View Encrypted Data", desc: "Decrypt budget amounts and proposal values via permits" },
                            { icon: <Vote size={32} color="var(--accent-bright)" />, title: "Vote on Proposals", desc: "Approve or reject spend proposals. Threshold votes required" },
                            { icon: <Zap size={32} color="var(--accent-bright)" />, title: "Execute Spends", desc: "Execute approved proposals with FHE budget enforcement" },
                            { icon: <BarChart2 size={32} color="var(--accent-bright)" />, title: "Allocate Budgets", desc: "Assign encrypted budget amounts to treasury categories" },
                        ].map((perm) => (
                            <div key={perm.title} style={{
                                padding: "1.25rem",
                                background: "var(--bg-secondary)",
                                borderRadius: "var(--radius-sm)",
                                border: "1px solid var(--border)",
                            }}>
                                <div style={{ marginBottom: "0.75rem", display: "flex", justifyContent: "flex-start" }}>{perm.icon}</div>
                                <div style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.4rem" }}>{perm.title}</div>
                                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>{perm.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Add Governor Modal */}
            {showAdd && (
                <div className="modal-overlay" onClick={() => setShowAdd(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">Add Governor</h2>

                        <div className="form-group">
                            <label className="form-label">Governor Address</label>
                            <input
                                className="form-input"
                                placeholder="0x..."
                                value={newGovernor}
                                onChange={(e) => setNewGovernor(e.target.value)}
                            />
                            <div style={{ marginTop: "0.4rem", fontSize: "0.7rem", color: "var(--text-muted)" }}>
                                New governors will be able to decrypt all encrypted values via FHE.allow()
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: "0.75rem" }}>
                            <button className="btn btn-primary" onClick={handleAddGovernor} style={{ flex: 1 }}
                                disabled={!newGovernor}>
                                Add Governor
                            </button>
                            <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
