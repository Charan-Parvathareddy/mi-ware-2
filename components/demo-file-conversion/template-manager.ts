import type { Node, Edge } from "reactflow"
import { FileText, FilterX, FileOutput } from "lucide-react"

export interface FlowTemplate {
  nodes: Node[]
  edges: Edge[]
}

export const fileConversionWorkflowTemplate: FlowTemplate = {
  nodes: [
    {
      id: "start",
      type: "start",
      position: { x: 100, y: 250 },
      data: { label: "Start", category: "start" },
      draggable: true,
    },
    {
      id: "readFileNode-1",
      type: "custom",
      position: { x: 300, y: 250 },
      data: {
        label: "Read File",
        type: "readFileNode",
        icon: FileText,
        category: "demo-file-conversion",
        formData: {
          provider: "local",
          format: "xml",
          path: "/app/mock_data/test_records_2000.xml",
          rowTag: "Record",
          rootTag: "Records",
        },
      },
    },
    {
      id: "filterNode-1",
      type: "custom",
      position: { x: 600, y: 250 },
      data: {
        label: "Filter",
        type: "filterNode",
        icon: FilterX,
        category: "demo-file-conversion",
        formData: {
          operator: "AND",
          revenueFilter: true,
          revenueValue: 1000000,
          industryFilter: true,
          industryOperator: "OR",
          technologyFilter: true,
          healthcareFilter: true,
        },
      },
    },
    {
      id: "writeFileNode-1",
      type: "custom",
      position: { x: 900, y: 250 },
      data: {
        label: "Write File",
        type: "writeFileNode",
        icon: FileOutput,
        category: "demo-file-conversion",
        formData: {
          provider: "aws",
          format: "json",
          path: "kmk-iscs/output/test_records_json",
          mode: "overwrite",
        },
      },
    },
    {
      id: "end",
      type: "end",
      position: { x: 1100, y: 250 },
      data: { label: "End", category: "end" },
      draggable: true,
    },
  ],
  edges: [
    {
      id: "edge-start-readFileNode",
      source: "start",
      target: "readFileNode-1",
      animated: true,
      style: { stroke: "#94a3b8", strokeWidth: 2 },
    },
    {
      id: "edge-readFileNode-filterNode",
      source: "readFileNode-1",
      target: "filterNode-1",
      animated: true,
      style: { stroke: "#94a3b8", strokeWidth: 2 },
    },
    {
      id: "edge-filterNode-writeFileNode",
      source: "filterNode-1",
      target: "writeFileNode-1",
      animated: true,
      style: { stroke: "#94a3b8", strokeWidth: 2 },
    },
    {
      id: "edge-writeFileNode-end",
      source: "writeFileNode-1",
      target: "end",
      animated: true,
      style: { stroke: "#94a3b8", strokeWidth: 2 },
    },
  ],
}

export function getTemplate(templateName: string): FlowTemplate | null {
  switch (templateName) {
    case "fileConversionWorkflow":
      return fileConversionWorkflowTemplate
    default:
      return null
  }
}

