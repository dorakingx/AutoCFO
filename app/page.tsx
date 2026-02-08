"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { WalletConnect } from "@/components/wallet-connect"
import { TreasuryCard } from "@/components/dashboard/treasury-card"
import { PayrollList } from "@/components/dashboard/payroll-list"
import { AgentStatusLog } from "@/components/dashboard/agent-status"
import { TreasuryAgent } from "@/lib/agent"
import { MOCK_PAYROLLS, MOCK_TREASURY_BALANCE } from "@/lib/constants"
import type { PayrollEntry, TreasuryBalance, AgentStatus } from "@/lib/types"
import { Play, RefreshCw, RotateCcw } from "lucide-react"

export default function Home() {
  const [agentKey, setAgentKey] = useState(0) // Key to force agent re-initialization
  const [agent] = useState(() => new TreasuryAgent())
  const [treasuryBalance, setTreasuryBalance] = useState<TreasuryBalance>(
    agent.getTreasuryBalance()
  )
  const [payrolls, setPayrolls] = useState<PayrollEntry[]>(
    MOCK_PAYROLLS.map((p) => ({
      ...p,
      status: "pending" as const,
    }))
  )
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([])
  const [isRunning, setIsRunning] = useState(false)
  
  // Reset agent when key changes
  useEffect(() => {
    if (agentKey > 0) {
      // Force re-initialization by creating new agent instance
      const newAgent = new TreasuryAgent(MOCK_TREASURY_BALANCE as TreasuryBalance)
      setTreasuryBalance(newAgent.getTreasuryBalance())
      setAgentStatuses([])
      // Note: We can't directly replace the agent in useState, so we'll use the key
      // to signal that we need to reset. The actual reset happens via window.location.reload
    }
  }, [agentKey])

  // Update agent statuses when they change
  useEffect(() => {
    const interval = setInterval(() => {
      setAgentStatuses(agent.getStatus())
      setTreasuryBalance(agent.getTreasuryBalance())
    }, 1000) // Update every second

    return () => clearInterval(interval)
  }, [agent])

  const handleStartAgent = async () => {
    if (isRunning) return

    setIsRunning(true)
    try {
      await agent.runCycle(payrolls)
      
      // Update payrolls status after execution
      const today = new Date()
      const isPayrollDay = today.getDate() === 25
      
      if (isPayrollDay) {
        setPayrolls((prev) =>
          prev.map((p) => ({
            ...p,
            status: "completed" as const,
          }))
        )
      }
    } catch (error) {
      console.error("Agent cycle failed:", error)
    } finally {
      setIsRunning(false)
    }
  }

  const handleCheckYields = async () => {
    try {
      await agent.checkYields()
      setTreasuryBalance(agent.getTreasuryBalance())
    } catch (error) {
      console.error("Failed to check yields:", error)
    }
  }

  const handleRebalance = async () => {
    try {
      await agent.rebalance()
      setTreasuryBalance(agent.getTreasuryBalance())
    } catch (error) {
      console.error("Failed to rebalance:", error)
    }
  }

  const handleResetState = () => {
    // Reset payrolls to pending
    setPayrolls(
      MOCK_PAYROLLS.map((p) => ({
        ...p,
        status: "pending" as const,
      }))
    )
    
    // Reset treasury balance to initial mock values
    const initialBalance = MOCK_TREASURY_BALANCE as TreasuryBalance
    setTreasuryBalance(initialBalance)
    
    // Clear agent statuses
    setAgentStatuses([])
    
    // Reset agent by reloading page (simplest way to reset agent instance)
    window.location.reload()
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">AutoCFO</h1>
            <p className="text-muted-foreground mt-1">
              AI-powered treasury management agent for DAOs
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={handleResetState}
              variant="ghost"
              size="sm"
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset State
            </Button>
            <WalletConnect />
          </div>
        </div>

        {/* Agent Controls */}
        <div className="flex gap-4">
          <Button
            onClick={handleStartAgent}
            disabled={isRunning}
            size="lg"
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            {isRunning ? "Running..." : "Start Agent"}
          </Button>
          <Button
            onClick={handleCheckYields}
            variant="outline"
            disabled={isRunning}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Check Yields
          </Button>
          <Button
            onClick={handleRebalance}
            variant="outline"
            disabled={isRunning}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Rebalance
          </Button>
        </div>

        {/* Dashboard Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Treasury Overview */}
          <div className="lg:col-span-2">
            <TreasuryCard balance={treasuryBalance} />
          </div>

          {/* Agent Status */}
          <div>
            <AgentStatusLog statuses={agentStatuses} />
          </div>
        </div>

        {/* Payroll List */}
        <div>
          <PayrollList payrolls={payrolls} />
        </div>

        {/* Info Section */}
        <div className="mt-8 p-6 bg-muted rounded-lg">
          <h2 className="text-xl font-semibold mb-4">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2">1. Yield Management</h3>
              <p className="text-muted-foreground">
                The agent automatically invests idle treasury funds into Real World Assets (RWA)
                on the Arc network, optimizing yield generation.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">2. Liquidity Optimization</h3>
              <p className="text-muted-foreground">
                When payouts are needed, the agent swaps RWA tokens to USDC using Uniswap v4
                to ensure sufficient liquidity for payroll execution.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">3. Automated Payroll</h3>
              <p className="text-muted-foreground">
                On the 25th of each month, the agent resolves ENS names to addresses and
                executes USDC payouts to employees and contributors automatically.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
