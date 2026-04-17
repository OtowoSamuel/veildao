"use client";

import { useState } from "react";
import { useWallet } from "@/lib/wallet";
import { CATEGORY_NAMES, CATEGORY_COLORS } from "@/lib/contract";
import { BarChart2, Lock, ShieldCheck, Zap, Megaphone, Settings, Microscope, Handshake } from "lucide-react";

const BUDGET_ICONS = [
    <Zap key="1" size={20} />,
    <Megaphone key="2" size={20} />,
    <Settings key="3" size={20} />,
    <Microscope key="4" size={20} />,
    <Handshake key="5" size={20} />
];

export default function BudgetPage() {
    const { isConnected, isGovernor, connect, contract } = useWallet();
    const [selectedCategory, setSelectedCategory] = useState(0);
    const [amount, setAmount] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);

    const handleAllocate = async () => {
        if (!contract || !amount) return;
        setIsSubmitting(true);
        setTxHash(null);

        try {
            // In production, this would use cofhejs to encrypt the amount
            // For now, we show the flow
            alert(
                `In the full integration, this amount (${amount}) would be encrypted ` +
                `client-side using cofhejs before being sent to the contract.\n\n` +
                `The encrypted value is stored on-chain as euint32 — nobody can ` +
                `see the actual budget amount except authorized governors.`
            );
        } catch (error) {
            console.error("Allocation failed:", error);
            alert("Transaction failed. Check the console for details.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isConnected) {
        return (
            <div className="connect-screen">
                <div className="connect-icon" style={{ display: 'flex', justifyContent: 'center' }}><BarChart2 size={48} color="var(--primary-light)" /></div>
                <h1 className="connect-title">Budget Management</h1>
                <p className="connect-desc">Connect your wallet to view and manage encrypted budgets.</p>
                <button className="btn btn-primary" onClick={connect}>Connect Wallet</button>
            </div>
        );
    }

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Budget Management</h1>
                <p className="page-subtitle">
                    Allocate encrypted budgets to categories • Only governors can view actual amounts
                </p>
            </div>

            {/* Budget Overview */}
            <div className="budget-grid" style={{ marginBottom: "2rem" }}>
                {CATEGORY_NAMES.map((name, i) => (
                    <div
                        className="budget-card"
                        key={name}
                        style={{
                            cursor: "pointer",
                            borderColor: selectedCategory === i ? CATEGORY_COLORS[i] : undefined,
                            boxShadow: selectedCategory === i ? `0 0 20px ${CATEGORY_COLORS[i]}20` : undefined,
                        }}
                        onClick={() => setSelectedCategory(i)}
                    >
                        <div className="budget-header">
                            <div className="budget-icon" style={{ background: `${CATEGORY_COLORS[i]}20`, color: CATEGORY_COLORS[i] }}>
                                {BUDGET_ICONS[i]}
                            </div>
                            <div>
                                <div className="budget-name">{name}</div>
                                <div className="budget-amount">
                                    {isGovernor ? (
                                        <span className="badge badge-encrypted" style={{ fontSize: "0.65rem" }}>
                                            <Lock size={10} /> Governor: Decryptable
                                        </span>
                                    ) : (
                                        <span className="badge badge-encrypted" style={{ fontSize: "0.65rem" }}>
                                            <Lock size={10} /> Encrypted
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="budget-bar">
                            <div
                                className="budget-bar-fill"
                                style={{
                                    width: selectedCategory === i ? "60%" : "0%",
                                    background: `linear-gradient(90deg, ${CATEGORY_COLORS[i]}, ${CATEGORY_COLORS[i]}80)`,
                                }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Allocate Budget Form */}
            {isGovernor && (
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            Allocate Budget — <span style={{ color: CATEGORY_COLORS[selectedCategory] }}>{BUDGET_ICONS[selectedCategory]}</span> {CATEGORY_NAMES[selectedCategory]}
                        </h2>
                        <span className="fhe-indicator">
                            <span className="fhe-lock"><ShieldCheck size={14} /></span> Client-side encryption
                        </span>
                    </div>
                    <div className="card-body">
                        <div style={{ maxWidth: "480px" }}>
                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select
                                    className="form-select"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(Number(e.target.value))}
                                >
                                    {CATEGORY_NAMES.map((name, i) => (
                                        <option key={i} value={i}>
                                            {CATEGORY_NAMES[i]}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Amount (in wei) <Lock size={14} color="var(--warning)" /></label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="Enter amount to allocate..."
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                                <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--text-muted)", display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                                    <ShieldCheck size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                                    <span>This value will be encrypted using FHE before being stored on-chain. Nobody — not even validators — can see the actual amount.</span>
                                </div>
                            </div>

                            <button
                                className="btn btn-primary"
                                onClick={handleAllocate}
                                disabled={!amount || isSubmitting}
                                style={{ width: "100%" }}
                            >
                                {isSubmitting ? "Encrypting & Submitting..." : `Allocate to ${CATEGORY_NAMES[selectedCategory]}`}
                            </button>

                            {txHash && (
                                <div style={{ marginTop: "1rem", fontSize: "0.8rem", color: "var(--success)" }}>
                                    ✅ Transaction confirmed: {txHash.slice(0, 18)}...
                                </div>
                            )}
                        </div>

                        {/* FHE Explainer */}
                        <div style={{
                            marginTop: "2rem",
                            padding: "1.25rem",
                            background: "rgba(139, 92, 246, 0.06)",
                            borderRadius: "var(--radius-sm)",
                            border: "1px solid rgba(139, 92, 246, 0.15)",
                        }}>
                            <div style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.5rem", color: "#a78bfa" }}>
                                🔐 How Encrypted Budget Allocation Works
                            </div>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                                1. You enter a budget amount in the form above<br />
                                2. The cofhejs SDK encrypts the value client-side using FHE<br />
                                3. The encrypted value is sent to VeilDAO.sol and stored as <code>euint32</code><br />
                                4. The contract can perform math on encrypted values (add, compare) without decrypting<br />
                                5. Only authorized governors can request decryption via permits
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!isGovernor && (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}><Lock size={48} color="var(--text-muted)" /></div>
                        <div className="empty-state-text">Governor Access Required</div>
                        <div className="empty-state-hint">
                            Only governors can allocate budgets. Contact a DAO governor to request access.
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
