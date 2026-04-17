import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "@/lib/wallet";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
    title: "VeilDAO — Encrypted DAO Treasury",
    description: "Privacy-preserving DAO treasury management powered by Fhenix CoFHE. Encrypted budgets, hidden spending, governor-controlled access.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <WalletProvider>
                    <Navbar />
                    <main className="main">{children}</main>
                </WalletProvider>
            </body>
        </html>
    );
}
