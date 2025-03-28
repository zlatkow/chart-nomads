/* eslint-disable */
"use client"

import type React from "react"

import { useState } from "react"
import { Button, Input, Textarea, Card, CardBody, CardHeader, CardFooter, Divider } from "@nextui-org/react"

// Create a simple test page for review submission
export default function TestReviewSubmission() {
  const [formData, setFormData] = useState({
    companyId: "1", // Default test company ID
    reviewText: "",
    rating: 5,
  })
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [responseData, setResponseData] = useState("")
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const submitReview = async () => {
    setStatus("loading")
    setMessage("Submitting review...")
    setError("")
    setResponseData("")

    try {
      // Submit via API
      const response = await fetch("/api/test-review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `Server responded with ${response.status}`)
      }

      setStatus("success")
      setMessage("Review submitted successfully!")
      setResponseData(JSON.stringify(result, null, 2))
    } catch (err: any) {
      setStatus("error")
      setMessage("Review submission failed")
      setError(err.message || "Unknown error")
      console.error("Error submitting review:", err)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex gap-3">
          <div className="flex flex-col">
            <p className="text-md">Test Review Submission</p>
            <p className="text-small text-default-500">Submit a test review to Supabase</p>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="flex flex-col gap-4">
            <Input label="Company ID" name="companyId" value={formData.companyId} onChange={handleChange} />

            <Input
              type="number"
              label="Rating (1-5)"
              name="rating"
              min={1}
              max={5}
              value={formData.rating.toString()}
              onChange={handleChange}
            />

            <Textarea
              label="Review Text"
              name="reviewText"
              value={formData.reviewText}
              onChange={handleChange}
              placeholder="Enter your review here..."
            />

            {status !== "idle" && (
              <div
                className={`p-3 rounded ${status === "error" ? "bg-red-100 text-red-800" : status === "success" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}
              >
                <p className="font-medium">{message}</p>
                {error && <p className="text-red-600 mt-2">{error}</p>}
                {responseData && (
                  <div className="mt-2">
                    <p className="font-medium">Response Data:</p>
                    <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto mt-1">{responseData}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardBody>
        <Divider />
        <CardFooter>
          <Button
            color={status === "error" ? "danger" : status === "success" ? "success" : "primary"}
            onClick={submitReview}
            isLoading={status === "loading"}
            className="w-full"
          >
            {status === "idle"
              ? "Submit Review"
              : status === "loading"
                ? "Submitting..."
                : status === "success"
                  ? "Submit Another"
                  : "Try Again"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

