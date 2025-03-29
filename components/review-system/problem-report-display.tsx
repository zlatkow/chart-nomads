"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, DollarSign, XCircle, AlertOctagon, Clock, FileWarning, Settings } from "lucide-react"
import { useState, useEffect } from "react"

interface ProblemReportProps {
  report: any // Use any to handle different report structures
}

export default function ProblemReportDisplay({ report }: ProblemReportProps) {
  const [expandedImage, setExpandedImage] = useState<string | null>(null)
  const [processedReport, setProcessedReport] = useState<any>(null)

  // Process the report to ensure consistent structure
  useEffect(() => {
    if (!report || Object.keys(report).length === 0) {
      setProcessedReport(null)
      return
    }

    // If report is a string (JSON), try to parse it
    if (typeof report === "string") {
      try {
        const parsed = JSON.parse(report)
        setProcessedReport(parsed)
      } catch (e) {
        console.error("Failed to parse report string:", e)
        setProcessedReport(report)
      }
      return
    }

    setProcessedReport(report)
  }, [report])

  if (!processedReport || Object.keys(processedReport).length === 0) {
    return null
  }

  // Helper function to format account size
  const formatAccountSize = (size: string) => {
    if (!size) return ""
    return size.replace("k", ",000")
  }

  // Get the appropriate icon based on report reason
  const getReportIcon = () => {
    switch (processedReport.reportReason) {
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
    switch (processedReport.reportReason) {
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
        return processedReport.reportReason ? formatReportReason(processedReport.reportReason) : "Problem Report"
    }
  }

  // Format the report reason for display
  const formatReportReason = (reason: string) => {
    if (!reason) return ""
    return reason
      .replace(/-/g, " ")
      .split(" ")
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Render proof images if available
  const renderProofs = () => {
    if (!processedReport.proofs || Object.keys(processedReport.proofs).length === 0) {
      return null
    }

    return (
      <div className="mt-4">
        <h4 className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">Supporting Evidence</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {Object.entries(processedReport.proofs).map(([key, url], index) => (
            <div
              key={key}
              className="block border border-red-300 dark:border-red-800 rounded-md overflow-hidden hover:border-red-500 dark:hover:border-red-600 transition-colors cursor-pointer"
              onClick={() => setExpandedImage(url as string)}
            >
              <div className="aspect-square relative bg-red-50 dark:bg-red-950/30">
                <img
                  src={(url as string) || "/placeholder.svg"}
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
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Expanded image modal
  const renderExpandedImage = () => {
    if (!expandedImage) return null

    return (
      <div
        className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md"
        onClick={() => setExpandedImage(null)}
      >
        <div className="relative max-w-3xl max-h-[80vh] w-full h-full flex items-center justify-center">
          <img
            src={expandedImage || "/placeholder.svg"}
            alt="Expanded proof"
            className="max-w-full max-h-full object-contain"
          />
          <button
            className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full"
            onClick={() => setExpandedImage(null)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            {getReportIcon()}
            <CardTitle className="text-lg text-red-700 dark:text-red-400">{getReportTitle()}</CardTitle>
          </div>
          <CardDescription className="text-red-600 dark:text-red-300">
            {processedReport.reportReason && (
              <Badge
                variant="outline"
                className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800"
              >
                {formatReportReason(processedReport.reportReason)}
              </Badge>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Render different content based on report type */}
          {processedReport.reportReason === "unjustified-breach" && (
            <div className="space-y-3">
              {processedReport.breachedAccountSize && (
                <div>
                  <h4 className="text-sm font-medium text-red-700 dark:text-red-400">Account Size</h4>
                  <p className="text-sm text-red-600 dark:text-red-300">
                    ${formatAccountSize(processedReport.breachedAccountSize)}
                  </p>
                </div>
              )}

              {processedReport.breachReason && (
                <div>
                  <h4 className="text-sm font-medium text-red-700 dark:text-red-400">Reason Given by Firm</h4>
                  <p className="text-sm text-red-600 dark:text-red-300">{processedReport.breachReason}</p>
                </div>
              )}

              {processedReport.breachDetails && (
                <div>
                  <h4 className="text-sm font-medium text-red-700 dark:text-red-400">Details</h4>
                  <p className="text-sm text-red-600 dark:text-red-300 whitespace-pre-line">
                    {processedReport.breachDetails}
                  </p>
                </div>
              )}

              {processedReport.receivedLastPayout && (
                <div>
                  <h4 className="text-sm font-medium text-red-700 dark:text-red-400">Received Last Payout</h4>
                  <p className="text-sm text-red-600 dark:text-red-300">{processedReport.receivedLastPayout}</p>
                </div>
              )}

              {processedReport.deniedAmount && (
                <div>
                  <h4 className="text-sm font-medium text-red-700 dark:text-red-400">Denied Amount</h4>
                  <p className="text-sm text-red-600 dark:text-red-300">{processedReport.deniedAmount}</p>
                </div>
              )}

              {renderProofs()}
            </div>
          )}

          {processedReport.reportReason === "payout-denial" && (
            <div className="space-y-3">
              {processedReport.deniedAmount && (
                <div>
                  <h4 className="text-sm font-medium text-red-700 dark:text-red-400">Denied Amount</h4>
                  <p className="text-sm text-red-600 dark:text-red-300">{processedReport.deniedAmount}</p>
                </div>
              )}

              {processedReport.payoutDenialReason && (
                <div>
                  <h4 className="text-sm font-medium text-red-700 dark:text-red-400">Reason Given by Firm</h4>
                  <p className="text-sm text-red-600 dark:text-red-300">{processedReport.payoutDenialReason}</p>
                </div>
              )}

              {processedReport.payoutDenialDetails && (
                <div>
                  <h4 className="text-sm font-medium text-red-700 dark:text-red-400">Details</h4>
                  <p className="text-sm text-red-600 dark:text-red-300 whitespace-pre-line">
                    {processedReport.payoutDenialDetails}
                  </p>
                </div>
              )}

              {renderProofs()}
            </div>
          )}

          {/* For other report types or fallback */}
          {(!processedReport.reportReason ||
            (processedReport.reportReason !== "unjustified-breach" &&
              processedReport.reportReason !== "payout-denial")) && (
            <div className="space-y-3">
              {/* Try different possible description fields */}
              {(processedReport.reportDescription || processedReport.description) && (
                <div>
                  <h4 className="text-sm font-medium text-red-700 dark:text-red-400">Description</h4>
                  <p className="text-sm text-red-600 dark:text-red-300 whitespace-pre-line">
                    {processedReport.reportDescription || processedReport.description}
                  </p>
                </div>
              )}

              {/* Display denied amount if available */}
              {processedReport.deniedAmount && (
                <div>
                  <h4 className="text-sm font-medium text-red-700 dark:text-red-400">Denied Amount</h4>
                  <p className="text-sm text-red-600 dark:text-red-300">{processedReport.deniedAmount}</p>
                </div>
              )}

              {renderProofs()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Render expanded image modal */}
      {renderExpandedImage()}
    </>
  )
}

