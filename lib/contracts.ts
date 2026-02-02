import { createPublicClient, createWalletClient, http, type Address } from "viem"
import { sepolia } from "viem/chains"
import { privateKeyToAccount } from "viem/accounts"
import { CONTRACT_ADDRESSES } from "./constants"
import type { SwapQuote } from "./types"

/**
 * Mock ABIs for Arc RWA Vault and Uniswap V4 Router
 * These simulate the contract interfaces for hackathon demo purposes
 */

// Arc RWA Vault ABI - Mock contract for Real World Assets
export const ARC_VAULT_ABI = [
  {
    name: "deposit",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "shares", type: "uint256" }],
  },
  {
    name: "withdraw",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "shares", type: "uint256" },
    ],
    outputs: [{ name: "amount", type: "uint256" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "balance", type: "uint256" }],
  },
  {
    name: "getAPY",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "apy", type: "uint256" }], // Returns APY as basis points (e.g., 650 = 6.5%)
  },
  {
    name: "totalAssets",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "total", type: "uint256" }],
  },
] as const

// Uniswap V4 Router ABI - Mock contract for token swaps
export const UNISWAP_ROUTER_ABI = [
  {
    name: "swapExactTokensForTokens",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "amountIn", type: "uint256" },
      { name: "amountOutMin", type: "uint256" },
      { name: "path", type: "address[]" },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" },
    ],
    outputs: [{ name: "amounts", type: "uint256[]" }],
  },
  {
    name: "getAmountOut",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "amountIn", type: "uint256" },
      { name: "reserveIn", type: "uint256" },
      { name: "reserveOut", type: "uint256" },
    ],
    outputs: [{ name: "amountOut", type: "uint256" }],
  },
] as const

// USDC ERC20 ABI for transfers
export const ERC20_ABI = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "success", type: "bool" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "balance", type: "uint256" }],
  },
] as const

/**
 * Public client for reading blockchain data
 * Uses Sepolia testnet RPC endpoint
 */
export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
})

/**
 * Mock wallet client - In production, this would be connected via Wagmi
 * For demo purposes, we'll simulate contract calls
 */
let mockWalletClient: ReturnType<typeof createWalletClient> | null = null

/**
 * Initialize wallet client (mock for demo)
 * In production, this would use the connected wallet from Wagmi
 */
export function getWalletClient() {
  if (mockWalletClient) return mockWalletClient
  
  // Create a mock account for demo purposes
  // In production, use the connected wallet from Wagmi hooks
  const mockAccount = privateKeyToAccount(
    "0x0000000000000000000000000000000000000000000000000000000000000001" as `0x${string}`
  )
  
  mockWalletClient = createWalletClient({
    account: mockAccount,
    chain: sepolia,
    transport: http(),
  })
  
  return mockWalletClient
}

/**
 * Mock function to get Arc Vault APY
 * Returns a simulated APY value (5-8% range)
 */
export async function getArcAPY(): Promise<number> {
  // Mock: Simulate fetching APY from Arc vault
  // In production, this would call: await publicClient.readContract({...})
  const mockAPY = 5.5 + Math.random() * 2.5 // Random between 5.5% and 8%
  return Math.round(mockAPY * 100) / 100 // Round to 2 decimals
}

/**
 * Mock function to get Arc Vault balance
 * Returns simulated balance in RWA tokens
 */
export async function getArcBalance(account: Address): Promise<string> {
  // Mock: Simulate reading balance from Arc vault
  // In production: await publicClient.readContract({...})
  return "600000000000000000000000" // Mock: 600k tokens (with 18 decimals)
}

/**
 * Mock function to get USDC balance
 */
export async function getUSDCBalance(account: Address): Promise<string> {
  // Mock: Simulate reading USDC balance
  // In production: await publicClient.readContract({...})
  return "400000000000" // Mock: 400k USDC (with 6 decimals)
}

/**
 * Mock function to get swap quote from Uniswap V4
 * Calculates output amount for a given input amount
 */
export async function getSwapQuote(
  amountIn: string,
  tokenIn: Address,
  tokenOut: Address
): Promise<SwapQuote> {
  // Mock: Simulate Uniswap V4 quote calculation
  // In production: await publicClient.readContract({...})
  
  // Simple mock: assume 1:1 exchange rate for demo
  // In reality, Uniswap V4 would calculate based on pool reserves
  const inputAmount = BigInt(amountIn)
  const outputAmount = inputAmount // Mock 1:1 rate
  
  return {
    inputAmount: amountIn,
    outputAmount: outputAmount.toString(),
    inputToken: tokenIn,
    outputToken: tokenOut,
    slippage: 0.5, // 0.5% slippage
  }
}

/**
 * Mock function to execute swap on Uniswap V4
 * Swaps RWA tokens for USDC
 */
export async function swapToUSDC(
  amountIn: string,
  minAmountOut: string
): Promise<string> {
  // Mock: Simulate swap execution
  // In production: await walletClient.writeContract({...})
  
  // Simulate transaction hash
  const mockTxHash = `0x${Math.random().toString(16).substring(2, 66)}` as `0x${string}`
  
  return mockTxHash
}

/**
 * Mock function to execute USDC transfer
 * Used for payroll payouts
 */
export async function transferUSDC(
  to: Address,
  amount: string
): Promise<string> {
  // Mock: Simulate USDC transfer
  // In production: await walletClient.writeContract({...})
  
  // Simulate transaction hash
  const mockTxHash = `0x${Math.random().toString(16).substring(2, 66)}` as `0x${string}`
  
  return mockTxHash
}

/**
 * Resolve ENS name to address using Viem
 */
export async function resolveENS(name: string): Promise<Address | null> {
  try {
    // Use Viem's built-in ENS resolver
    const address = await publicClient.getEnsAddress({
      name: name.replace(/\.eth$/, ""), // Remove .eth if present
    })
    return address
  } catch (error) {
    console.error(`Failed to resolve ENS name ${name}:`, error)
    return null
  }
}
