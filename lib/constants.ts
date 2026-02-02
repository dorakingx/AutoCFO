import { sepolia } from "viem/chains"
import type { PayrollEntry } from "./types"

/**
 * Sepolia testnet configuration
 */
export const CHAIN = sepolia

/**
 * Mock contract addresses for Sepolia testnet
 * These are placeholder addresses - in production, use real contract addresses
 */
export const CONTRACT_ADDRESSES = {
  // Mock Arc RWA Vault address (Sepolia)
  ARC_VAULT: "0x0000000000000000000000000000000000000001" as `0x${string}`,
  // Mock Uniswap V4 Router address (Sepolia)
  UNISWAP_ROUTER: "0x0000000000000000000000000000000000000002" as `0x${string}`,
  // USDC token address on Sepolia (use actual testnet USDC if available)
  USDC: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238" as `0x${string}`,
  // Mock RWA token address
  RWA_TOKEN: "0x0000000000000000000000000000000000000003" as `0x${string}`,
} as const

/**
 * Mock payroll entries for demo purposes
 */
export const MOCK_PAYROLLS: Omit<PayrollEntry, "status" | "resolvedAddress">[] = [
  {
    id: "1",
    recipient: "alice.eth",
    amount: "5000", // 5000 USDC
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
  },
  {
    id: "2",
    recipient: "bob.eth",
    amount: "3000", // 3000 USDC
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  },
  {
    id: "3",
    recipient: "charlie.eth",
    amount: "2000", // 2000 USDC
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
  },
]

/**
 * Mock initial treasury balance
 */
export const MOCK_TREASURY_BALANCE = {
  total: "1000000", // 1M USDC total
  rwa: {
    amount: "600000", // 600k in RWA
    value: "600000",
    apy: 6.5, // 6.5% APY
  },
  usdc: {
    amount: "400000", // 400k in USDC
    value: "400000",
  },
} as const

/**
 * Agent configuration
 */
export const AGENT_CONFIG = {
  // Day of month to execute payroll (25th)
  PAYROLL_DAY: 25,
  // Minimum USDC balance to maintain for payouts
  MIN_USDC_RESERVE: "10000", // 10k USDC
  // Rebalance threshold (if USDC < MIN_USDC_RESERVE, swap RWA -> USDC)
  REBALANCE_THRESHOLD: 0.1, // 10% of total treasury
} as const
