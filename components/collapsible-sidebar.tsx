"use client"

import type React from "react"
import { useState } from "react"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Database,
  FileJson,
  FileCode,
  Filter,
  Layers,
  Zap,
  ArrowRightLeft,
  Table,
  FileText,
  BarChart,
  Workflow,
} from "lucide-react"

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

interface CollapsibleSidebarProps {
  onAddNode: (nodeType: string, label: string, icon: any, category: string) => void
}

export function CollapsibleSidebar({ onAddNode }: CollapsibleSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const categories = [
    { id: "sources", label: "Sources", icon: <Database size={20} /> },
    { id: "targets", label: "Targets", icon: <Table size={20} /> },
    { id: "transformations", label: "Transformations", icon: <Zap size={20} /> },
    { id: "joiners", label: "Joiners", icon: <ArrowRightLeft size={20} /> },
    { id: "filters", label: "Filters", icon: <Filter size={20} /> },
    { id: "aggregators", label: "Aggregators", icon: <Layers size={20} /> },
  ]

  const items = {
    sources: [
      { type: "database", label: "Database", icon: Database, category: "connector" },
      { type: "fileJson", label: "JSON File", icon: FileJson, category: "connector" },
      { type: "fileXml", label: "XML File", icon: FileCode, category: "connector" },
      { type: "fileText", label: "Text File", icon: FileText, category: "connector" },
    ],
    targets: [
      { type: "database", label: "Database", icon: Database, category: "connector" },
      { type: "fileJson", label: "JSON File", icon: FileJson, category: "connector" },
      { type: "fileText", label: "Text File", icon: FileText, category: "connector" },
    ],
    transformations: [
      { type: "lookup", label: "Lookup", icon: Filter, category: "transformation" },
      { type: "expression", label: "Expression", icon: Workflow, category: "transformation" },
      { type: "normalizer", label: "Normalizer", icon: BarChart, category: "transformation" },
    ],
    joiners: [{ type: "joiner", label: "Joiner", icon: ArrowRightLeft, category: "transformation" }],
    filters: [{ type: "filter", label: "Filter", icon: Filter, category: "transformation" }],
    aggregators: [
      { type: "aggregator", label: "Aggregator", icon: Layers, category: "transformation" },
      { type: "sorter", label: "Sorter", icon: Layers, category: "transformation" },
    ],
  }

  return (
    <div
      className={cn(
        "bg-white border-r border-gray-200 h-full transition-all duration-300 flex flex-col",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        {!isCollapsed && <h2 className="text-lg font-semibold">Components</h2>}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1 rounded-md hover:bg-gray-100">
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <div className="flex-1 overflow-auto p-2">
        {categories.map((category) => (
          <div key={category.id} className="mb-2">
            <SidebarItem
              icon={category.icon}
              label={category.label}
              onClick={() => setActiveCategory(activeCategory === category.id ? null : category.id)}
              isCollapsed={isCollapsed}
            />

            {!isCollapsed && activeCategory === category.id && (
              <div className="ml-8 mt-2 space-y-1">
                {items[category.id as keyof typeof items].map((item) => (
                  <div
                    key={`${category.id}-${item.type}`}
                    className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-gray-100 text-sm"
                    onClick={() => onAddNode(item.type, item.label, item.icon, item.category)}
                  >
                    <item.icon size={16} className="text-gray-600" />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

