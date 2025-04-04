import {
  Database,
  Workflow,
  FileJson,
  FileCode,
  Filter,
  Layers,
  ArrowRightLeft,
  FileText,
  BarChart,
  Clock,
  Upload,
  FileUp,
  List,
  FileSearch,
  Edit,
  Trash2,
  GitBranch,
  Users,
  FileDigit,
  Network,
  Cog,
  FileOutput,
  FilterX,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export interface SidebarItem {
  type: string
  label: string
  icon: LucideIcon
  category: string
}

export const sources: SidebarItem[] = [
  { type: "database", label: "Database", icon: Database, category: "connector" },
  { type: "fileJson", label: "JSON File", icon: FileJson, category: "connector" },
  { type: "fileXml", label: "XML File", icon: FileCode, category: "connector" },
  { type: "fileText", label: "Text File", icon: FileText, category: "connector" },
]

export const targets: SidebarItem[] = [
  { type: "database", label: "Database Target", icon: Database, category: "connector" },
  { type: "fileJson", label: "JSON File Target", icon: FileJson, category: "connector" },
  { type: "fileText", label: "Text File Target", icon: FileText, category: "connector" },
]

export const transformations: SidebarItem[] = [
  { type: "lookup", label: "Lookup", icon: Filter, category: "transformation" },
  { type: "expression", label: "Expression", icon: Workflow, category: "transformation" },
  { type: "normalizer", label: "Normalizer", icon: BarChart, category: "transformation" },
]

export const joiners: SidebarItem[] = [
  { type: "joiner", label: "Joiner", icon: ArrowRightLeft, category: "transformation" },
]

export const filters: SidebarItem[] = [{ type: "filter", label: "Filter", icon: Filter, category: "transformation" }]

export const aggregators: SidebarItem[] = [
  { type: "aggregator", label: "Aggregator", icon: Layers, category: "transformation" },
  { type: "sorter", label: "Sorter", icon: Layers, category: "transformation" },
]

export const demoNodes: SidebarItem[] = [
  { type: "onSchedule", label: "On Schedule", icon: Clock, category: "demo" },
  { type: "readFile", label: "Read File", icon: FileText, category: "demo" },
  { type: "writeFile", label: "Write File", icon: Upload, category: "demo" },
]

export const fileConversionNodes: SidebarItem[] = [
  { type: "createConfig", label: "Create Config", icon: FileUp, category: "file-conversion" },
  { type: "listConfigs", label: "List Configs", icon: List, category: "file-conversion" },
  { type: "getConfig", label: "Get Config", icon: FileSearch, category: "file-conversion" },
  { type: "updateConfig", label: "Update Config", icon: Edit, category: "file-conversion" },
  { type: "deleteConfig", label: "Delete Config", icon: Trash2, category: "file-conversion" },
]

export const demo111Nodes: SidebarItem[] = [
  { type: "createClient", label: "Create Client", icon: Users, category: "demo111" },
  { type: "createDag", label: "Create DAG", icon: GitBranch, category: "demo111" },
  { type: "fileConversionConfig", label: "File Conversion Config", icon: FileDigit, category: "demo111" },
  { type: "updateDag", label: "Update DAG", icon: Network, category: "demo111" },
  { type: "executeWorkflow", label: "Execute Workflow", icon: Cog, category: "demo111" },
]

export const demoFileConversionNodes: SidebarItem[] = [
  { type: "readFileNode", label: "Read File", icon: FileText, category: "demo-file-conversion" },
  { type: "filterNode", label: "Filter", icon: FilterX, category: "demo-file-conversion" },
  { type: "writeFileNode", label: "Write File", icon: FileOutput, category: "demo-file-conversion" },
]

