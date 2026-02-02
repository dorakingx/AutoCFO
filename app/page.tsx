"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { WalletConnect } from "@/components/wallet-connect"
import { TreasuryCard } from "@/components/dashboard/treasury-card"
import { PayrollList } from "@/components/dashboard/payroll-list"
import { AgentStatusLog } from "@/components/dashboard/agent-status"
import { TreasuryAgent } from "@/lib/agent"
import { MOCK_PAYROLLS } from "@/lib/constants"
import type { PayrollEntry, TreasuryBalance, AgentStatus } from "@/lib/types"
import { Play, RefreshCw } from "lucide-react"

export default function Home() {
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
          <WalletConnect />
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
