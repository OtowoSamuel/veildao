# VeilDAO 🔒

**Encrypted DAO Treasury Management powered by Fhenix CoFHE**

VeilDAO is the first privacy-preserving DAO treasury protocol using Fully Homomorphic Encryption. It lets DAOs set encrypted budgets, enforce spending limits on hidden values, and give governors permissioned access — all without exposing financial data on-chain.

> Built for [Fhenix 'Private By Design' dApp Buildathon](https://app.akindo.io/wave-hacks/Nm2qjzEBgCqJD90W)

---

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
┌──────────────────────────────────────────────────┐
│                  Frontend (Next.js)               │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐ │
│  │ Dashboard   │  │ Budgets    │  │ Proposals  │ │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘ │
│        │               │               │         │
│        └───────────┬────┘───────────────┘         │
│                    │                              │
│            ┌───────▼────────┐                     │
│            │  cofhejs SDK   │  ← Client-side      │
│            │  encrypt /     │    encryption       │
│            │  decrypt       │                     │
│            └───────┬────────┘                     │
└────────────────────┼─────────────────────────────┘
                     │
         ┌───────────▼───────────────┐
         │      VeilDAO.sol          │
         │                           │
         │  allocateBudget()  →  euint32 budget   │
         │  proposeSpend()    →  FHE.lte()        │
         │  executeSpend()    →  FHE.select()     │
         │  viewBudget()      →  governor-only    │
         │                           │
         │  FHE Operations:          │
         │  • FHE.add(a, b)          │
         │  • FHE.sub(a, b)          │
         │  • FHE.lte(a, b)          │
         │  • FHE.select(cond, a, b) │
         └───────────┬───────────────┘
                     │
             ┌───────▼────────┐
             │  Fhenix CoFHE  │
             │  Coprocessor   │
             │  (off-chain    │
             │   FHE compute) │
             └────────────────┘
```

## FHE Operations Used

| Operation | Purpose | Example |
|---|---|---|
| `FHE.asEuint32(value)` | Convert plaintext to encrypted | Store budget amounts |
| `FHE.add(a, b)` | Add encrypted values | Accumulate budgets |
| `FHE.sub(a, b)` | Subtract encrypted values | Deduct after spend |
| `FHE.lte(a, b)` | Encrypted comparison | Budget enforcement |
| `FHE.select(cond, a, b)` | Conditional on encrypted bool | Deduct only if within budget |
| `FHE.allowThis()` | Contract access control | Contract can read its own data |
| `FHE.allow(ct, addr)` | Per-address access | Governor-only decryption |

## Tech Stack

- **Smart Contracts**: Solidity 0.8.25 + `@fhenixprotocol/cofhe-contracts`
- **Frontend**: Next.js 14 (App Router) + ethers.js
- **FHE SDK**: `@cofhe/sdk` for client-side encryption/decryption
- **Dev Tools**: Hardhat + `@cofhe/hardhat-plugin` (mock FHE for testing)
- **Network**: Arbitrum Sepolia / Base Sepolia (Cancun EVM)

## Quick Start

```bash
# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run tests (with mock FHE)
npx hardhat test

# Deploy to Arbitrum Sepolia
cp .env.example .env
# Edit .env with your private key
npm run deploy:arb-sepolia

# Run frontend
cd frontend
npm install
npm run dev
```

## Project Structure

```
veildao/
├── contracts/
│   └── VeilDAO.sol          # Core FHE treasury contract
├── test/
│   └── VeilDAO.test.ts      # Comprehensive test suite
├── scripts/
│   └── deploy.ts            # Deployment script
├── frontend/
│   ├── app/
│   │   ├── page.tsx         # Dashboard
│   │   ├── budget/          # Budget management
│   │   ├── proposals/       # Proposal creation & voting
│   │   └── governors/       # Governor management
│   ├── lib/
│   │   ├── contract.ts      # ABI & config
│   │   └── wallet.tsx       # Wallet context provider
│   └── components/
│       └── Navbar.tsx        # Navigation bar
├── hardhat.config.ts         # CoFHE plugin + testnet config
└── package.json
```

## Key Features

### 🔐 Encrypted Budget Management
Governors allocate budgets per category. Amounts are encrypted as `euint32` — invisible to the public. Only authorized governors can decrypt via the permit system.

### ⚖️ FHE Budget Enforcement
When a spend proposal is executed, the contract uses `FHE.lte(spendAmount, budget)` to verify the spend doesn't exceed the budget — all without revealing either value. `FHE.select()` conditionally deducts from the budget.

### 🗳️ Multi-Governor Voting
Proposals require threshold votes from governors. Configurable quorum ensures democratic control over encrypted treasury operations.

### 🛡️ Privacy-by-Design Access Control
- `FHE.allowThis()` — contract can process its own encrypted data
- `FHE.allow(ctHash, governor)` — per-governor decryption rights
- `FHE.allowPublic()` — optional public reveal for transparency

## Wave 2 Progress Updates

### Phase 1: Research & Architecture ✅
- Analyzed CoFHE coprocessor architecture
- Designed encrypted treasury data model (euint32 budgets, proposals)
- Selected FHE operations for budget enforcement (lte, select)

### Phase 2: Core Contract ✅
- Implemented `VeilDAO.sol` with 5 budget categories
- Multi-governor voting system with configurable threshold
- Full FHE budget enforcement: encrypt → compare → conditionally deduct
- 9 Solidity files compiled successfully (Cancun EVM)

### Phase 3: Frontend ✅
- Premium dark-mode dashboard with glassmorphism design
- Budget allocation with FHE encryption flow
- Proposal creation, voting, and execution UI
- Governor management with permissions explainer
- Wallet connection (MetaMask) with governor detection

### Phase 4: Testing & Deployment 🔄
- Test suite written with mock FHE
- Ready for testnet deployment

## License

MIT
