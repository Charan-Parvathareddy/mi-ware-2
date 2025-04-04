"use client"

import { useState, useEffect } from "react"
import { Check, Loader, ArrowRight, Code, Server } from "lucide-react"
import { cn } from "@/lib/utils"

interface ApiVisualizerProps {
  isVisible: boolean
  requestData: any
  onComplete: () => void
}

export function ApiVisualizer({ isVisible, requestData, onComplete }: ApiVisualizerProps) {
  const [stage, setStage] = useState<"preparing" | "sending" | "receiving" | "complete">("preparing")
  const [progress, setProgress] = useState(0)
  const [showResponse, setShowResponse] = useState(false)

  useEffect(() => {
    if (isVisible) {
      // Simulate API call stages
      const preparingTimeout = setTimeout(() => {
        setStage("sending")
        setProgress(33)
      }, 1500)

      const sendingTimeout = setTimeout(() => {
        setStage("receiving")
        setProgress(66)
      }, 3000)

      const receivingTimeout = setTimeout(() => {
        setStage("complete")
        setProgress(100)
        setShowResponse(true)
      }, 4500)

      const completeTimeout = setTimeout(() => {
        onComplete()
      }, 6000)

      return () => {
        clearTimeout(preparingTimeout)
        clearTimeout(sendingTimeout)
        clearTimeout(receivingTimeout)
        clearTimeout(completeTimeout)
      }
    }
  }, [isVisible, onComplete])

  if (!isVisible) return null

  const responseData = {
    created_at: "2025-03-27T16:28:41.386310",
    updated_at: "2025-03-27T16:28:41.386316",
    id: 1,
    client_id: 1,
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-gray-900 rounded-lg shadow-lg w-[800px] text-white p-6 font-mono">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <Server className="mr-2" /> API Request
          </h2>
          <div className="flex items-center space-x-2">
            <div
              className={cn(
                "h-2 rounded-full transition-all duration-500 bg-gradient-to-r from-emerald-500 to-blue-500",
                "w-[300px]",
              )}
              style={{ backgroundSize: `${progress}% 100%` }}
            />
            <span className="text-xs">{Math.round(progress)}%</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            {stage === "preparing" ? (
              <Loader className="w-5 h-5 text-blue-400 animate-spin" />
            ) : (
              <Check className="w-5 h-5 text-green-400" />
            )}
            <div className="flex-1">
              <div className="text-blue-400">Preparing Request</div>
              <div className="text-xs text-gray-400">Building request payload with workflow data</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {stage === "sending" ? (
              <Loader className="w-5 h-5 text-blue-400 animate-spin" />
            ) : stage === "preparing" ? (
              <div className="w-5 h-5" />
            ) : (
              <Check className="w-5 h-5 text-green-400" />
            )}
            <div className="flex-1">
              <div className={cn("transition-colors", stage === "preparing" ? "text-gray-500" : "text-blue-400")}>
                Sending Request
              </div>
              <div className="text-xs text-gray-400">POST http://localhost:8000/clients/1/file_conversion_configs</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {stage === "receiving" ? (
              <Loader className="w-5 h-5 text-blue-400 animate-spin" />
            ) : stage === "preparing" || stage === "sending" ? (
              <div className="w-5 h-5" />
            ) : (
              <Check className="w-5 h-5 text-green-400" />
            )}
            <div className="flex-1">
              <div
                className={cn(
                  "transition-colors",
                  stage === "preparing" || stage === "sending" ? "text-gray-500" : "text-blue-400",
                )}
              >
                Receiving Response
              </div>
              <div className="text-xs text-gray-400">Status: 200 OK</div>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Code className="mr-2" /> Request Payload
            </div>
            <div className="text-xs text-gray-400">Content-Type: application/json</div>
          </div>

          <div className="bg-gray-800 p-4 rounded-md overflow-auto max-h-[200px] text-sm">
            <pre className="text-green-300">{JSON.stringify(requestData, null, 2)}</pre>
          </div>

          {showResponse && (
            <>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center">
                  <ArrowRight className="mr-2" /> Response
                </div>
                <div className="text-xs text-gray-400">Content-Type: application/json</div>
              </div>

              <div className="bg-gray-800 p-4 rounded-md overflow-auto max-h-[200px] text-sm">
                <pre className="text-blue-300">{JSON.stringify(responseData, null, 2)}</pre>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

