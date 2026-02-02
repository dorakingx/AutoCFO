"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { AgentStatus } from "@/lib/types"
import { format } from "date-fns"
import { CheckCircle2, Info, AlertTriangle, XCircle } from "lucide-react"

interface AgentStatusProps {
  statuses: AgentStatus[]
}

function getStatusIcon(type: AgentStatus["type"]) {
  switch (type) {
    case "success":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    case "error":
      return <XCircle className="h-4 w-4 text-red-500" />
    default:
      return <Info className="h-4 w-4 text-blue-500" />
  }
}

function getStatusVariant(type: AgentStatus["type"]) {
  switch (type) {
    case "success":
      return "default"
    case "warning":
      return "default"
    case "error":
      return "destructive"
    default:
      return "default"
  }
}

export function AgentStatusLog({ statuses }: AgentStatusProps) {
  const recentStatuses = statuses.slice(-10).reverse() // Show last 10, most recent first

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Status</CardTitle>
        <CardDescription>Real-time agent activity and decision log</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {recentStatuses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No agent activity yet
            </div>
          ) : (
            recentStatuses.map((status, index) => (
              <Alert
                key={index}
                variant={getStatusVariant(status.type)}
                className="py-2"
              >
                <div className="flex items-start gap-2">
                  {getStatusIcon(status.type)}
                  <div className="flex-1">
                    <AlertDescription className="text-sm">
                      {status.message}
                    </AlertDescription>
                    <div className="text-xs text-muted-foreground mt-1">
                      {format(status.timestamp, "HH:mm:ss")}
                      {status.action && (
                        <span className="ml-2">• {status.action}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Alert>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
