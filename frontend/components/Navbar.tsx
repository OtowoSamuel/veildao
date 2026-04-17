"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@/lib/wallet";

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
                    <div className="nav-logo-icon">🔒</div>
                    <span>VeilDAO</span>
                    <span className="fhe-indicator">
                        <span className="fhe-lock">🔐</span> FHE Encrypted
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
