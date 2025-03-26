"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { X, Upload, ChevronRight, ChevronLeft, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { Star } from "lucide-react"
import { toast } from "@/hooks/use-toast"

// Add the useNoise import at the top of the file
import { useNoise } from "../../components/providers/noise-provider"

// Add tippy.js import at the top of the file:
import Tippy from "@tippyjs/react"
import "tippy.js/dist/tippy.css"

// Add the adjustNavbarZIndex function at the top of the file, outside the component
// Update the adjustNavbarZIndex function to also handle noise visibility
const adjustNavbarZIndex = (lower: boolean) => {
  if (typeof document === "undefined") return

  // Target all possible navbar elements
  const navbarSelectors = ["nav", "header", ".navbar", '[class*="navbar"]', '[id*="navbar"]', '[id*="header"]']

  navbarSelectors.forEach((selector) => {
    const elements = document.querySelectorAll(selector)
    elements.forEach((el) => {
      const htmlEl = el as HTMLElement
      if (lower) {
        // Store the original z-index if we haven't already
        if (!htmlEl.getAttribute("data-original-zindex")) {
          htmlEl.setAttribute("data-original-zindex", htmlEl.style.zIndex || "")
        }
        // Set to a low z-index
        htmlEl.style.zIndex = "10"
      } else {
        // Restore the original z-index
        const originalZIndex = htmlEl.getAttribute("data-original-zindex")
        if (originalZIndex !== null) {
          htmlEl.style.zIndex = originalZIndex
        } else {
          htmlEl.style.zIndex = "100" // Default fallback
        }
      }
    })
  })
}

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  companyName?: string
  companyLogo?: string
}

// In the ReviewModal component, add the useNoise hook
export default function ReviewModal({ isOpen, onClose, companyName = "CHART NOMADS", companyLogo }: ReviewModalProps) {
  // Add the useNoise hook to control noise visibility
  const { setIsNoiseVisible } = useNoise()

  const [step, setStep] = useState(1)
  // Update the formData state to include the new fields for different report types
  const [formData, setFormData] = useState({
    accountSize: "",
    accountType: "",
    tradingDuration: "",
    fundedStatus: "No",
    payoutStatus: "No",
    proofFile: null as File | null,
    fundedProofFile: null as File | null,
    payoutProofFile: null as File | null,
    ratings: {
      tradingConditions: 0,
      customerSupport: 0,
      innerProcesses: 0,
      dashboard: 0,
      education: 0,
    },
    reviewText: "",
    likedMost: "",
    dislikedMost: "",
    reportIssue: false,
    reportReason: "",
    reportDescription: "",
    // New fields for report types
    breachedAccountSize: "",
    breachReason: "",
    breachDetails: "",
    receivedLastPayout: "Yes", // Set default to "Yes"
    deniedAmount: "",
    payoutDenialReason: "",
    payoutDenialDetails: "",
    // File uploads array for proofs
    proofFiles: [] as File[],
  })
  const [showSuccess, setShowSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Add a new state for validation errors after the formData state
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Force noise to be hidden when modal is open
  useEffect(() => {
    if (isOpen) {
      setIsNoiseVisible(false)

      // Save current scroll position and disable scrolling
      const scrollY = window.scrollY
      document.body.style.overflow = "hidden"
      document.body.style.position = "fixed"
      document.body.style.width = "100%"
      document.body.style.top = `-${scrollY}px`

      // Lower navbar z-index
      adjustNavbarZIndex(true)
      console.log("Modal opened - hiding noise and lowering navbar z-index")
    } else {
      // Restore noise visibility
      setIsNoiseVisible(true)

      // Restore scrolling
      const scrollY = document.body.style.top
      document.body.style.overflow = ""
      document.body.style.position = ""
      document.body.style.width = ""
      document.body.style.top = ""
      window.scrollTo(0, Number.parseInt(scrollY || "0") * -1)

      // Restore navbar z-index
      adjustNavbarZIndex(false)
      console.log("Modal closed - showing noise and restoring navbar z-index")
    }
  }, [isOpen, setIsNoiseVisible])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        proofFile: e.target.files[0],
      })
    }
  }

  const handleRatingChange = (category: keyof typeof formData.ratings, value: number) => {
    setFormData({
      ...formData,
      ratings: {
        ...formData.ratings,
        [category]: value,
      },
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleRadioChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const nextStep = () => {
    const currentStepErrors = validateStep(step)

    if (Object.keys(currentStepErrors).length > 0) {
      setErrors(currentStepErrors)
      // Show toast for validation errors
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Clear errors when moving to next step
    setErrors({})

    if (step < 4) {
      setStep(step + 1)
    } else {
      // Submit the form
      setIsSubmitting(true)

      // Simulate API call
      setTimeout(() => {
        setIsSubmitting(false)
        setShowSuccess(true)
      }, 1500)
    }
  }

  // Add this validation function after the nextStep function
  const validateStep = (currentStep: number): Record<string, string> => {
    const stepErrors: Record<string, string> = {}

    if (currentStep === 1) {
      // Step 1 validation
      if (!formData.accountSize) stepErrors.accountSize = "Account size is required"
      if (!formData.accountType) stepErrors.accountType = "Account type is required"
      if (!formData.tradingDuration) stepErrors.tradingDuration = "Trading duration is required"
      if (!formData.fundedStatus) stepErrors.fundedStatus = "Please select an option"
      if (!formData.payoutStatus) stepErrors.payoutStatus = "Please select an option"
      if (!formData.proofFile) stepErrors.proofFile = "Proof of purchase is required"

      // Conditional validation for funded status
      if (formData.fundedStatus === "Yes" && !formData.fundedProofFile) {
        stepErrors.fundedProofFile = "Funded proof is required when 'Yes' is selected"
      }

      // Conditional validation for payout status
      if (formData.payoutStatus === "Yes" && !formData.payoutProofFile) {
        stepErrors.payoutProofFile = "Payout proof is required when 'Yes' is selected"
      }
    } else if (currentStep === 2) {
      // Step 2 validation
      if (formData.ratings.tradingConditions === 0) stepErrors.tradingConditions = "Rating is required"
      if (formData.ratings.customerSupport === 0) stepErrors.customerSupport = "Rating is required"
      if (formData.ratings.innerProcesses === 0) stepErrors.innerProcesses = "Rating is required"
      if (formData.ratings.dashboard === 0) stepErrors.dashboard = "Rating is required"
      if (formData.ratings.education === 0) stepErrors.education = "Rating is required"
      if (!formData.reviewText || formData.reviewText.trim().length < 150) {
        stepErrors.reviewText = "Please provide a detailed review (minimum 150 characters)"
      }
    } else if (currentStep === 3) {
      // Step 3 validation
      if (!formData.likedMost || formData.likedMost.trim().length < 10) {
        stepErrors.likedMost = "Please share what you liked most (minimum 10 characters)"
      }
      if (!formData.dislikedMost || formData.dislikedMost.trim().length < 10) {
        stepErrors.dislikedMost = "Please share what you disliked most (minimum 10 characters)"
      }
    } else if (currentStep === 4 && formData.reportIssue) {
      // Step 4 validation - only if reporting an issue
      if (!formData.reportReason) stepErrors.reportReason = "Please select a reason"

      if (formData.reportReason === "unjustified-breach") {
        if (!formData.breachedAccountSize) stepErrors.breachedAccountSize = "Account size is required"
        if (!formData.breachReason) stepErrors.breachReason = "Breach reason is required"
        if (!formData.breachDetails || formData.breachDetails.trim().length < 30) {
          stepErrors.breachDetails = "Please provide detailed information (minimum 30 characters)"
        }
        if (!formData.receivedLastPayout) stepErrors.receivedLastPayout = "Please select an option"
        if (formData.receivedLastPayout === "No" && !formData.deniedAmount) {
          stepErrors.deniedAmount = "Denied amount is required"
        }
      }

      if (formData.reportReason === "payout-denial") {
        if (!formData.deniedAmount) stepErrors.deniedAmount = "Denied amount is required"
        if (!formData.payoutDenialReason) stepErrors.payoutDenialReason = "Reason is required"
        if (!formData.payoutDenialDetails || formData.payoutDenialDetails.trim().length < 30) {
          stepErrors.payoutDenialDetails = "Please provide detailed information (minimum 30 characters)"
        }
      }

      if (
        formData.reportReason &&
        formData.reportReason !== "unjustified-breach" &&
        formData.reportReason !== "payout-denial"
      ) {
        if (!formData.reportDescription || formData.reportDescription.trim().length < 30) {
          stepErrors.reportDescription = "Please provide detailed information (minimum 30 characters)"
        }
      }

      // Require at least one proof file for any report
      if (formData.reportReason && formData.proofFiles.length === 0) {
        stepErrors.proofFiles = "Please upload at least one proof file"
      }
    }

    return stepErrors
  }

  // Add this helper function to display error messages
  const getErrorMessage = (field: string) => {
    return errors[field] ? <p className="text-red-500 text-xs mt-1">{errors[field]}</p> : null
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  // Add a function to check if the current step is valid:
  const isCurrentStepValid = () => {
    const currentStepErrors = validateStep(step)
    return Object.keys(currentStepErrors).length === 0
  }

  // Update the handleClose function to properly restore scrolling and z-index
  const handleClose = () => {
    setStep(1)
    setShowSuccess(false)

    // Call onClose to update parent component state
    onClose()
  }

  function StarRating({ category, currentRating, handleRatingChange, size = "sm" }) {
    const [hoverRating, setHoverRating] = useState(0)
    const stars = []

    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= (hoverRating || currentRating)
      const isHovered = i === hoverRating

      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => handleRatingChange(category, i)}
          onMouseEnter={() => setHoverRating(i)}
          onMouseLeave={() => setHoverRating(0)}
          className={cn(
            "focus:outline-none transition-transform duration-150 ease-in-out",
            size === "sm" ? "text-lg" : "text-2xl",
          )}
        >
          <Star
            className={cn(
              "w-[1em] h-[1em] transition-all duration-150",
              isFilled ? "fill-[#edb900] stroke-[#edb900]" : "fill-[#0f0f0f] stroke-[rgba(237,185,0,0.2)]",
              isHovered ? "scale-110" : "",
            )}
          />
        </button>,
      )
    }

    return <div className="flex items-center gap-1">{stars}</div>
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md" onClick={handleClose} aria-hidden="true" />

      {/* Modal */}
      <div
        className="relative z-50 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#0f0f0f] text-white rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div className="w-full h-1 bg-[#333333] overflow-hidden rounded-t-lg">
          <div
            className="h-full bg-[#edb900] transition-all duration-500 ease-out"
            style={{ width: showSuccess ? "100%" : `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Close button - conditionally styled based on showSuccess */}
        {showSuccess ? (
          <button className="absolute top-4 right-4 text-black cursor-default" onClick={(e) => e.preventDefault()}>
            <X className="h-6 w-6" />
          </button>
        ) : (
          <button className="absolute top-4 right-4 text-gray-400 hover:text-white" onClick={handleClose}>
            <X className="h-6 w-6" />
          </button>
        )}

        {showSuccess ? (
          <div className="p-8 flex flex-col items-center justify-center bg-[#edb900] text-[#0f0f0f] min-h-[800px]">
            <div className="bg-[#0f0f0f] rounded-full p-4 mb-6">
              <Check className="h-10 w-10 text-[#edb900]" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-center">Success!</h2>
            <p className="text-center max-w-md">
              Thank you for taking the time to review this company! Your submission has been received and will be
              published once approved.
            </p>
          </div>
        ) : (
          <>
            {/* Step indicator */}
            <div className="p-4 pb-0">
              <p className="text-[#edb900] font-[balboa]">Step {step}/4</p>
            </div>

            {/* Company logo */}
            <div className="flex justify-center my-4">
              {companyLogo ? (
                <Image src="/logo.webp" alt="Chart Nomads" width={140} height={39} />
              ) : (
                <div className="text-[#edb900] font-bold text-2xl">{companyName}</div>
              )}
            </div>

            {/* Step content */}
            <div className="p-6 min-h-[400px] flex flex-col">
              {step === 1 && (
                <div className="space-y-6 flex-grow">
                  <h2 className="text-2xl border-b border-[#edb900] pb-1 w-fit">Basic information</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="account-size" className="block text-sm">
                        Account Size
                      </label>
                      <Select
                        value={formData.accountSize}
                        onValueChange={(value) => handleSelectChange("accountSize", value)}
                      >
                        <SelectTrigger id="account-size" className="bg-[#1a1a1a] border-[#333333] text-white">
                          <SelectValue placeholder="Select one..." />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a1a] border-[#333333] text-white">
                          <SelectItem value="2.5k">$2,500</SelectItem>
                          <SelectItem value="5k">$5,000</SelectItem>
                          <SelectItem value="6k">$6,000</SelectItem>
                          <SelectItem value="10k">$10,000</SelectItem>
                          <SelectItem value="15k">$15,000</SelectItem>
                          <SelectItem value="25k">$25,000</SelectItem>
                          <SelectItem value="50k">$50,000</SelectItem>
                          <SelectItem value="60k">$60,000</SelectItem>
                          <SelectItem value="75k">$75,000</SelectItem>
                          <SelectItem value="100k">$100,000</SelectItem>
                          <SelectItem value="125k">$125,000</SelectItem>
                          <SelectItem value="200k">$200,000</SelectItem>
                          <SelectItem value="400k">$400,000</SelectItem>
                        </SelectContent>
                      </Select>
                      {getErrorMessage("accountSize")}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="account-type" className="block text-sm">
                        Account Type
                      </label>
                      <Select
                        value={formData.accountType}
                        onValueChange={(value) => handleSelectChange("accountType", value)}
                      >
                        <SelectTrigger id="account-type" className="bg-[#1a1a1a] border-[#333333] text-white">
                          <SelectValue placeholder="Select one..." />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a1a] border-[#333333] text-white">
                          <SelectItem value="instant">Instant Funding</SelectItem>
                          <SelectItem value="1-step">1 Step</SelectItem>
                          <SelectItem value="2-step">2 Step</SelectItem>
                          <SelectItem value="3-step">3 Step</SelectItem>
                        </SelectContent>
                      </Select>
                      {getErrorMessage("accountType")}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="trading-duration" className="block text-sm">
                      For how long have you been trading with the firm?
                    </label>
                    <Select
                      value={formData.tradingDuration}
                      onValueChange={(value) => handleSelectChange("tradingDuration", value)}
                    >
                      <SelectTrigger id="trading-duration" className="bg-[#1a1a1a] border-[#333333] text-white">
                        <SelectValue placeholder="Select one..." />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-[#333333] text-white">
                        <SelectItem value="less-than-1">Less than 1 month</SelectItem>
                        <SelectItem value="1-3">1-3 months</SelectItem>
                        <SelectItem value="3-6">3-6 months</SelectItem>
                        <SelectItem value="6-12">6-12 months</SelectItem>
                        <SelectItem value="more-than-12">More than an year</SelectItem>
                      </SelectContent>
                    </Select>
                    {getErrorMessage("tradingDuration")}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <label className="block text-sm">Have you been funded with the firm?</label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={formData.fundedStatus === "No" ? "default" : "outline"}
                          className={
                            formData.fundedStatus === "No"
                              ? "bg-[#edb900] text-[#0f0f0f] hover:bg-[#edb900]/90"
                              : "border-[#333333] bg-[#0f0f0f] text-[#edb900] hover:border-[#edb900] hover:bg-[#0f0f0f] hover:text-[#edb900]"
                          }
                          onClick={() => handleRadioChange("fundedStatus", "No")}
                        >
                          No
                        </Button>
                        <Button
                          type="button"
                          variant={formData.fundedStatus === "Yes" ? "default" : "outline"}
                          className={
                            formData.fundedStatus === "Yes"
                              ? "bg-[#edb900] text-[#0f0f0f] hover:bg-[#edb900]/90"
                              : "border-[#333333] bg-[#0f0f0f] text-[#edb900] hover:border-[#edb900] hover:bg-[#0f0f0f] hover:text-[#edb900]"
                          }
                          onClick={() => handleRadioChange("fundedStatus", "Yes")}
                        >
                          Yes
                        </Button>
                      </div>
                      {getErrorMessage("fundedStatus")}

                      {formData.fundedStatus === "Yes" && (
                        <div className="mt-2">
                          <div
                            className="border-2 border-dashed border-[#333333] rounded-lg p-4 text-center hover:border-[#edb900] transition-colors cursor-pointer"
                            onClick={() => document.getElementById("funded-proof-upload")?.click()}
                          >
                            <div className="flex flex-col items-center justify-center gap-2">
                              <Upload className="h-8 w-8 text-gray-400" />
                              <p className="text-sm text-gray-400">
                                {formData.fundedProofFile ? formData.fundedProofFile.name : "UPLOAD FUNDED PROOF"}
                              </p>
                              <input
                                id="funded-proof-upload"
                                type="file"
                                className="hidden"
                                accept=".jpg,.jpeg,.png,.pdf"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    setFormData({
                                      ...formData,
                                      fundedProofFile: e.target.files[0],
                                    })
                                  }
                                }}
                              />
                            </div>
                          </div>
                          {getErrorMessage("fundedProofFile")}
                          <p className="text-xs text-gray-500 mt-1">
                            *Please upload a screenshot of your funded account dashboard or confirmation email
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <label className="block text-sm">Have you received a payout from the firm?</label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={formData.payoutStatus === "No" ? "default" : "outline"}
                          className={
                            formData.payoutStatus === "No"
                              ? "bg-[#edb900] text-[#0f0f0f] hover:bg-[#edb900]/90"
                              : "border-[#333333] bg-[#0f0f0f] text-[#edb900] hover:border-[#edb900] hover:bg-[#0f0f0f] hover:text-[#edb900]"
                          }
                          onClick={() => handleRadioChange("payoutStatus", "No")}
                        >
                          No
                        </Button>
                        <Button
                          type="button"
                          variant={formData.payoutStatus === "Yes" ? "default" : "outline"}
                          className={
                            formData.payoutStatus === "Yes"
                              ? "bg-[#edb900] text-[#0f0f0f] hover:bg-[#edb900]/90"
                              : "border-[#333333] bg-[#0f0f0f] text-[#edb900] hover:border-[#edb900] hover:bg-[#0f0f0f] hover:text-[#edb900]"
                          }
                          onClick={() => handleRadioChange("payoutStatus", "Yes")}
                        >
                          Yes
                        </Button>
                      </div>
                      {getErrorMessage("payoutStatus")}

                      {formData.payoutStatus === "Yes" && (
                        <div className="mt-2">
                          <div
                            className="border-2 border-dashed border-[#333333] rounded-lg p-4 text-center hover:border-[#edb900] transition-colors cursor-pointer"
                            onClick={() => document.getElementById("payout-proof-upload")?.click()}
                          >
                            <div className="flex flex-col items-center justify-center gap-2">
                              <Upload className="h-8 w-8 text-gray-400" />
                              <p className="text-sm text-gray-400">
                                {formData.payoutProofFile ? formData.payoutProofFile.name : "UPLOAD PAYOUT PROOF"}
                              </p>
                              <input
                                id="payout-proof-upload"
                                type="file"
                                className="hidden"
                                accept=".jpg,.jpeg,.png,.pdf"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    setFormData({
                                      ...formData,
                                      payoutProofFile: e.target.files[0],
                                    })
                                  }
                                }}
                              />
                            </div>
                          </div>
                          {getErrorMessage("payoutProofFile")}
                          <p className="text-xs text-gray-500 mt-1">
                            *Please upload a bank statement or payment confirmation showing the payout
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs font-[balboa]">
                    *If yes, proof of either facts needs to be presented in the next step.
                  </p>
                  <div className="mt-6">
                    <div className="bg-[#edb900] rounded-md px-4 py-2 mb-5">
                      <h3 className="text-xl text-black border-b border-black pb-1 mb-4 w-fit">Disclaimer</h3>
                      <p className="text-sm text-black mb-4">
                        Our mission is to provide the community with genuine reviews, this is why we require some sort
                        of verifications and proofs when a user attempt to review a company.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm">Proof of purchase</label>
                    <div
                      className={`border-2 border-dashed ${errors.proofFile ? "border-red-500" : "border-[#333333]"} rounded-lg p-4 text-center hover:border-[#edb900] transition-colors cursor-pointer`}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Upload className="h-8 w-8 text-gray-400" />
                        <p className="text-sm text-gray-400">
                          {formData.proofFile ? formData.proofFile.name : "UPLOAD FILE"}
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={handleFileUpload}
                        />
                      </div>
                    </div>
                    {getErrorMessage("proofFile")}
                    <p className="text-xs text-gray-500">
                      *Accepted file formats: .jpg, .jpeg, .png, .pdf
                      <br />
                      *Uploads should be up to 10MB in size. .png, .pdf
                      <br />
                      *Uploads should be up to 10MB in size.
                    </p>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 flex-grow">
                  <h2 className="text-2xl border-b border-[#edb900] pb-1 w-fit">Rate your experience</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm">Trading Conditions</label>
                      <StarRating
                        category="tradingConditions"
                        currentRating={formData.ratings.tradingConditions}
                        handleRatingChange={handleRatingChange}
                        size="md"
                      />
                      {getErrorMessage("tradingConditions")}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm">Customer support</label>
                      <StarRating
                        category="customerSupport"
                        currentRating={formData.ratings.customerSupport}
                        handleRatingChange={handleRatingChange}
                        size="md"
                      />
                      {getErrorMessage("customerSupport")}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm">Inner processes</label>
                      <StarRating
                        category="innerProcesses"
                        currentRating={formData.ratings.innerProcesses}
                        handleRatingChange={handleRatingChange}
                        size="md"
                      />
                      {getErrorMessage("innerProcesses")}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm">Dashboard/User Experience</label>
                      <StarRating
                        category="dashboard"
                        currentRating={formData.ratings.dashboard}
                        handleRatingChange={handleRatingChange}
                        size="md"
                      />
                      {getErrorMessage("dashboard")}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm">Education & Community</label>
                    <StarRating
                      category="education"
                      currentRating={formData.ratings.education}
                      handleRatingChange={handleRatingChange}
                      size="md"
                    />
                    {getErrorMessage("education")}
                  </div>

                  <div className="mt-6">
                    <h2 className="text-2xl border-b border-[#edb900] pb-1 mb-4 w-fit">Write detailed review</h2>
                    <Textarea
                      name="reviewText"
                      value={formData.reviewText}
                      onChange={handleInputChange}
                      placeholder="Write your detailed review here!"
                      className="min-h-[150px] bg-[#1a1a1a] border-[#333333] text-white"
                    />
                    {getErrorMessage("reviewText")}
                    <div
                      className={`text-right text-xs mt-1 ${formData.reviewText.length > 150 ? "text-[#edb900]" : "text-gray-500"}`}
                    >
                      {formData.reviewText.length}/500
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 flex-grow">
                  <h2 className="text-2xl border-b border-[#edb900] pb-1 w-fit">
                    What you liked the most about that company?
                  </h2>
                  <Textarea
                    name="likedMost"
                    value={formData.likedMost}
                    onChange={handleInputChange}
                    placeholder="Write what you liked the most about the company here."
                    className="min-h-[120px] bg-[#1a1a1a] border-[#333333] text-white"
                  />
                  {getErrorMessage("likedMost")}

                  <h2 className="text-2xl border-b border-[#edb900] pb-1 mt-8 w-fit">
                    What you disliked the most about that company?
                  </h2>
                  <Textarea
                    name="dislikedMost"
                    value={formData.dislikedMost}
                    onChange={handleInputChange}
                    placeholder="Write what you disliked the most about the company here."
                    className="min-h-[120px] bg-[#1a1a1a] border-[#333333] text-white"
                  />
                  {getErrorMessage("dislikedMost")}
                </div>
              )}

              {/* Replace the existing step 4 content with the enhanced version */}
              {step === 4 && (
                <div className="space-y-6 flex-grow">
                  <h2 className="text-2xl border-b border-[#edb900] pb-1 w-fit">Report an issue (Optional)</h2>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="report-issue"
                        checked={formData.reportIssue}
                        onChange={(e) => setFormData({ ...formData, reportIssue: e.target.checked })}
                        className="rounded border-gray-700 text-[#edb900] focus:ring-[#edb900]"
                      />
                      <label htmlFor="report-issue" className="ml-2 text-sm">
                        I want to report an issue with this company
                      </label>
                    </div>

                    {formData.reportIssue && (
                      <div className="p-4 border border-red-500 rounded-md bg-red-900/20 space-y-4">
                        <div className="space-y-2">
                          <label htmlFor="report-reason" className="block text-sm text-red-400">
                            Reason for Report
                          </label>
                          <Select
                            value={formData.reportReason}
                            onValueChange={(value) => handleSelectChange("reportReason", value)}
                          >
                            <SelectTrigger id="report-reason" className="bg-[#1a1a1a] border-[#333333] text-white">
                              <SelectValue placeholder="Select reason" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a1a1a] border-gray-700 text-white">
                              <SelectItem value="unjustified-breach">Unjustified Breach</SelectItem>
                              <SelectItem value="payout-denial">Payout Denial</SelectItem>
                              <SelectItem value="imposing-limitations">Imposing Limitations</SelectItem>
                              <SelectItem value="payment-issues">Payment Issues</SelectItem>
                              <SelectItem value="false-advertising">False Advertising</SelectItem>
                              <SelectItem value="rule-changes">Rule Changes After Funding</SelectItem>
                              <SelectItem value="technical-issues">Technical Issues</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          {getErrorMessage("reportReason")}
                        </div>

                        {/* Unjustified Breach Fields */}
                        {formData.reportReason === "unjustified-breach" && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label htmlFor="breached-account-size" className="block text-sm">
                                Breached account size
                              </label>
                              <Select
                                value={formData.breachedAccountSize}
                                onValueChange={(value) => handleSelectChange("breachedAccountSize", value)}
                              >
                                <SelectTrigger
                                  id="breached-account-size"
                                  className="bg-[#1a1a1a] border-[#333333] text-white"
                                >
                                  <SelectValue placeholder="Select one..." />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1a1a] border-gray-700 text-white">
                                  <SelectItem value="2.5k">$2,500</SelectItem>
                                  <SelectItem value="5k">$5,000</SelectItem>
                                  <SelectItem value="6k">$6,000</SelectItem>
                                  <SelectItem value="10k">$10,000</SelectItem>
                                  <SelectItem value="15k">$15,000</SelectItem>
                                  <SelectItem value="25k">$25,000</SelectItem>
                                  <SelectItem value="50k">$50,000</SelectItem>
                                  <SelectItem value="60k">$60,000</SelectItem>
                                  <SelectItem value="75k">$75,000</SelectItem>
                                  <SelectItem value="100k">$100,000</SelectItem>
                                  <SelectItem value="125k">$125,000</SelectItem>
                                  <SelectItem value="200k">$200,000</SelectItem>
                                  <SelectItem value="400k">$400,000</SelectItem>
                                </SelectContent>
                              </Select>
                              {getErrorMessage("breachedAccountSize")}
                            </div>

                            <div className="space-y-2">
                              <label htmlFor="breach-reason" className="block text-sm">
                                Reason for breach given by the firm:
                              </label>
                              <Input
                                id="breach-reason"
                                name="breachReason"
                                value={formData.breachReason}
                                onChange={handleInputChange}
                                placeholder="Breach Reason (short form)"
                                className="bg-[#1a1a1a] border-[#333333] text-white"
                              />
                              {getErrorMessage("breachReason")}
                            </div>

                            <div className="space-y-2">
                              <label htmlFor="breach-details" className="block text-sm">
                                Give us all the details regarding the case:
                              </label>
                              <Textarea
                                id="breach-details"
                                name="breachDetails"
                                value={formData.breachDetails}
                                onChange={handleInputChange}
                                placeholder="Write all the details about the breach case here."
                                className="min-h-[120px] bg-[#1a1a1a] border-[#333333] text-white"
                              />
                              {getErrorMessage("breachDetails")}
                            </div>

                            <div className="space-y-2">
                              <label className="block text-sm">Have you received your last payout?</label>
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  variant={formData.receivedLastPayout === "Yes" ? "default" : "outline"}
                                  className={
                                    formData.receivedLastPayout === "Yes"
                                      ? "bg-[#edb900] text-[#0f0f0f] hover:bg-[#edb900]/90"
                                      : "border-[#333333] bg-[#0f0f0f] text-[#edb900] hover:border-[#edb900] hover:bg-[#0f0f0f] hover:text-[#edb900]"
                                  }
                                  onClick={() => handleRadioChange("receivedLastPayout", "Yes")}
                                >
                                  Yes
                                </Button>
                                <Button
                                  type="button"
                                  variant={formData.receivedLastPayout === "No" ? "default" : "outline"}
                                  className={
                                    formData.receivedLastPayout === "No"
                                      ? "bg-[#edb900] text-[#0f0f0f] hover:bg-[#edb900]/90"
                                      : "border-[#333333] bg-[#0f0f0f] text-[#edb900] hover:border-[#edb900] hover:bg-[#0f0f0f] hover:text-[#edb900]"
                                  }
                                  onClick={() => handleRadioChange("receivedLastPayout", "No")}
                                >
                                  No
                                </Button>
                              </div>
                              {getErrorMessage("receivedLastPayout")}
                            </div>

                            {formData.receivedLastPayout === "No" && (
                              <div className="space-y-2">
                                <label htmlFor="denied-amount" className="block text-sm">
                                  Specify the amount that was denied by the firm below:
                                </label>
                                <Input
                                  id="denied-amount"
                                  name="deniedAmount"
                                  value={formData.deniedAmount}
                                  onChange={handleInputChange}
                                  placeholder="Denied amount"
                                  className="bg-[#1a1a1a] border-gray-700 text-white"
                                />
                                {getErrorMessage("deniedAmount")}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Payout Denial Fields */}
                        {formData.reportReason === "payout-denial" && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label htmlFor="denied-amount" className="block text-sm">
                                Share denied amount by the firm below:
                              </label>
                              <Input
                                id="denied-amount"
                                name="deniedAmount"
                                value={formData.deniedAmount}
                                onChange={handleInputChange}
                                placeholder="Denied amount"
                                className="bg-[#1a1a1a] border-gray-700 text-white"
                              />
                              {getErrorMessage("deniedAmount")}
                            </div>

                            <div className="space-y-2">
                              <label htmlFor="payout-denial-reason" className="block text-sm">
                                Reason for deny given by the firm:
                              </label>
                              <Input
                                id="payout-denial-reason"
                                name="payoutDenialReason"
                                value={formData.payoutDenialReason}
                                onChange={handleInputChange}
                                placeholder="Payout Denial Reason (short form)"
                                className="bg-[#1a1a1a] border-gray-700 text-white"
                              />
                              {getErrorMessage("payoutDenialReason")}
                            </div>

                            <div className="space-y-2">
                              <label htmlFor="payout-denial-details" className="block text-sm">
                                Give us all the details regarding the case:
                              </label>
                              <Textarea
                                id="payout-denial-details"
                                name="payoutDenialDetails"
                                value={formData.payoutDenialDetails}
                                onChange={handleInputChange}
                                placeholder="Write all the details about the payout denial case here."
                                className="min-h-[120px] bg-[#1a1a1a] border-[#333333] text-white"
                              />
                              {getErrorMessage("payoutDenialDetails")}
                            </div>
                          </div>
                        )}

                        {/* Other Report Types */}
                        {formData.reportReason &&
                          formData.reportReason !== "unjustified-breach" &&
                          formData.reportReason !== "payout-denial" && (
                            <div className="space-y-2">
                              <label htmlFor="report-description" className="block text-sm text-red-400">
                                Detailed Description
                              </label>
                              <Textarea
                                name="reportDescription"
                                value={formData.reportDescription}
                                onChange={handleInputChange}
                                placeholder="Provide detailed information about the issue..."
                                className="min-h-[100px] bg-[#1a1a1a] border-gray-700 text-white"
                              />
                              {getErrorMessage("reportDescription")}
                            </div>
                          )}

                        {/* File Upload Section - Common for all report types */}
                        {formData.reportReason && (
                          <div className="space-y-2">
                            <label className="block text-sm text-red-400">
                              Please upload proofs that support your claim below:
                            </label>

                            <div className="grid grid-cols-2 gap-2">
                              {Array.from({ length: Math.min(formData.proofFiles.length + 1, 6) }).map((_, index) => (
                                <div
                                  key={index}
                                  className="relative border-2 border-dashed border-[#333333] rounded-lg p-4 text-center hover:border-[#edb900] transition-colors cursor-pointer"
                                  onClick={() => document.getElementById(`proof-upload-${index}`)?.click()}
                                >
                                  <div className="flex flex-col items-center justify-center gap-2">
                                    <Upload className="h-6 w-6 text-gray-400" />
                                    <p className="text-xs text-gray-400 break-all">
                                      {formData.proofFiles[index] ? formData.proofFiles[index].name : "UPLOAD FILE"}
                                    </p>
                                    <input
                                      id={`proof-upload-${index}`}
                                      type="file"
                                      className="hidden"
                                      accept=".jpg,.jpeg,.png,.pdf"
                                      onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                          const newFiles = [...formData.proofFiles]
                                          newFiles[index] = e.target.files[0]
                                          setFormData({
                                            ...formData,
                                            proofFiles: newFiles,
                                          })
                                        }
                                      }}
                                    />
                                  </div>

                                  {/* Add remove button for uploaded files */}
                                  {formData.proofFiles[index] && (
                                    <button
                                      type="button"
                                      className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-600 text-white rounded-full p-1"
                                      onClick={(e) => {
                                        e.stopPropagation() // Prevent triggering the file upload click
                                        const newFiles = [...formData.proofFiles]
                                        newFiles.splice(index, 1)
                                        setFormData({
                                          ...formData,
                                          proofFiles: newFiles,
                                        })
                                      }}
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                            {getErrorMessage("proofFiles")}

                            {formData.proofFiles.length < 6 && formData.proofFiles.length > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  // This is just a visual indicator, the upload field is shown automatically
                                  // based on the array length in the grid above
                                }}
                                className="text-[#edb900] text-sm flex items-center mt-2 hover:underline"
                              >
                                <span>Add More +</span>
                              </button>
                            )}

                            <p className="text-xs text-gray-500 mt-1">
                              *Accepted file formats: .jpg, .jpeg, .png, .pdf
                              <br />
                              *Uploads should be up to 10MB in size.
                              <br />
                              *You can upload up to 6 files.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="p-6 pt-0 mb-5 mt-5 flex justify-center mt-auto">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  className="border-[#edb900] bg-[#0f0f0f] mr-5 text-[#edb900] hover:text-[#edb900] hover:bg-[#171717]"
                  onClick={prevStep}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              ) : (
                <div></div>
              )}

              {/* Update the Next button to use the validation state and add Tippy tooltip: */}
              <Tippy
                content="Please fill in all required fields to proceed"
                disabled={isCurrentStepValid()}
                placement="top"
                theme="custom"
              >
                <span className="inline-block">
                  <Button
                    type="button"
                    className="bg-[#edb900] text-[#0f0f0f] hover:bg-[#edb900]/80"
                    onClick={nextStep}
                    disabled={isSubmitting || !isCurrentStepValid()}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#0f0f0f]"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      <>
                        {step === 4 ? "Submit" : "Next"} <ChevronRight className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </Button>
                </span>
              </Tippy>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

