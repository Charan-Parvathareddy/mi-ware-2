"use client"

import type React from "react"
import { useState } from "react"
import { ChevronRight, ChevronLeft, FileText, FilterX, FileOutput, Info, Play, BarChart2 } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SidebarItemProps {
  icon: React.ReactNode
  label: string
  onClick: () => void
  isCollapsed: boolean
}

const SidebarItem = ({ icon, label, onClick, isCollapsed }: SidebarItemProps) => (
  <div
    className={cn(
      "flex items-center gap-3 p-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors",
      isCollapsed ? "justify-center" : "",
    )}
    onClick={onClick}
  >
    <div className="text-gray-700">{icon}</div>
    {!isCollapsed && <span className="text-sm font-medium text-gray-700">{label}</span>}
  </div>
)

interface WorkflowItemProps {
  name: string
  onSelect: () => void
  onInfo: () => void
  isCollapsed: boolean
}

const WorkflowItem = ({ name, onSelect, onInfo, isCollapsed }: WorkflowItemProps) => (
  <div className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-md">
    <div className="flex items-center gap-2 flex-1 cursor-pointer" onClick={onSelect}>
      <Play className="w-4 h-4 text-blue-500" />
      {!isCollapsed && <span className="text-sm truncate text-gray-700">{name}</span>}
    </div>
    {!isCollapsed && (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation()
                onInfo()
              }}
            >
              <Info className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>View workflow information</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )}
  </div>
)

interface CollapsibleSidebarProps {
  onAddNode: (nodeType: string, label: string, icon: LucideIcon, category: string) => void
  onAddTemplate?: (templateName: string) => void
  savedWorkflows: Array<{
    id: string
    name: string
    createdAt: string
  }>
  onSelectWorkflow: (workflowId: string) => void
  onViewWorkflowInfo: (workflowId: string) => void
  onShowLogs: () => void
}

export function CollapsibleSidebar({
  onAddNode,
  onAddTemplate,
  savedWorkflows,
  onSelectWorkflow,
  onViewWorkflowInfo,
  onShowLogs,
}: CollapsibleSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>("components")

  const fileConversionNodes = [
    { type: "readFileNode", label: "Read File", icon: FileText, category: "demo-file-conversion" },
    { type: "filterNode", label: "Filter", icon: FilterX, category: "demo-file-conversion" },
    { type: "writeFileNode", label: "Write File", icon: FileOutput, category: "demo-file-conversion" },
  ]

  const handleDragStart = (event: React.DragEvent, component: any) => {
    event.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify({
        type: component.type,
        label: component.label,
        iconType: component.icon.name,
        category: component.category,
      }),
    )
    event.dataTransfer.effectAllowed = "move"
  }

  return (
    <div
      className={cn(
        "bg-white border-r border-gray-200 h-full transition-all duration-300 flex flex-col",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        {!isCollapsed && <h2 className="text-lg font-semibold text-gray-900">Mi-Ware</h2>}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1 rounded-md hover:bg-gray-200 text-gray-700">
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <div className="flex-1 overflow-auto p-2">
        {/* Components Section */}
        <div className="mb-4">
          <SidebarItem
            icon={<FileText className="w-4 h-4" />}
            label="Components"
            onClick={() => setActiveCategory(activeCategory === "components" ? null : "components")}
            isCollapsed={isCollapsed}
          />

          {!isCollapsed && activeCategory === "components" && (
            <div className="ml-8 mt-2 space-y-1">
              <div className="p-2 bg-gray-50 rounded-md cursor-default">
                <div className="text-sm font-medium text-gray-700 mb-2">File Conversion</div>
                <div className="space-y-1">
                  {fileConversionNodes.map((node) => (
                    <div
                      key={`file-conversion-${node.type}`}
                      className="p-2 bg-white rounded-md cursor-move hover:bg-gray-100 transition-colors flex items-center gap-2 shadow-sm"
                      draggable
                      onDragStart={(e) => handleDragStart(e, node)}
                      onClick={() => onAddNode(node.type, node.label, node.icon, node.category)}
                    >
                      <node.icon className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-700">{node.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Workflows Section */}
        <div className="mb-4">
          <SidebarItem
            icon={<Play className="w-4 h-4" />}
            label="Workflows"
            onClick={() => setActiveCategory(activeCategory === "workflows" ? null : "workflows")}
            isCollapsed={isCollapsed}
          />

          {!isCollapsed && activeCategory === "workflows" && (
            <div className="ml-8 mt-2 space-y-1">
              {/* Default File Conversion workflow */}
              <WorkflowItem
                name="File Conversion"
                onSelect={() => onAddTemplate && onAddTemplate("fileConversionWorkflow")}
                onInfo={() => onViewWorkflowInfo("default")}
                isCollapsed={isCollapsed}
              />

              {/* User saved workflows */}
              {savedWorkflows.map((workflow) => (
                <WorkflowItem
                  key={workflow.id}
                  name={workflow.name}
                  onSelect={() => onSelectWorkflow(workflow.id)}
                  onInfo={() => onViewWorkflowInfo(workflow.id)}
                  isCollapsed={isCollapsed}
                />
              ))}

              {savedWorkflows.length === 0 && (
                <div className="text-xs text-gray-500 p-2">
                  No saved workflows. Use the Save button to save your workflows.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Logs Section */}
        <div className="mb-4">
          <SidebarItem
            icon={<BarChart2 className="w-4 h-4" />}
            label="Logs"
            onClick={onShowLogs}
            isCollapsed={isCollapsed}
          />
        </div>
      </div>
    </div>
  )
}

