"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { PayrollEntry } from "@/lib/types"
import { format } from "date-fns"

interface PayrollListProps {
  payrolls: PayrollEntry[]
}

function formatCurrency(value: string): string {
  const num = parseFloat(value)
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

function getStatusBadgeVariant(status: PayrollEntry["status"]) {
  switch (status) {
    case "completed":
      return "default"
    case "processing":
      return "secondary"
    case "failed":
      return "destructive"
    default:
      return "outline"
  }
}

export function PayrollList({ payrolls }: PayrollListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Payrolls</CardTitle>
        <CardDescription>Employee and contributor payouts</CardDescription>
      </CardHeader>
      <CardContent>
        {payrolls.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No payrolls scheduled
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recipient</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payrolls.map((payroll) => (
                <TableRow key={payroll.id}>
                  <TableCell className="font-medium">
                    {payroll.recipient}
                    {payroll.resolvedAddress && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {payroll.resolvedAddress.slice(0, 6)}...
                        {payroll.resolvedAddress.slice(-4)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{formatCurrency(payroll.amount)}</TableCell>
                  <TableCell>{format(payroll.dueDate, "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(payroll.status)}>
                      {payroll.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
