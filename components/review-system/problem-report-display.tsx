"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, DollarSign, XCircle, AlertOctagon, Clock, FileWarning, Settings } from "lucide-react"

interface ProblemReportProps {
  report: {
    reportReason?: string
    reportDescription?: string
    breachedAccountSize?: string
    breachReason?: string
    breachDetails?: string
    receivedLastPayout?: string
    deniedAmount?: string
    payoutDenialReason?: string
    payoutDenialDetails?: string
    proofs?: Record<string, string>
  }
}

export default function ProblemReportDisplay({ report }: ProblemReportProps) {
  if (!report || Object.keys(report).length === 0) {
    return null
  }

  // Helper function to format account size
  const formatAccountSize = (size: string) => {
    if (!size) return ""
    return size.replace("k", ",000")
  }

  // Get the appropriate icon based on report reason
  const getReportIcon = () => {
    switch (report.reportReason) {
      case "unjustified-breach":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "payout-denial":
        return <DollarSign className="h-5 w-5 text-amber-500" />
      case "imposing-limitations":
        return <Settings className="h-5 w-5 text-amber-500" />
      case "payment-issues":
        return <DollarSign className="h-5 w-5 text-amber-500" />
      case "false-advertising":
        return <AlertOctagon className="h-5 w-5 text-amber-500" />
      case "rule-changes":
        return <FileWarning className="h-5 w-5 text-amber-500" />
      case "technical-issues":
        return <Clock className="h-5 w-5 text-amber-500" />
      default:
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
    }
  }

  // Get the appropriate title based on report reason
  const getReportTitle = () => {
    switch (report.reportReason) {
      case "unjustified-breach":
        return "Unjustified Breach Report"
      case "payout-denial":
        return "Payout Denial Report"
      case "imposing-limitations":
        return "Limitations Imposed"
      case "payment-issues":
        return "Payment Issues"
      case "false-advertising":
        return "False Advertising"
      case "rule-changes":
        return "Rule Changes After Funding"
      case "technical-issues":
        return "Technical Issues"
      default:
        return "Problem Report"
    }
  }

  // Render proof images if available
  const renderProofs = () => {
    if (!report.proofs || Object.keys(report.proofs).length === 0) {
      return null
    }

    return (
      <div className="mt-4">
        <h4 className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">Supporting Evidence</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {Object.entries(report.proofs).map(([key, url], index) => (
            <a
              key={key}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="block border border-red-300 dark:border-red-800 rounded-md overflow-hidden hover:border-red-500 dark:hover:border-red-600 transition-colors"
            >
              <div className="aspect-square relative bg-red-50 dark:bg-red-950/30">
                <img
                  src={url || "/placeholder.svg"}
                  alt={`Proof ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // If image fails to load, show a placeholder
                    e.currentTarget.src = "/placeholder.svg?height=100&width=100"
                  }}
                />
              </div>
              <div className="p-1 text-xs text-red-600 dark:text-red-400 truncate">
                {key.replace(/_/g, " ").replace(/problem report proof/i, "Proof")}
              </div>
            </a>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          {getReportIcon()}
          <CardTitle className="text-lg text-red-700 dark:text-red-400">{getReportTitle()}</CardTitle>
        </div>
        <CardDescription className="text-red-600 dark:text-red-300">
          {report.reportReason && (
            <Badge
              variant="outline"
              className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800"
            >
              {report.reportReason.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Render different content based on report type */}
        {report.reportReason === "unjustified-breach" && (
          <div className="space-y-3">
            {report.breachedAccountSize && (
              <div>
                <h4 className="text-sm font-medium text-red-700 dark:text-red-400">Account Size</h4>
                <p className="text-sm text-red-600 dark:text-red-300">
                  ${formatAccountSize(report.breachedAccountSize)}
                </p>
              </div>
            )}

            {report.breachReason && (
              <div>
                <h4 className="text-sm font-medium text-red-700 dark:text-red-400">Reason Given by Firm</h4>
                <p className="text-sm text-red-600 dark:text-red-300">{report.breachReason}</p>
              </div>
            )}

            {report.breachDetails && (
              <div>
                <h4 className="text-sm font-medium text-red-700 dark:text-red-400">Details</h4>
                <p className="text-sm text-red-600 dark:text-red-300 whitespace-pre-line">{report.breachDetails}</p>
              </div>
            )}

            {report.receivedLastPayout && (
              <div>
                <h4 className="text-sm font-medium text-red-700 dark:text-red-400">Received Last Payout</h4>
                <p className="text-sm text-red-600 dark:text-red-300">{report.receivedLastPayout}</p>
              </div>
            )}

            {report.deniedAmount && (
              <div>
                <h4 className="text-sm font-medium text-red-700 dark:text-red-400">Denied Amount</h4>
                <p className="text-sm text-red-600 dark:text-red-300">{report.deniedAmount}</p>
              </div>
            )}

            {renderProofs()}
          </div>
        )}

        {report.reportReason === "payout-denial" && (
          <div className="space-y-3">
            {report.deniedAmount && (
              <div>
                <h4 className="text-sm font-medium text-red-700 dark:text-red-400">Denied Amount</h4>
                <p className="text-sm text-red-600 dark:text-red-300">{report.deniedAmount}</p>
              </div>
            )}

            {report.payoutDenialReason && (
              <div>
                <h4 className="text-sm font-medium text-red-700 dark:text-red-400">Reason Given by Firm</h4>
                <p className="text-sm text-red-600 dark:text-red-300">{report.payoutDenialReason}</p>
              </div>
            )}

            {report.payoutDenialDetails && (
              <div>
                <h4 className="text-sm font-medium text-red-700 dark:text-red-400">Details</h4>
                <p className="text-sm text-red-600 dark:text-red-300 whitespace-pre-line">
                  {report.payoutDenialDetails}
                </p>
              </div>
            )}

            {renderProofs()}
          </div>
        )}

        {/* For other report types */}
        {report.reportReason &&
          report.reportReason !== "unjustified-breach" &&
          report.reportReason !== "payout-denial" &&
          report.reportDescription && (
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-red-700 dark:text-red-400">Description</h4>
                <p className="text-sm text-red-600 dark:text-red-300 whitespace-pre-line">{report.reportDescription}</p>
              </div>

              {renderProofs()}
            </div>
          )}
      </CardContent>
    </Card>
  )
}

