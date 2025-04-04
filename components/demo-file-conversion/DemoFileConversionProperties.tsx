"use client"

import { useState, useEffect } from "react"
import type { Node } from "reactflow"
import { ReadFileProperties } from "./properties/ReadFileProperties"
import { FilterProperties } from "./properties/FilterProperties"
import { WriteFileProperties } from "./properties/WriteFileProperties"

interface DemoFileConversionPropertiesProps {
  node: Node
  onUpdateNode: (data: any) => void
  isExecuting: boolean
}

export function DemoFileConversionProperties({ node, onUpdateNode, isExecuting }: DemoFileConversionPropertiesProps) {
  const [formData, setFormData] = useState<any>(node.data?.formData || {})

  useEffect(() => {
    setFormData(node.data?.formData || {})
  }, [node])

  const handleFormChange = (data: any) => {
    setFormData(data)
    onUpdateNode({ formData: data })
  }

  const handleExecute = (result: any) => {
    const updatedFormData = { ...formData, result }
    setFormData(updatedFormData)
    onUpdateNode({
      formData: updatedFormData,
      executed: true,
      outputData: result,
    })
  }

  const renderPropertiesComponent = () => {
    switch (node.data?.type) {
      case "readFileNode":
        return (
          <ReadFileProperties
            formData={formData}
            onChange={handleFormChange}
            onExecute={handleExecute}
            isExecuting={isExecuting}
          />
        )
      case "filterNode":
        return (
          <FilterProperties
            formData={formData}
            onChange={handleFormChange}
            onExecute={handleExecute}
            isExecuting={isExecuting}
            inputData={node.data?.inputData}
          />
        )
      case "writeFileNode":
        return (
          <WriteFileProperties
            formData={formData}
            onChange={handleFormChange}
            onExecute={handleExecute}
            isExecuting={isExecuting}
            inputData={node.data?.inputData}
          />
        )
      default:
        return <div className="p-4 text-center text-gray-500">No properties available for this node type</div>
    }
  }

  return <div className="p-4">{renderPropertiesComponent()}</div>
}

