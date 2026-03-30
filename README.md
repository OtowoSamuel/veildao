# VeilDAO 🔒

**Encrypted DAO Treasury Management powered by Fhenix CoFHE**

VeilDAO is the first privacy-preserving DAO treasury protocol using Fully Homomorphic Encryption. It lets DAOs set encrypted budgets, enforce spending limits on hidden values, and give governors permissioned access — all without exposing financial data on-chain.

## The Problem

Every DAO treasury is a glass vault:
- **$25B+** in assets fully exposed on public ledgers
- MEV bots front-run treasury swaps
- Competitors copy financial strategies
- Contributor compensation creates internal politics

## The Solution

VeilDAO uses Fhenix's CoFHE coprocessor to encrypt treasury operations:

| Feature | What the Public Sees | What Governors See |
|---|---|---|
| Budget allocation | Category name only | Encrypted amount (decryptable) |
| Spending proposals | Category + recipient | Encrypted amount + approval status |
| Budget enforcement | ✅ Approved or ❌ Rejected | Full encrypted comparison result |
| Remaining balance | Nothing | Encrypted balance (decryptable) |

## Architecture

```
┌─────────────────────────────────────────┐
│              VeilDAO.sol                │
│                                         │
│  allocateBudget()   → encrypted budget  │
│  proposeSpend()     → FHE comparison    │
│  executeSpend()     → transfer if valid │
│  viewBudget()       → governor-only     │
└───────────────┬─────────────────────────┘
                │
        ┌───────▼────────┐
        │  Fhenix CoFHE  │
        │  (FHE.sol)     │
        │  euint256 ops  │
        └────────────────┘
```

## Tech Stack

- **Smart Contracts**: Solidity + Fhenix CoFHE (`@fhenixprotocol/cofhe-contracts`)
- **Frontend**: Next.js + cofhe.js SDK
- **Network**: Arbitrum / Base Testnet
- **Dev Tools**: Hardhat + cofhe-mock-contracts

## Quick Start

```bash
# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run tests (with mock FHE)
npx hardhat test

# Deploy to testnet
npx hardhat deploy --network arbitrumTestnet
```

## Project Structure

```
veildao/
├── contracts/          # Solidity smart contracts
│   └── VeilDAO.sol     # Core treasury contract
├── test/               # Contract tests
├── frontend/           # Next.js frontend app
├── scripts/            # Deployment scripts
├── hardhat.config.ts   # Hardhat configuration
└── README.md
```

## Built For

[Fhenix 'Private By Design' dApp Buildathon](https://app.akindo.io/wave-hacks/Nm2qjzEBgCqJD90W)

## License

MIT
