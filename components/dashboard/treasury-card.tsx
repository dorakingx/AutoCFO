"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { TreasuryBalance } from "@/lib/types"

function formatCurrency(value: string): string {
  const num = parseFloat(value)
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

interface TreasuryCardProps {
  balance: TreasuryBalance
}

export function TreasuryCard({ balance }: TreasuryCardProps) {
  const rwaPercentage = (parseFloat(balance.rwa.value) / parseFloat(balance.total)) * 100
  const usdcPercentage = (parseFloat(balance.usdc.value) / parseFloat(balance.total)) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle>Treasury Overview</CardTitle>
        <CardDescription>Total treasury value and allocation</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <div className="text-3xl font-bold">{formatCurrency(balance.total)}</div>
            <p className="text-sm text-muted-foreground mt-1">Total Treasury Value</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">RWA</Badge>
                <span className="text-sm font-medium">Arc Vault</span>
              </div>
              <div className="text-right">
                <div className="font-semibold">{formatCurrency(balance.rwa.value)}</div>
                <div className="text-xs text-muted-foreground">
                  {rwaPercentage.toFixed(1)}% • {balance.rwa.apy}% APY
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline">USDC</Badge>
                <span className="text-sm font-medium">Liquidity Reserve</span>
              </div>
              <div className="text-right">
                <div className="font-semibold">{formatCurrency(balance.usdc.value)}</div>
                <div className="text-xs text-muted-foreground">
                  {usdcPercentage.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Allocation</span>
              <span>100%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${rwaPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
