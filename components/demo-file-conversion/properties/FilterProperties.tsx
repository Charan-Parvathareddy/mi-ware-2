"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface FilterPropertiesProps {
  formData: any
  onChange: (data: any) => void
  onExecute: (result: any) => void
  isExecuting: boolean
  inputData: any
}

export function FilterProperties({ formData, onChange, onExecute, isExecuting, inputData }: FilterPropertiesProps) {
  const [revenueFilter, setRevenueFilter] = useState(formData.revenueFilter || true)
  const [revenueValue, setRevenueValue] = useState(formData.revenueValue || 1000000)
  const [industryFilter, setIndustryFilter] = useState(formData.industryFilter || true)
  const [technologyFilter, setTechnologyFilter] = useState(formData.technologyFilter || true)
  const [healthcareFilter, setHealthcareFilter] = useState(formData.healthcareFilter || true)
  const [executing, setExecuting] = useState(false)

  const handleChange = (field: string, value: any) => {
    if (field === "revenueFilter") setRevenueFilter(value)
    else if (field === "revenueValue") setRevenueValue(value)
    else if (field === "industryFilter") setIndustryFilter(value)
    else if (field === "technologyFilter") setTechnologyFilter(value)
    else if (field === "healthcareFilter") setHealthcareFilter(value)

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

      // Apply filter: AnnualRevenue > 1000000 AND (Industry = 'Technology' OR Industry = 'Healthcare')
      const filteredRecords = inputData.records.filter(
        (record: any) =>
          record.AnnualRevenue > revenueValue &&
          ((technologyFilter && record.Industry === "Technology") ||
            (healthcareFilter && record.Industry === "Healthcare")),
      )

      const result = {
        success: true,
        records: filteredRecords,
        metadata: {
          inputRecordCount: inputData.records.length,
          outputRecordCount: filteredRecords.length,
          filterCriteria: {
            operator: "AND",
            conditions: [
              { field: "AnnualRevenue", operation: "gt", value: revenueValue },
              {
                operator: "OR",
                conditions: [
                  { field: "Industry", operation: "eq", value: "Technology" },
                  { field: "Industry", operation: "eq", value: "Healthcare" },
                ],
              },
            ],
          },
          timestamp: new Date().toISOString(),
        },
      }

      onExecute(result)
    } catch (error) {
      console.error("Error executing filter:", error)
    } finally {
      setExecuting(false)
    }
  }

  return (
    <div className="space-y-4 p-4">
      <div className="bg-blue-50 p-3 rounded-md text-blue-800 text-sm">
        This node filters the data based on specified conditions.
      </div>

     

      <div className="space-y-2 border p-3 rounded-md">
        <div className="flex items-center justify-between">
          <Label htmlFor="revenueFilter" className="font-medium">
            Annual Revenue Filter
          </Label>
          <Switch
            id="revenueFilter"
            checked={revenueFilter}
            onCheckedChange={(checked) => handleChange("revenueFilter", checked)}
          />
        </div>

        {revenueFilter && (
          <div className="mt-2">
            <Label htmlFor="revenueValue">Minimum Revenue</Label>
            <Input
              id="revenueValue"
              type="number"
              value={revenueValue}
              onChange={(e) => handleChange("revenueValue", Number(e.target.value))}
            />
          </div>
        )}
      </div>

      

      {formData.result && (
        <div className="mt-4 space-y-2">
          <h3 className="text-sm font-medium">Execution Result:</h3>
          <div className="bg-gray-50 p-3 rounded-md text-sm">
            <div>
              <strong>Success:</strong> {formData.result.success ? "Yes" : "No"}
            </div>
            <div>
              <strong>Input Records:</strong> {formData.result.metadata?.inputRecordCount || 0}
            </div>
            <div>
              <strong>Output Records:</strong> {formData.result.metadata?.outputRecordCount || 0}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

