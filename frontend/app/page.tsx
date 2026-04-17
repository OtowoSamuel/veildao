"use client";

import { useWallet } from "@/lib/wallet";
import { CATEGORY_NAMES, CATEGORY_COLORS, CONTRACT_ADDRESS } from "@/lib/contract";
import { Lock, Coins, ClipboardList, Users, Cpu, ShieldCheck, Activity, CheckCircle, Zap, Megaphone, Settings, Microscope, Handshake, Network, Scale, CheckSquare, ExternalLink } from "lucide-react";

const BUDGET_ICONS = [
    <Zap key="1" size={20} />,
    <Megaphone key="2" size={20} />,
    <Settings key="3" size={20} />,
    <Microscope key="4" size={20} />,
    <Handshake key="5" size={20} />
];

export default function DashboardPage() {
    const { isConnected, isGovernor, connect } = useWallet();

    if (!isConnected) {
        return (
            <div className="hero-wrapper">
                {/* Visual Depth Layers */}
                <div className="hero-bg"></div>
                <div className="hero-stars"></div>
                <div className="hero-shooting-layer" aria-hidden="true">
                    <span className="hero-comet"></span>
                    <span className="hero-shooting-star star-1"></span>
                    <span className="hero-shooting-star star-2"></span>
                    <span className="hero-shooting-star star-3"></span>
                    <span className="hero-shooting-star star-4"></span>
                </div>
                <div className="hero-glow"></div>

                {/* Main Hero Header */}
                <div className="connect-icon" style={{ marginBottom: "1.5rem", width: "56px", height: "56px", borderRadius: "14px" }}>
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 21L3 5H8.5L12 13L15.5 5H21L12 21Z" fill="white" />
                        <path d="M12 15L7.5 5H16.5L12 15Z" fill="rgba(255,255,255,0.4)" />
                    </svg>
                </div>
                <h1 className="page-title" style={{ fontSize: "3rem", marginBottom: "1rem" }}>VeilDAO Protocol</h1>
                <p className="connect-desc" style={{ maxWidth: "600px", fontSize: "1.1rem", marginBottom: "2rem" }}>
                    The world's first privacy-preserving DAO treasury completely powered by
                    Fully Homomorphic Encryption mathematics. Budgets remain encrypted. Spending remains hidden.
                </p>

                {/* Architecture Flow Diagram */}
                <div className="arch-flow" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '1rem', marginBottom: '3rem',
                    fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-secondary)',
                    flexWrap: 'wrap'
                }}>
                    <div style={{ padding: '0.6rem 1.2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.2)' }}>On-Chain Request</div>
                    <div style={{ color: 'rgba(255,255,255,0.2)' }}>⟶</div>
                    <div style={{ padding: '0.6rem 1.2rem', background: 'rgba(255,255,255,0.08)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.3)', color: 'white', fontWeight: 600 }}>CoFHE Math Gate</div>
                    <div style={{ color: 'rgba(255,255,255,0.2)' }}>⟶</div>
                    <div style={{ padding: '0.6rem 1.2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.2)' }}><Lock size={12} style={{ display: 'inline', marginBottom: '-2px' }} /> Encrypted Vault</div>
                </div>

                <button className="btn btn-primary" onClick={connect} style={{ fontSize: "1.1rem", padding: "16px 40px", borderRadius: "100px" }}>
                    Connect Wallet to Authenticate
                </button>

                {/* Bento Grid Features */}
                <div className="bento-grid">
                    <div className="bento-item">
                        <div className="bento-icon"><ShieldCheck size={20} /></div>
                        <div className="bento-title">Fhenix Encryption</div>
                        <div className="bento-desc">We mathematically encrypt every budget using the state-of-the-art Fhenix CoFHE libraries, shielding funds from competitors.</div>
                    </div>
                    <div className="bento-item">
                        <div className="bento-icon"><Cpu size={20} /></div>
                        <div className="bento-title">Smart Conditionals</div>
                        <div className="bento-desc">Smart contracts execute mathematical comparisons directly against encrypted data via FHE.lte() without ever exposing the numbers.</div>
                    </div>
                    <div className="bento-item">
                        <div className="bento-icon"><Network size={20} /></div>
                        <div className="bento-title">Arbitrum Sepolia</div>
                        <div className="bento-desc">Deployed seamlessly across L2 architectures for ultra-fast transactions while maintaining absolute multi-party privacy.</div>
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
                <div style={{ marginTop: "1rem" }}>
                    <a
                        href={`https://sepolia.arbiscan.io/address/${CONTRACT_ADDRESS}`}
                        target="_blank"
                        rel="noreferrer"
                        className="badge"
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "6px 12px", borderRadius: "100px", color: "var(--text-secondary)", transition: "all 0.2s" }}
                    >
                        <ExternalLink size={14} /> View Verified Smart Contract
                    </a>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <span className="stat-icon"><Coins size={28} /></span>
                    <div className="stat-label">Total Treasury</div>
                    <div className="stat-value">
                        <span className="badge badge-encrypted"><Lock size={12} /> Encrypted</span>
                    </div>
                    {isGovernor && (
                        <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            Connect permits to decrypt
                        </div>
                    )}
                </div>

                <div className="stat-card">
                    <span className="stat-icon"><ClipboardList size={28} /></span>
                    <div className="stat-label">Active Proposals</div>
                    <div className="stat-value" style={{ color: "var(--warning)" }}>0</div>
                </div>

                <div className="stat-card">
                    <span className="stat-icon"><Users size={28} /></span>
                    <div className="stat-label">Governors</div>
                    <div className="stat-value" style={{ color: "var(--accent-bright)" }}>—</div>
                </div>

                <div className="stat-card">
                    <span className="stat-icon"><Cpu size={28} /></span>
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
                        <span className="fhe-lock"><ShieldCheck size={14} /></span> All values encrypted via FHE
                    </span>
                </div>
                <div className="card-body">
                    <div className="budget-grid">
                        {CATEGORY_NAMES.map((name, i) => (
                            <div className="budget-card" key={name}>
                                <div className="budget-header">
                                    <div className="budget-icon" style={{ background: `${CATEGORY_COLORS[i]}20`, color: CATEGORY_COLORS[i] }}>
                                        {BUDGET_ICONS[i]}
                                    </div>
                                    <div>
                                        <div className="budget-name">{name}</div>
                                        <div className="budget-amount">
                                            <span className="badge badge-encrypted" style={{ fontSize: "0.65rem" }}>
                                                <Lock size={10} /> Encrypted
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
                            { icon: <Lock size={32} color="var(--accent-bright)" />, title: "Encrypt", desc: "Budget amounts are encrypted client-side using FHE before being stored on-chain" },
                            { icon: <Scale size={32} color="var(--accent-bright)" />, title: "Compare", desc: "Spend proposals are verified against budgets using encrypted comparisons (FHE.lte)" },
                            { icon: <CheckSquare size={32} color="var(--accent-bright)" />, title: "Vote", desc: "Governors vote on proposals. Threshold votes required for approval" },
                            { icon: <CheckCircle size={32} color="var(--accent-bright)" />, title: "Execute", desc: "Approved spends deduct from encrypted budgets without revealing values" },
                        ].map((step) => (
                            <div key={step.title} style={{ textAlign: "center", padding: "1rem" }}>
                                <div style={{ marginBottom: "0.75rem", display: "flex", justifyContent: "center" }}>{step.icon}</div>
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
