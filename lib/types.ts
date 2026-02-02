/**
 * Type definitions for AutoCFO treasury management system
 */

export interface PayrollEntry {
  id: string
  recipient: string // ENS name or address
  amount: string // Amount in USDC (as string to preserve precision)
  dueDate: Date
  status: "pending" | "processing" | "completed" | "failed"
  resolvedAddress?: string // Resolved address from ENS
}

export interface TreasuryBalance {
  total: string // Total treasury value in USDC
  rwa: {
    amount: string // Amount invested in RWA
    value: string // Value in USDC
    apy: number // Current APY percentage
  }
  usdc: {
    amount: string // Amount in USDC
    value: string // Same as amount (1:1)
  }
}

export interface AgentStatus {
  timestamp: Date
  message: string
  type: "info" | "success" | "warning" | "error"
  action?: string // Optional action identifier
}

export interface YieldInfo {
  apy: number // Annual Percentage Yield
  source: "arc" // Protocol source
  lastUpdated: Date
}

export interface SwapQuote {
  inputAmount: string
  outputAmount: string
  inputToken: string
  outputToken: string
  slippage: number
}
