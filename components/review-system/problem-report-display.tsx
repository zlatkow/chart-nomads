/* eslint-disable */
"use client"

import { useState } from "react"
import { DollarSign, AlertTriangle, XCircle, AlertOctagon, Clock, FileWarning, Settings } from "lucide-react"

interface ProblemReportProps {
  report: any // Use any to handle different report structures
}

export default function ProblemReportDisplay({ report }: ProblemReportProps) {
  const [expandedImage, setExpandedImage] = useState<string | null>(null)

  if (!report || Object.keys(report).length === 0) {
    return null
  }

  // Get the appropriate icon based on report reason
  const getReportIcon = () => {
    switch (report.reportReason) {
      case "unjustified-breach":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "payout-denial":
        return <DollarSign className="h-5 w-5 text-red-500" />
      case "imposing-limitations":
        return <Settings className="h-5 w-5 text-red-500" />
      case "payment-issues":
        return <DollarSign className="h-5 w-5 text-red-500" />
      case "false-advertising":
        return <AlertOctagon className="h-5 w-5 text-red-500" />
      case "rule-changes":
        return <FileWarning className="h-5 w-5 text-red-500" />
      case "technical-issues":
        return <Clock className="h-5 w-5 text-red-500" />
      default:
        return <AlertTriangle className="h-5 w-5 text-red-500" />
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
        return report.reportReason ? formatReportReason(report.reportReason) : "Problem Report"
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

  // Render the report content based on type
  const renderReportContent = () => {
    // For unjustified breach reports
    if (report.reportReason === "unjustified-breach") {
      return (
        <>
          {report.breachedAccountSize && (
            <div className="mb-4">
              <p className="text-xs text-red-400 mb-1">Account Size</p>
              <p className="text-sm text-white">${report.breachedAccountSize.replace("k", ",000")}</p>
            </div>
          )}

          {report.deniedAmount && (
            <div className="mb-4">
              <p className="text-xs text-red-400 mb-1">Denied Amount</p>
              <p className="text-sm text-white">{report.deniedAmount}</p>
            </div>
          )}

          {report.breachReason && (
            <div className="mb-4">
              <p className="text-xs text-red-400 mb-1">Reason Given by Firm</p>
              <p className="text-sm text-white">{report.breachReason}</p>
            </div>
          )}

          {report.breachDetails && (
            <div className="mb-4">
              <p className="text-xs text-red-400 mb-1">Details</p>
              <p className="text-sm text-gray-300 whitespace-pre-line">{report.breachDetails}</p>
            </div>
          )}
        </>
      )
    }

    // For payout denial reports
    if (report.reportReason === "payout-denial") {
      return (
        <>
          {report.deniedAmount && (
            <div className="mb-4">
              <p className="text-xs text-red-400 mb-1">Denied Amount</p>
              <p className="text-sm text-white">{report.deniedAmount}</p>
            </div>
          )}

          {report.payoutDenialReason && (
            <div className="mb-4">
              <p className="text-xs text-red-400 mb-1">Reason Given by Firm</p>
              <p className="text-sm text-white">{report.payoutDenialReason}</p>
            </div>
          )}

          {report.payoutDenialDetails && (
            <div className="mb-4">
              <p className="text-xs text-red-400 mb-1">Details</p>
              <p className="text-sm text-gray-300 whitespace-pre-line">{report.payoutDenialDetails}</p>
            </div>
          )}
        </>
      )
    }

    // For other report types or legacy reports
    return (
      <>
        {report.deniedAmount && (
          <div className="mb-4">
            <p className="text-xs text-red-400 mb-1">Denied Amount</p>
            <p className="text-sm text-white">{report.deniedAmount}</p>
          </div>
        )}

        {report.reportReason && (
          <div className="mb-4">
            <p className="text-xs text-red-400 mb-1">Reason</p>
            <p className="text-sm text-white">{formatReportReason(report.reportReason)}</p>
          </div>
        )}

        {(report.reportDescription || report.description) && (
          <div className="mb-4">
            <p className="text-xs text-red-400 mb-1">Summary</p>
            <p className="text-sm text-gray-300">{report.reportDescription || report.description}</p>
          </div>
        )}
      </>
    )
  }

  // Render proof images
  const renderProofImages = () => {
    if (!report.proofs || Object.keys(report.proofs).length === 0) {
      return null
    }

    return (
      <div className="mt-4">
        <p className="text-xs text-red-400 mb-2">Supporting Evidence</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(report.proofs).map(([key, url], index) => (
            <div
              key={key}
              className="relative h-32 w-32 rounded-md overflow-hidden border border-red-300 hover:border-red-500 transition-colors cursor-pointer"
              onClick={() => setExpandedImage(url as string)}
            >
              <img
                src={(url as string) || "/placeholder.svg?height=100&width=100"}
                alt={`Proof ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // If image fails to load, show a placeholder
                  e.currentTarget.src = "/placeholder.svg?height=100&width=100"
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1 text-xs text-white text-center">
                Proof {index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-md p-4">
        <div className="flex items-center gap-2 mb-4">
          {getReportIcon()}
          <h3 className="text-lg font-semibold text-red-600">{getReportTitle()}</h3>
        </div>

        <div className="mb-2">
          <span className="inline-block bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800 rounded px-2 py-1 text-xs">
            {formatReportReason(report.reportReason)}
          </span>
        </div>

        {renderReportContent()}
        {renderProofImages()}
      </div>

      {/* Render expanded image modal */}
      {renderExpandedImage()}
    </>
  )
}

