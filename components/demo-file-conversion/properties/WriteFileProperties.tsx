"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface WriteFilePropertiesProps {
  formData: any
  onChange: (data: any) => void
  onExecute: (result: any) => void
  isExecuting: boolean
  inputData: any
}

export function WriteFileProperties({
  formData,
  onChange,
  onExecute,
  isExecuting,
  inputData,
}: WriteFilePropertiesProps) {
  const [provider, setProvider] = useState(formData.provider || "aws")
  const [format, setFormat] = useState(formData.format || "json")
  const [path, setPath] = useState(formData.path || "kmk-iscs/output/test_records_json")
  const [executing, setExecuting] = useState(false)

  const handleChange = (field: string, value: string) => {
    if (field === "provider") setProvider(value)
    else if (field === "format") setFormat(value)
    else if (field === "path") setPath(value)

    onChange({ ...formData, [field]: value })
  }

  const handleExecute = async () => {
    if (!inputData) {
      alert("No input data available. Please execute the previous node first.")
      return
    }

    setExecuting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const result = {
        success: true,
        message: "Data successfully written to destination",
        metadata: {
          destination: path,
          format: format,
          recordCount: inputData.records.length,
          timestamp: new Date().toISOString(),
        },
      }

      onExecute(result)
    } catch (error) {
      console.error("Error executing write file:", error)
    } finally {
      setExecuting(false)
    }
  }

  return (
    <div className="space-y-4 p-4">
      <div className="bg-blue-50 p-3 rounded-md text-blue-800 text-sm">
        This node writes the filtered data to a destination with the specified format and options.
      </div>

      

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="provider">Provider</Label>
          <Select value={provider} onValueChange={(value) => handleChange("provider", value)}>
            <SelectTrigger id="provider">
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="local">Local</SelectItem>
              <SelectItem value="aws">AWS S3</SelectItem>
              <SelectItem value="gcs">Google Cloud Storage</SelectItem>
              <SelectItem value="azure">Azure Blob Storage</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="format">Format</Label>
          <Select value={format} onValueChange={(value) => handleChange("format", value)}>
            <SelectTrigger id="format">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="xml">XML</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="parquet">Parquet</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="path">Destination Path</Label>
        <Input
          id="path"
          value={path}
          onChange={(e) => handleChange("path", e.target.value)}
          placeholder="Enter destination path"
        />
      </div>

      

      {formData.result && (
        <div className="mt-4 space-y-2">
          <h3 className="text-sm font-medium">Execution Result:</h3>
          <div className="bg-gray-50 p-3 rounded-md text-sm">
            <div>
              <strong>Success:</strong> {formData.result.success ? "Yes" : "No"}
            </div>
            <div>
              <strong>Message:</strong> {formData.result.message}
            </div>
            <div>
              <strong>Destination:</strong> {formData.result.metadata?.destination}
            </div>
            <div>
              <strong>Format:</strong> {formData.result.metadata?.format}
            </div>
            <div>
              <strong>Records Written:</strong> {formData.result.metadata?.recordCount || 0}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

