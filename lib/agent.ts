import {
  getArcAPY,
  getArcBalance,
  getUSDCBalance,
  getSwapQuote,
  swapToUSDC,
  transferUSDC,
  resolveENS,
  publicClient,
} from "./contracts"
import { CONTRACT_ADDRESSES, AGENT_CONFIG } from "./constants"
import type {
  TreasuryBalance,
  AgentStatus,
  YieldInfo,
  PayrollEntry,
} from "./types"
import { formatUnits, parseUnits } from "viem"

/**
 * TreasuryAgent - AI-powered treasury management agent for DAOs
 * 
 * This agent automates three core tasks:
 * 1. Yield Management: Invests idle treasury funds into RWA on Arc network
 * 2. Liquidity Optimization: Swaps assets to USDC using Uniswap v4 when payouts are needed
 * 3. Automated Payroll: Executes USDC payouts to employees/contributors resolved via ENS names
 */
export class TreasuryAgent {
  private statusLog: AgentStatus[] = []
  private treasuryBalance: TreasuryBalance
  private isRunning: boolean = false

  constructor(initialBalance?: TreasuryBalance) {
    // Initialize with mock balance or provided balance
    this.treasuryBalance = initialBalance || {
      total: "1000000",
      rwa: {
        amount: "600000",
        value: "600000",
        apy: 6.5,
      },
      usdc: {
        amount: "400000",
        value: "400000",
      },
    }
  }

  /**
   * Add status message to agent log
   */
  private addStatus(message: string, type: AgentStatus["type"] = "info", action?: string) {
    this.statusLog.push({
      timestamp: new Date(),
      message,
      type,
      action,
    })
    
    // Keep only last 50 status messages
    if (this.statusLog.length > 50) {
      this.statusLog.shift()
    }
  }

  /**
   * Get current status log
   */
  getStatus(): AgentStatus[] {
    return [...this.statusLog]
  }

  /**
   * Get current treasury balance
   */
  getTreasuryBalance(): TreasuryBalance {
    return { ...this.treasuryBalance }
  }

  /**
   * Check yields from Arc RWA vault
   * Fetches current APY and updates treasury balance
   */
  async checkYields(): Promise<YieldInfo> {
    this.addStatus("Checking yields from Arc RWA vault...", "info", "checkYields")
    
    try {
      // Fetch current APY from Arc vault
      const apy = await getArcAPY()
      
      // Update treasury balance with new APY
      this.treasuryBalance.rwa.apy = apy
      
      // Calculate new RWA value based on APY (simplified: assume value grows with yield)
      const rwaValue = parseFloat(this.treasuryBalance.rwa.value)
      const newRwaValue = rwaValue * (1 + apy / 100 / 365) // Daily compounding approximation
      this.treasuryBalance.rwa.value = newRwaValue.toFixed(2)
      
      // Recalculate total
      const total =
        parseFloat(this.treasuryBalance.rwa.value) +
        parseFloat(this.treasuryBalance.usdc.value)
      this.treasuryBalance.total = total.toFixed(2)
      
      this.addStatus(
        `Arc vault APY: ${apy}% | RWA value updated`,
        "success",
        "checkYields"
      )
      
      return {
        apy,
        source: "arc",
        lastUpdated: new Date(),
      }
    } catch (error) {
      this.addStatus(
        `Failed to check yields: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error",
        "checkYields"
      )
      throw error
    }
  }

  /**
   * Rebalance treasury by swapping RWA to USDC when needed
   * Checks if USDC balance is below threshold and swaps accordingly
   */
  async rebalance(): Promise<string | null> {
    this.addStatus("Checking if rebalancing is needed...", "info", "rebalance")
    
    try {
      const usdcBalance = parseFloat(this.treasuryBalance.usdc.value)
      const minReserve = parseFloat(AGENT_CONFIG.MIN_USDC_RESERVE)
      const totalValue = parseFloat(this.treasuryBalance.total)
      const threshold = totalValue * AGENT_CONFIG.REBALANCE_THRESHOLD
      
      // Check if USDC balance is below minimum reserve
      if (usdcBalance < minReserve) {
        const needed = minReserve - usdcBalance
        const rwaBalance = parseFloat(this.treasuryBalance.rwa.value)
        
        // Check if we have enough RWA to swap
        if (rwaBalance >= needed) {
          this.addStatus(
            `USDC balance below threshold. Swapping ${needed.toFixed(2)} USDC worth of RWA...`,
            "warning",
            "rebalance"
          )
          
          // Get swap quote from Uniswap V4
          const quote = await getSwapQuote(
            parseUnits(needed.toString(), 18).toString(), // RWA has 18 decimals
            CONTRACT_ADDRESSES.RWA_TOKEN,
            CONTRACT_ADDRESSES.USDC
          )
          
          // Execute swap
          const txHash = await swapToUSDC(
            quote.inputAmount,
            quote.outputAmount
          )
          
          // Update balances (mock update)
          this.treasuryBalance.rwa.value = (rwaBalance - needed).toFixed(2)
          this.treasuryBalance.usdc.value = (usdcBalance + parseFloat(quote.outputAmount) / 1e6).toFixed(2) // USDC has 6 decimals
          this.treasuryBalance.total = (
            parseFloat(this.treasuryBalance.rwa.value) +
            parseFloat(this.treasuryBalance.usdc.value)
          ).toFixed(2)
          
          this.addStatus(
            `Rebalancing complete! Swapped RWA → USDC. TX: ${txHash.slice(0, 10)}...`,
            "success",
            "rebalance"
          )
          
          return txHash
        } else {
          this.addStatus(
            "Insufficient RWA balance for rebalancing. Need to wait for yields.",
            "warning",
            "rebalance"
          )
          return null
        }
      } else {
        this.addStatus("USDC balance sufficient. No rebalancing needed.", "info", "rebalance")
        return null
      }
    } catch (error) {
      this.addStatus(
        `Rebalancing failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error",
        "rebalance"
      )
      throw error
    }
  }

  /**
   * Execute payroll by resolving ENS names and sending USDC transfers
   * Resolves ENS names to addresses and executes transfers
   */
  async executePayroll(recipients: PayrollEntry[]): Promise<{
    successful: string[]
    failed: { recipient: string; reason: string }[]
  }> {
    this.addStatus(
      `Starting payroll execution for ${recipients.length} recipients...`,
      "info",
      "executePayroll"
    )
    
    const successful: string[] = []
    const failed: { recipient: string; reason: string }[] = []
    
    // Check if today is payroll day (25th of month)
    const today = new Date()
    const isPayrollDay = today.getDate() === AGENT_CONFIG.PAYROLL_DAY
    
    if (!isPayrollDay) {
      this.addStatus(
        `Not payroll day (${AGENT_CONFIG.PAYROLL_DAY}th). Skipping execution.`,
        "info",
        "executePayroll"
      )
      return { successful, failed }
    }
    
    // Ensure we have enough USDC
    await this.rebalance()
    
    for (const recipient of recipients) {
      try {
        this.addStatus(
          `Resolving ENS name: ${recipient.recipient}...`,
          "info",
          "executePayroll"
        )
        
        // Resolve ENS name to address
        const address = await resolveENS(recipient.recipient)
        
        if (!address) {
          failed.push({
            recipient: recipient.recipient,
            reason: "ENS resolution failed",
          })
          this.addStatus(
            `Failed to resolve ENS: ${recipient.recipient}`,
            "error",
            "executePayroll"
          )
          continue
        }
        
        this.addStatus(
          `Resolved ${recipient.recipient} → ${address.slice(0, 10)}...`,
          "success",
          "executePayroll"
        )
        
        // Check if we have enough USDC
        const usdcBalance = parseFloat(this.treasuryBalance.usdc.value)
        const amount = parseFloat(recipient.amount)
        
        if (usdcBalance < amount) {
          failed.push({
            recipient: recipient.recipient,
            reason: "Insufficient USDC balance",
          })
          this.addStatus(
            `Insufficient USDC for ${recipient.recipient}. Need ${amount}, have ${usdcBalance}`,
            "error",
            "executePayroll"
          )
          continue
        }
        
        // Execute USDC transfer
        this.addStatus(
          `Transferring ${amount} USDC to ${recipient.recipient}...`,
          "info",
          "executePayroll"
        )
        
        const txHash = await transferUSDC(
          address,
          parseUnits(amount.toString(), 6).toString() // USDC has 6 decimals
        )
        
        // Update balance
        this.treasuryBalance.usdc.value = (usdcBalance - amount).toFixed(2)
        this.treasuryBalance.total = (
          parseFloat(this.treasuryBalance.rwa.value) +
          parseFloat(this.treasuryBalance.usdc.value)
        ).toFixed(2)
        
        successful.push(txHash)
        this.addStatus(
          `Payroll sent to ${recipient.recipient}! TX: ${txHash.slice(0, 10)}...`,
          "success",
          "executePayroll"
        )
      } catch (error) {
        failed.push({
          recipient: recipient.recipient,
          reason: error instanceof Error ? error.message : "Unknown error",
        })
        this.addStatus(
          `Failed to pay ${recipient.recipient}: ${error instanceof Error ? error.message : "Unknown error"}`,
          "error",
          "executePayroll"
        )
      }
    }
    
    this.addStatus(
      `Payroll execution complete! ${successful.length} successful, ${failed.length} failed.`,
      successful.length > 0 ? "success" : "error",
      "executePayroll"
    )
    
    return { successful, failed }
  }

  /**
   * Run agent cycle - checks yields, rebalances, and executes payroll if needed
   */
  async runCycle(payrolls: PayrollEntry[]): Promise<void> {
    if (this.isRunning) {
      this.addStatus("Agent cycle already running. Skipping.", "warning")
      return
    }
    
    this.isRunning = true
    this.addStatus("Starting agent cycle...", "info", "runCycle")
    
    try {
      // 1. Check yields
      await this.checkYields()
      
      // 2. Rebalance if needed
      await this.rebalance()
      
      // 3. Check and execute payroll if it's payroll day
      const today = new Date()
      const isPayrollDay = today.getDate() === AGENT_CONFIG.PAYROLL_DAY
      
      if (isPayrollDay) {
        const pendingPayrolls = payrolls.filter((p) => p.status === "pending")
        if (pendingPayrolls.length > 0) {
          await this.executePayroll(pendingPayrolls)
        }
      }
      
      this.addStatus("Agent cycle completed successfully!", "success", "runCycle")
    } catch (error) {
      this.addStatus(
        `Agent cycle failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error",
        "runCycle"
      )
    } finally {
      this.isRunning = false
    }
  }
}
