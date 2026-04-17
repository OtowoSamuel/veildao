"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@/lib/wallet";
import { Lock, ShieldCheck } from "lucide-react";

export default function Navbar() {
    const { isConnected, address, isGovernor, connect, disconnect } = useWallet();
    const pathname = usePathname();

    const links = [
        { href: "/", label: "Dashboard" },
        { href: "/budget", label: "Budgets" },
        { href: "/proposals", label: "Proposals" },
        { href: "/governors", label: "Governors" },
    ];

    return (
        <nav className="nav">
            <div className="nav-inner">
                <Link href="/" className="nav-logo">
                    <div className="nav-logo-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 21L3 5H8.5L12 13L15.5 5H21L12 21Z" fill="white" />
                            <path d="M12 15L7.5 5H16.5L12 15Z" fill="rgba(255,255,255,0.5)" />
                        </svg>
                    </div>
                    <span>VeilDAO</span>
                    <div className="fhe-ticker">
                        <div className="fhe-ticker-dot"></div>
                        FHE_NODE_STATUS: ACTIVE
                    </div>
                    <span className="fhe-indicator">
                        <span className="fhe-lock"><ShieldCheck size={14} /></span> FHE Encrypted
                    </span>
                </Link>

                <ul className="nav-links">
                    {links.map((link) => (
                        <li key={link.href}>
                            <Link href={link.href} className={`nav-link ${pathname === link.href ? "active" : ""}`}>
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className="wallet-btn">
                    {isConnected ? (
                        <>
                            {isGovernor && <span className="badge badge-governor">Governor</span>}
                            <span className="wallet-dot"></span>
                            <span className="wallet-address">
                                {address?.slice(0, 6)}...{address?.slice(-4)}
                            </span>
                            <button className="btn btn-secondary btn-sm" onClick={disconnect}>
                                Disconnect
                            </button>
                        </>
                    ) : (
                        <button className="btn btn-primary" onClick={connect}>
                            Connect Wallet
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}
