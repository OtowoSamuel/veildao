"use client";

import { useWallet } from "@/lib/wallet";
import { CATEGORY_NAMES, CATEGORY_ICONS, CATEGORY_COLORS } from "@/lib/contract";

export default function DashboardPage() {
    const { isConnected, isGovernor, connect } = useWallet();

    if (!isConnected) {
        return (
            <div className="connect-screen">
                <div className="connect-icon">🔒</div>
                <h1 className="connect-title">Welcome to VeilDAO</h1>
                <p className="connect-desc">
                    The first privacy-preserving DAO treasury protocol. Encrypted budgets,
                    hidden spending, and governor-controlled access — powered by Fully
                    Homomorphic Encryption.
                </p>
                <button className="btn btn-primary" onClick={connect} style={{ fontSize: "1rem", padding: "14px 32px" }}>
                    Connect Wallet to Start
                </button>
                <div style={{ marginTop: "2rem", display: "flex", gap: "2rem" }}>
                    <div className="fhe-indicator">
                        <span className="fhe-lock">🔐</span> Fhenix CoFHE
                    </div>
                    <div className="fhe-indicator">
                        <span className="fhe-lock">⛓️</span> Arbitrum Sepolia
                    </div>
                    <div className="fhe-indicator">
                        <span className="fhe-lock">🛡️</span> Privacy by Design
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Treasury Dashboard</h1>
                <p className="page-subtitle">
                    Encrypted treasury overview • {isGovernor ? "Governor Access" : "Public View"}
                </p>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <span className="stat-icon">💰</span>
                    <div className="stat-label">Total Treasury</div>
                    <div className="stat-value">
                        <span className="badge badge-encrypted">🔒 Encrypted</span>
                    </div>
                    {isGovernor && (
                        <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            Connect permits to decrypt
                        </div>
                    )}
                </div>

                <div className="stat-card">
                    <span className="stat-icon">📋</span>
                    <div className="stat-label">Active Proposals</div>
                    <div className="stat-value" style={{ color: "var(--warning)" }}>0</div>
                </div>

                <div className="stat-card">
                    <span className="stat-icon">👥</span>
                    <div className="stat-label">Governors</div>
                    <div className="stat-value" style={{ color: "var(--accent-bright)" }}>—</div>
                </div>

                <div className="stat-card">
                    <span className="stat-icon">🔐</span>
                    <div className="stat-label">FHE Status</div>
                    <div className="stat-value" style={{ color: "var(--success)", fontSize: "1.25rem" }}>
                        Active
                    </div>
                    <div style={{ marginTop: "0.25rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        CoFHE Coprocessor Online
                    </div>
                </div>
            </div>

            {/* Budget Categories */}
            <div className="card" style={{ marginBottom: "1.5rem" }}>
                <div className="card-header">
                    <h2 className="card-title">Budget Categories</h2>
                    <span className="fhe-indicator">
                        <span className="fhe-lock">🔐</span> All values encrypted via FHE
                    </span>
                </div>
                <div className="card-body">
                    <div className="budget-grid">
                        {CATEGORY_NAMES.map((name, i) => (
                            <div className="budget-card" key={name}>
                                <div className="budget-header">
                                    <div className="budget-icon" style={{ background: `${CATEGORY_COLORS[i]}20` }}>
                                        {CATEGORY_ICONS[i]}
                                    </div>
                                    <div>
                                        <div className="budget-name">{name}</div>
                                        <div className="budget-amount">
                                            <span className="badge badge-encrypted" style={{ fontSize: "0.65rem" }}>
                                                🔒 Encrypted
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="budget-bar">
                                    <div
                                        className="budget-bar-fill"
                                        style={{
                                            width: "0%",
                                            background: `linear-gradient(90deg, ${CATEGORY_COLORS[i]}, ${CATEGORY_COLORS[i]}80)`,
                                        }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* How it Works */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">How VeilDAO Works</h2>
                </div>
                <div className="card-body">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
                        {[
                            { icon: "🔐", title: "Encrypt", desc: "Budget amounts are encrypted client-side using FHE before being stored on-chain" },
                            { icon: "⚖️", title: "Compare", desc: "Spend proposals are verified against budgets using encrypted comparisons (FHE.lte)" },
                            { icon: "🗳️", title: "Vote", desc: "Governors vote on proposals. Threshold votes required for approval" },
                            { icon: "✅", title: "Execute", desc: "Approved spends deduct from encrypted budgets without revealing values" },
                        ].map((step) => (
                            <div key={step.title} style={{ textAlign: "center", padding: "1rem" }}>
                                <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{step.icon}</div>
                                <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>{step.title}</div>
                                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>{step.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
