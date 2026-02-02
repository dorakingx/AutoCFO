# AutoCFO - AI Treasury Management Agent

An AI-powered treasury management agent for DAOs that automates yield optimization, liquidity management, and payroll execution.

## Features

### 1. Yield Management
- Automatically invests idle treasury funds into Real World Assets (RWA) on the Arc network
- Monitors and optimizes APY returns
- Real-time yield tracking and reporting

### 2. Liquidity Optimization
- Swaps RWA tokens to USDC using Uniswap v4 when payouts are needed
- Maintains optimal liquidity reserves
- Automated rebalancing based on treasury needs

### 3. Automated Payroll
- Executes USDC payouts to employees and contributors
- Resolves ENS names to addresses automatically
- Scheduled execution on the 25th of each month

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components:** shadcn/ui
- **Blockchain:** Viem, Wagmi (Sepolia testnet)
- **Protocols:**
  - Arc Network (RWA vaults - mocked)
  - Uniswap v4 (swapping - mocked)
  - ENS (name resolution)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (optional):
```bash
# Create .env.local
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
/Users/hatanakatomoya/Developer/AutoCFO/
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Main dashboard page
│   └── globals.css         # Global styles
├── components/
│   ├── ui/                 # shadcn/ui base components
│   ├── dashboard/           # Dashboard-specific components
│   │   ├── treasury-card.tsx
│   │   ├── payroll-list.tsx
│   │   └── agent-status.tsx
│   ├── wallet-connect.tsx  # Wallet connection component
│   └── providers.tsx       # Wagmi/React Query providers
├── lib/
│   ├── agent.ts            # TreasuryAgent class
│   ├── contracts.ts        # Contract interactions (mocked)
│   ├── wagmi.ts            # Wagmi configuration
│   ├── types.ts            # TypeScript types
│   ├── constants.ts        # Constants and mock data
│   └── utils.ts            # Utility functions
└── package.json
```

## Usage

1. **Connect Wallet:** Click "Connect" to connect your MetaMask or WalletConnect wallet (Sepolia testnet)

2. **View Treasury:** The dashboard displays:
   - Total treasury value
   - RWA allocation and APY
   - USDC liquidity reserve
   - Allocation breakdown

3. **Monitor Payrolls:** View upcoming payrolls with recipient ENS names, amounts, and due dates

4. **Start Agent:** Click "Start Agent" to run a full cycle:
   - Check yields from Arc vault
   - Rebalance if needed
   - Execute payroll if it's the 25th

5. **Manual Actions:**
   - "Check Yields" - Manually check Arc vault APY
   - "Rebalance" - Manually trigger rebalancing

## Mock Data

For the hackathon demo, the following are mocked:
- Arc vault contract calls (returns simulated APY)
- Uniswap v4 swap execution (simulates transactions)
- Contract addresses (placeholder addresses)
- Treasury balances (initialized with mock data)

## Notes for Hackathon Judges

- **Arc Integration:** Mock contract that simulates RWA vault deposits with variable APY (5-8% range)
- **Uniswap v4:** Mock swap router that calculates exchange rates (currently 1:1 for demo)
- **ENS Resolution:** Uses Viem's built-in ENS resolver for Sepolia testnet
- **Agent Logic:** Date-based triggers (payroll on 25th) with AI-style decision logs

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## License

MIT
