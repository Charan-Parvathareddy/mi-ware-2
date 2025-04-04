"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ReadFilePropertiesProps {
  formData: any
  onChange: (data: any) => void
  onExecute: (result: any) => void
  isExecuting: boolean
}

export function ReadFileProperties({ formData, onChange, onExecute, isExecuting }: ReadFilePropertiesProps) {
  const [provider, setProvider] = useState(formData.provider || "local")
  const [format, setFormat] = useState(formData.format || "xml")
  const [path, setPath] = useState(formData.path || "/app/mock_data/test_records_2000.xml")
  const [executing, setExecuting] = useState(false)

  const handleChange = (field: string, value: string) => {
    if (field === "provider") setProvider(value)
    else if (field === "format") setFormat(value)
    else if (field === "path") setPath(value)

    onChange({ ...formData, [field]: value })
  }

  const handleExecute = async () => {
    setExecuting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const result = {
        success: true,
        records: [
          {
            Id: "001",
            Name: "Acme Corporation",
            AccountNumber: "ACC001",
            Industry: "Technology",
            AnnualRevenue: 5000000,
            NumberOfEmployees: 500,
            BillingCity: "San Francisco",
            BillingState: "CA",
          },
          {
            Id: "002",
            Name: "Globex Corporation",
            AccountNumber: "ACC002",
            Industry: "Healthcare",
            AnnualRevenue: 3000000,
            NumberOfEmployees: 300,
            BillingCity: "Boston",
            BillingState: "MA",
          },
          {
            Id: "003",
            Name: "Soylent Corp",
            AccountNumber: "ACC003",
            Industry: "Food & Beverage",
            AnnualRevenue: 800000,
            NumberOfEmployees: 150,
            BillingCity: "Chicago",
            BillingState: "IL",
          },
          {
            Id: "004",
            Name: "Initech",
            AccountNumber: "ACC004",
            Industry: "Technology",
            AnnualRevenue: 1200000,
            NumberOfEmployees: 200,
            BillingCity: "Austin",
            BillingState: "TX",
          },
          {
            Id: "005",
            Name: "Umbrella Corporation",
            AccountNumber: "ACC005",
            Industry: "Healthcare",
            AnnualRevenue: 7500000,
            NumberOfEmployees: 1000,
            BillingCity: "New York",
            BillingState: "NY",
          },
        ],
        metadata: {
          source: path,
          format: format,
          recordCount: 5,
          timestamp: new Date().toISOString(),
        },
      }

      onExecute(result)
    } catch (error) {
      console.error("Error executing read file:", error)
    } finally {
      setExecuting(false)
    }
  }

  return (
    <div className="space-y-4 p-4">
      <div className="bg-blue-50 p-3 rounded-md text-blue-800 text-sm">
        This node reads data from a file source with the specified format and options.
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
              <SelectItem value="s3">AWS S3</SelectItem>
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
        <Label htmlFor="path">File Path</Label>
        <Input
          id="path"
          value={path}
          onChange={(e) => handleChange("path", e.target.value)}
          placeholder="Enter file path"
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
              <strong>Records:</strong> {formData.result.records?.length || 0}
            </div>
            <div>
              <strong>Source:</strong> {formData.result.metadata?.source}
            </div>
            <div>
              <strong>Format:</strong> {formData.result.metadata?.format}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

