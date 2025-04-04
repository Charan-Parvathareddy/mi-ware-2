"use client"

import { Handle, Position, useReactFlow } from "reactflow"
import { Check, X } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface NodeData {
  label: string
  type: string
  icon?: LucideIcon
  category: "connector" | "transformation" | "job" | "start" | "end" | "demo" | "file-conversion"
  executed?: boolean
  inputData?: any
  outputData?: any
  apiCall?: string
  error?: string
}

interface CustomNodeProps {
  id: string
  data: NodeData
  selected: boolean
}

export function CustomNode({ id, data, selected }: CustomNodeProps) {
  const { deleteElements } = useReactFlow()
  const IconComponent = data.icon

  if (!IconComponent) return null

  const handleClose = () => {
    deleteElements({ nodes: [{ id }] })
  }

  // Determine node style based on category
  let nodeStyle = "bg-white"
  let iconBgColor = "bg-blue-50"
  let iconTextColor = "text-blue-500"

  if (data.category === "connector") {
    if (data.type.includes("Target")) {
      nodeStyle = "bg-white"
      iconBgColor = "bg-amber-50"
      iconTextColor = "text-amber-600"
    } else {
      nodeStyle = "bg-white"
      iconBgColor = "bg-green-50"
      iconTextColor = "text-green-600"
    }
  } else if (data.category === "transformation") {
    if (data.type === "filter") {
      iconBgColor = "bg-purple-50"
      iconTextColor = "text-purple-600"
    } else if (data.type === "aggregator" || data.type === "sorter") {
      iconBgColor = "bg-indigo-50"
      iconTextColor = "text-indigo-600"
    } else if (data.type === "joiner") {
      iconBgColor = "bg-cyan-50"
      iconTextColor = "text-cyan-600"
    } else {
      iconBgColor = "bg-blue-50"
      iconTextColor = "text-blue-600"
    }
  } else if (data.category === "demo") {
    iconBgColor = "bg-orange-50"
    iconTextColor = "text-orange-600"
  } else if (data.category === "file-conversion") {
    iconBgColor = "bg-teal-50"
    iconTextColor = "text-teal-600"
  }

  return (
    <div
      className={`relative flex flex-col items-center justify-center w-[120px] h-[80px] border-2 ${selected ? "border-blue-400" : "border-gray-200"} rounded-md ${nodeStyle} shadow-sm`}
      data-category={data.category}
      data-id={id}
    >
      {data.executed && !data.error && (
        <div className="absolute -top-2 -left-2 bg-green-500 text-white rounded-full p-1 z-10">
          <Check className="w-3 h-3" />
        </div>
      )}

      {data.executed && data.error && (
        <div className="absolute -top-2 -left-2 bg-red-500 text-white rounded-full p-1 z-10" title={data.error}>
          <X className="w-3 h-3" />
        </div>
      )}

      {selected && (
        <button
          onClick={handleClose}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors z-10"
        >
          <X className="w-3 h-3" />
        </button>
      )}

      {data.category !== "job" && (
        <>
          <Handle type="target" position={Position.Left} id={`${id}-left`} className="w-2 h-2 !bg-blue-500" />
          <Handle type="source" position={Position.Right} id={`${id}-right`} className="w-2 h-2 !bg-blue-500" />
        </>
      )}

      <div className="flex items-center gap-2 mb-1">
        <div className={`p-1 ${iconBgColor} rounded-md`}>
          <IconComponent className={`w-4 h-4 ${iconTextColor}`} />
        </div>
        <h3 className="font-semibold text-gray-800 text-xs">{data.label}</h3>
      </div>
      <p className="text-[10px] text-gray-500">{data.type}</p>
    </div>
  )
}

