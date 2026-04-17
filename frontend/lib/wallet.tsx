"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { ethers } from "ethers";
import { VEILDAO_ABI, CONTRACT_ADDRESS, CHAIN_CONFIG } from "./contract";

interface WalletState {
    isConnected: boolean;
    address: string | null;
    isGovernor: boolean;
    provider: ethers.BrowserProvider | null;
    signer: ethers.JsonRpcSigner | null;
    contract: ethers.Contract | null;
    chainId: string | null;
    connect: () => Promise<void>;
    disconnect: () => void;
}

const WalletContext = createContext<WalletState>({
    isConnected: false,
    address: null,
    isGovernor: false,
    provider: null,
    signer: null,
    contract: null,
    chainId: null,
    connect: async () => { },
    disconnect: () => { },
});

export function useWallet() {
    return useContext(WalletContext);
}

export function WalletProvider({ children }: { children: ReactNode }) {
    const [isConnected, setIsConnected] = useState(false);
    const [address, setAddress] = useState<string | null>(null);
    const [isGovernor, setIsGovernor] = useState(false);
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
    const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
    const [contract, setContract] = useState<ethers.Contract | null>(null);
    const [chainId, setChainId] = useState<string | null>(null);

    const checkGovernorStatus = useCallback(async (contract: ethers.Contract, address: string) => {
        try {
            console.log("🔍 Checking governor status for:", address, "on contract:", await contract.getAddress());
            const isGov = await contract.isGovernor(address);
            console.log("✅ isGovernor map returned:", isGov);
            setIsGovernor(isGov);
        } catch (error) {
            console.error("❌ CRITICAL ERROR in checkGovernorStatus:", error);
            setIsGovernor(false);
        }
    }, []);

    const connect = useCallback(async () => {
        if (typeof window === "undefined" || !window.ethereum) {
            alert("Please install MetaMask to use VeilDAO");
            return;
        }

        try {
            const browserProvider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await browserProvider.send("eth_requestAccounts", []);
            const walletSigner = await browserProvider.getSigner();
            const network = await browserProvider.getNetwork();

            const veildaoContract = new ethers.Contract(
                CONTRACT_ADDRESS,
                VEILDAO_ABI,
                walletSigner
            );

            setProvider(browserProvider);
            setSigner(walletSigner);
            setContract(veildaoContract);
            setAddress(accounts[0]);
            setChainId("0x" + network.chainId.toString(16));
            setIsConnected(true);

            await checkGovernorStatus(veildaoContract, accounts[0]);
        } catch (error) {
            console.error("Failed to connect:", error);
        }
    }, [checkGovernorStatus]);

    const disconnect = useCallback(() => {
        setIsConnected(false);
        setAddress(null);
        setIsGovernor(false);
        setProvider(null);
        setSigner(null);
        setContract(null);
        setChainId(null);
    }, []);

    useEffect(() => {
        if (typeof window === "undefined" || !window.ethereum) return;

        const handleAccountsChanged = (accounts: unknown) => {
            const accts = accounts as string[];
            if (accts.length === 0) {
                disconnect();
            } else {
                setAddress(accts[0]);
                if (contract) checkGovernorStatus(contract, accts[0]);
            }
        };

        const handleChainChanged = () => window.location.reload();

        window.ethereum.on("accountsChanged", handleAccountsChanged);
        window.ethereum.on("chainChanged", handleChainChanged);

        return () => {
            window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
            window.ethereum?.removeListener("chainChanged", handleChainChanged);
        };
    }, [contract, checkGovernorStatus, disconnect]);

    return (
        <WalletContext.Provider
            value={{ isConnected, address, isGovernor, provider, signer, contract, chainId, connect, disconnect }}
        >
            {children}
        </WalletContext.Provider>
    );
}
