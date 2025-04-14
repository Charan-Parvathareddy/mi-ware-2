"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  const [mainOperator, setMainOperator] = useState(formData.mainOperator || "AND")
  const [industryOperator, setIndustryOperator] = useState(formData.industryOperator || "OR")
  const [executing, setExecuting] = useState(false)

  const handleChange = (field: string, value: any) => {
    if (field === "revenueFilter") setRevenueFilter(value)
    else if (field === "revenueValue") setRevenueValue(value)
    else if (field === "industryFilter") setIndustryFilter(value)
    else if (field === "technologyFilter") setTechnologyFilter(value)
    else if (field === "healthcareFilter") setHealthcareFilter(value)
    else if (field === "mainOperator") setMainOperator(value)
    else if (field === "industryOperator") setIndustryOperator(value)

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

      // Build the filter structure that matches the API requirements
      const conditions = []

      if (revenueFilter) {
        conditions.push({
          field: "AnnualRevenue",
          operation: "gt",
          value: revenueValue,
        })
      }

      if (industryFilter && (technologyFilter || healthcareFilter)) {
        const industryConditions = []

        if (technologyFilter) {
          industryConditions.push({
            field: "Industry",
            operation: "eq",
            value: "Technology",
          })
        }

        if (healthcareFilter) {
          industryConditions.push({
            field: "Industry",
            operation: "eq",
            value: "Healthcare",
          })
        }

        if (industryConditions.length > 0) {
          conditions.push({
            operator: industryOperator,
            conditions: industryConditions,
          })
        }
      }

      const filterCriteria = {
        operator: mainOperator,
        conditions: conditions,
      }

      // Apply filter to records (this is just for simulation)
      const filteredRecords = inputData.records.filter((record: any) => {
        // Check revenue condition
        let passesRevenue = true
        if (revenueFilter) {
          passesRevenue = record.AnnualRevenue > revenueValue
        }

        // Check industry condition
        let passesIndustry = true
        if (industryFilter) {
          if (industryOperator === "OR") {
            passesIndustry =
              (technologyFilter && record.Industry === "Technology") ||
              (healthcareFilter && record.Industry === "Healthcare")
          } else {
            passesIndustry =
              (!technologyFilter || record.Industry === "Technology") &&
              (!healthcareFilter || record.Industry === "Healthcare")
          }
        }

        // Combine conditions based on main operator
        if (mainOperator === "AND") {
          return passesRevenue && passesIndustry
        } else {
          return passesRevenue || passesIndustry
        }
      })

      const result = {
        success: true,
        records: filteredRecords,
        metadata: {
          inputRecordCount: inputData.records.length,
          outputRecordCount: filteredRecords.length,
          filterCriteria: filterCriteria,
          timestamp: new Date().toISOString(),
        },
        filterCriteria: filterCriteria, // Store the actual filter criteria for API calls
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

      {!inputData && (
        <div className="bg-yellow-50 p-3 rounded-md text-yellow-800 text-sm">
          No input data available. Please execute the previous node first.
        </div>
      )}

      <div className="space-y-2 border p-3 rounded-md">
        <div className="flex items-center justify-between mb-3">
          <Label htmlFor="mainOperator" className="font-medium">
            Main Operator
          </Label>
          <Select value={mainOperator} onValueChange={(value) => handleChange("mainOperator", value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select operator" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AND">AND</SelectItem>
              <SelectItem value="OR">OR</SelectItem>
            </SelectContent>
          </Select>
        </div>

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

      <div className="space-y-2 border p-3 rounded-md">
        <div className="flex items-center justify-between">
          <Label htmlFor="industryFilter" className="font-medium">
            Industry Filter
          </Label>
          <Switch
            id="industryFilter"
            checked={industryFilter}
            onCheckedChange={(checked) => handleChange("industryFilter", checked)}
          />
        </div>

        {industryFilter && (
          <>
            <div className="flex items-center justify-between mt-3 mb-3">
              <Label htmlFor="industryOperator" className="font-medium">
                Industry Operator
              </Label>
              <Select value={industryOperator} onValueChange={(value) => handleChange("industryOperator", value)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Select operator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OR">OR</SelectItem>
                  <SelectItem value="AND">AND</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3 mt-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="technologyFilter">Technology</Label>
                <Switch
                  id="technologyFilter"
                  checked={technologyFilter}
                  onCheckedChange={(checked) => handleChange("technologyFilter", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="healthcareFilter">Healthcare</Label>
                <Switch
                  id="healthcareFilter"
                  checked={healthcareFilter}
                  onCheckedChange={(checked) => handleChange("healthcareFilter", checked)}
                />
              </div>
            </div>
          </>
        )}
      </div>

      <Button
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
        onClick={handleExecute}
        disabled={isExecuting || executing || !inputData}
      >
        {isExecuting || executing ? "Executing..." : "Execute Node"}
      </Button>

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
