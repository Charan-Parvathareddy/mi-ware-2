"use client"

import type React from "react"
import { useState, useCallback, useRef, useMemo, useEffect } from "react"
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Connection,
  useNodesState,
  useEdgesState,
  useReactFlow,
  addEdge,
  Panel,
} from "reactflow"
import "reactflow/dist/style.css"
import { Play, Save, Upload, StopCircle, Plus } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { StartNode } from "./components/nodes/StartNode"
import { EndNode } from "./components/nodes/EndNode"
import { CustomNode } from "./components/nodes/CustomNode"
import { UploadFileNode } from "./components/nodes/UploadFileNode"
import { CollapsibleSidebar } from "./components/sidebar/CollapsibleSidebar"
import { isValidConnection } from "./utils/connection-utils"
import { DemoFileConversionProperties } from "./components/demo-file-conversion/DemoFileConversionProperties"
import { WorkflowProgress } from "./components/demo-file-conversion/WorkflowProgress"
import { ApiVisualizer } from "./components/demo-file-conversion/ApiVisualizer"
import { SaveWorkflowDialog } from "./components/demo-file-conversion/SaveWorkflowDialog"
import { WorkflowInfoModal } from "./components/demo-file-conversion/WorkflowInfoModal"
import { CreateDagModal } from "./components/workflow/CreateDagModal"
import { LogsDashboard } from "./components/logs/LogsDashboard"
import { getTemplate } from "./components/demo-file-conversion/template-manager"
import { LoginPage } from "./components/auth/login-page"
import { ApiMonitor } from "./components/api-monitor/api-monitor"
import { initializeDataService, getDagId, getConfigId, setConfigId } from "@/data/data-service"

// Define props interface for the components
interface FlowBuilderProps {
  onNodeSelect?: (node: Node) => void
}

// Define workflow type
interface Workflow {
  id: string
  name: string
  createdAt: string
  nodes: Node[]
  edges: any[]
  lastRun?: string
  stats?: {
    executionTime: number
    recordsProcessed: number
    successRate: number
  }
  executionHistory?: {
    date: string
    executionTime: number
    recordsProcessed: number
    successRate: number
  }[]
}

// Wrap the main component with ReactFlowProvider
export function FlowBuilderWithProvider({ onNodeSelect }: FlowBuilderProps) {
  return (
    <ReactFlowProvider>
      <FlowBuilderContent onNodeSelect={onNodeSelect} />
    </ReactFlowProvider>
  )
}

function FlowBuilderContent({ onNodeSelect }: FlowBuilderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<string>("")
  const [showApiVisualizer, setShowApiVisualizer] = useState(false)
  const [apiRequestData, setApiRequestData] = useState<any>(null)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showCreateDagModal, setShowCreateDagModal] = useState(false)
  const [savedWorkflows, setSavedWorkflows] = useState<Workflow[]>([])
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null)
  const [showWorkflowInfo, setShowWorkflowInfo] = useState(false)
  const [showLogs, setShowLogs] = useState(false)
  const [showApiMonitor, setShowApiMonitor] = useState(false)
  const [currentWorkflowName, setCurrentWorkflowName] = useState<string>("")
  const [executionPhase, setExecutionPhase] = useState<number>(0)
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const { project, getNodes, getEdges } = useReactFlow()

  // Initialize with just start and end nodes
  useEffect(() => {
    if (isAuthenticated) {
      // Initialize data service
      initializeDataService()

      // Create basic start and end nodes
      const initialNodes: Node[] = [
        {
          id: "start",
          type: "start",
          position: { x: 250, y: 250 },
          data: {},
        },
        {
          id: "end",
          type: "end",
          position: { x: 600, y: 250 },
          data: {},
        },
      ]

      setNodes(initialNodes)

      // Show API monitor after login
      setShowApiMonitor(true)

      // Load saved workflows from localStorage
      const savedWorkflowsStr = localStorage.getItem("savedWorkflows")
      if (savedWorkflowsStr) {
        try {
          const parsedWorkflows = JSON.parse(savedWorkflowsStr)
          setSavedWorkflows(parsedWorkflows)
        } catch (error) {
          console.error("Error loading saved workflows:", error)
        }
      }
    }
  }, [isAuthenticated, setNodes])

  // Listen for node update events from the UploadFileNode
  useEffect(() => {
    const handleNodeUpdate = (event: CustomEvent) => {
      const { id, data } = event.detail
      setNodes((nodes) => nodes.map((node) => (node.id === id ? { ...node, data: { ...node.data, ...data } } : node)))
    }

    document.addEventListener("node:update", handleNodeUpdate as EventListener)

    return () => {
      document.removeEventListener("node:update", handleNodeUpdate as EventListener)
    }
  }, [setNodes])

  const onConnect = useCallback(
    (params: Connection) => {
      if (isValidConnection(params)) {
        setEdges((eds) =>
          addEdge(
            {
              ...params,
              animated: true,
              style: { stroke: "#94a3b8", strokeWidth: 2 },
            },
            eds,
          ),
        )
      }
    },
    [setEdges],
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      if (!reactFlowWrapper.current) return

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect()
      const dataStr = event.dataTransfer.getData("application/reactflow")

      try {
        const data = JSON.parse(dataStr)

        // Dynamically import the icon
        import("lucide-react").then((icons) => {
          const IconComponent = icons[data.iconType] || icons.HelpCircle

          const position = project({
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
          })

          const newNode = {
            id: `${data.type}-${nodes.length + 1}`,
            type: data.type === "uploadFile" ? "uploadFile" : "custom",
            position,
            data: {
              label: data.label,
              type: data.type,
              icon: IconComponent,
              category: data.category,
              formData: {},
            },
          }

          setNodes((nds) => nds.concat(newNode))
        })
      } catch (error) {
        console.error("Drop error:", error)
      }
    },
    [project, nodes, setNodes],
  )

  const nodeTypes = useMemo(
    () => ({
      custom: CustomNode,
      start: StartNode,
      end: EndNode,
      uploadFile: UploadFileNode,
    }),
    [],
  )

  const onNodeDoubleClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      setSelectedNode(node)
      // Call the onNodeSelect prop if provided
      if (onNodeSelect) {
        onNodeSelect(node)
      }
    },
    [onNodeSelect],
  )

  const handleAddNode = useCallback(
    (nodeType: string, label: string, icon: LucideIcon, category: string) => {
      const position = {
        x: 250,
        y: 250,
      }

      const newNode = {
        id: `${nodeType}-${nodes.length + 1}`,
        type: nodeType === "uploadFile" ? "uploadFile" : "custom",
        position,
        data: {
          label,
          type: nodeType,
          icon,
          category,
          formData: {},
        },
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [nodes, setNodes],
  )

  const handleAddTemplate = useCallback(
    (templateName: string) => {
      const template = getTemplate(templateName)
      if (template) {
        // Clear existing nodes and edges
        setNodes([])
        setEdges([])

        // Add template nodes and edges
        setTimeout(() => {
          setNodes(template.nodes)
          setEdges(template.edges)
        }, 100)
      }
    },
    [setNodes, setEdges],
  )

  const handleUpdateNode = useCallback(
    (data: any) => {
      if (!selectedNode) return

      setNodes((nds) =>
        nds.map((n) =>
          n.id === selectedNode.id
            ? {
                ...n,
                data: {
                  ...n.data,
                  ...data,
                },
              }
            : n,
        ),
      )
    },
    [selectedNode, setNodes],
  )

  const handleAllNodesProcessed = useCallback((requestData: any) => {
    setApiRequestData(requestData)
    setShowApiVisualizer(true)
  }, [])

  const handleApiVisualizerComplete = useCallback(() => {
    setShowApiVisualizer(false)

    // If we're in the middle of a multi-phase execution, continue to the next phase
    if (executionPhase === 1) {
      // After first API call completes, start the second one (update DAG)
      executeUpdateDag()
    } else if (executionPhase === 2) {
      // After second API call completes, start the third one (trigger run)
      executeTriggerRun()
    } else if (executionPhase === 3) {
      // After third API call completes, finish the execution
      setIsExecuting(false)
      setCurrentNodeId(null)
      setCurrentStep("")
      setExecutionPhase(0)
      alert("Workflow execution completed successfully!")
    } else {
      // Normal completion
      setIsExecuting(false)
      setCurrentNodeId(null)
      setCurrentStep("")
      setExecutionPhase(0)
    }
  }, [executionPhase])

  // Helper function to save files
  function saveAs(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    setTimeout(() => {
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }, 100)
  }

  const handleCreateDag = useCallback(async (name: string, schedule: string) => {
    try {
      // Set the current workflow name for later use when saving
      setCurrentWorkflowName(name)

      // Make the actual API call to create a DAG
      const response = await fetch("http://localhost:3002/dags/", {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          schedule,
          active: true,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to create workflow: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()

      // Show success message
      alert(`Workflow "${name}" created successfully!`)

      return result
    } catch (error) {
      console.error("Error creating DAG:", error)
      throw error
    }
  }, [])

  const handleSaveWorkflow = useCallback(
    (name: string) => {
      // Use the current workflow name if it was set from creating a DAG
      const workflowName = currentWorkflowName || name

      const currentNodes = getNodes()
      const currentEdges = getEdges()

      const newWorkflow: Workflow = {
        id: `workflow-${Date.now()}`,
        name: workflowName,
        createdAt: new Date().toISOString(),
        nodes: currentNodes,
        edges: currentEdges,
        stats: {
          executionTime: 1.3,
          recordsProcessed: 1250,
          successRate: 98.2,
        },
      }

      const updatedWorkflows = [...savedWorkflows, newWorkflow]
      setSavedWorkflows(updatedWorkflows)

      // Save to localStorage
      localStorage.setItem("savedWorkflows", JSON.stringify(updatedWorkflows))

      // Save as a file
      try {
        const workflowData = JSON.stringify(newWorkflow, null, 2)
        const blob = new Blob([workflowData], { type: "application/json" })
        saveAs(blob, `${workflowName.replace(/\s+/g, "-").toLowerCase()}.json`)

        // Show success message
        alert(`Workflow "${workflowName}" saved successfully. The file has been downloaded to your computer.`)
      } catch (error) {
        console.error("Error saving workflow file:", error)
        alert("There was an error saving the workflow file. Please try again.")
      }
    },
    [getNodes, getEdges, savedWorkflows, currentWorkflowName],
  )

  const handleLoadWorkflowFromFile = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const workflow = JSON.parse(content) as Workflow

          // Add to saved workflows if not already present
          if (!savedWorkflows.some((w) => w.id === workflow.id)) {
            const updatedWorkflows = [...savedWorkflows, workflow]
            setSavedWorkflows(updatedWorkflows)
            localStorage.setItem("savedWorkflows", JSON.stringify(updatedWorkflows))
          }

          // Load the workflow
          setNodes(workflow.nodes)
          setEdges(workflow.edges)

          // Set the current workflow name
          setCurrentWorkflowName(workflow.name)

          // Reset the file input
          if (event.target) event.target.value = ""

          alert(`Workflow "${workflow.name}" loaded successfully.`)
        } catch (error) {
          console.error("Error loading workflow file:", error)
          alert("There was an error loading the workflow file. Please ensure it is a valid workflow file.")
        }
      }
      reader.readAsText(file)
    },
    [savedWorkflows, setNodes, setEdges, setSavedWorkflows],
  )

  const handleSelectWorkflow = useCallback(
    (workflowId: string) => {
      const workflow = savedWorkflows.find((w) => w.id === workflowId)
      if (workflow) {
        setNodes(workflow.nodes)
        setEdges(workflow.edges)
        setCurrentWorkflowName(workflow.name)
      }
    },
    [savedWorkflows, setNodes, setEdges],
  )

  const handleViewWorkflowInfo = useCallback(
    (workflowId: string) => {
      let workflow
      if (workflowId === "default") {
        // Show info for default workflow
        workflow = {
          id: "default",
          name: "File Conversion",
          createdAt: "2025-04-01T00:00:00.000Z",
          nodes: [],
          edges: [],
          stats: {
            executionTime: 1.3,
            recordsProcessed: 1250,
            successRate: 98.2,
          },
        }
      } else {
        workflow = savedWorkflows.find((w) => w.id === workflowId)
        if (!workflow) return
      }

      setSelectedWorkflow(workflow)
      setShowWorkflowInfo(true)
    },
    [savedWorkflows, setShowWorkflowInfo, setSelectedWorkflow],
  )

  // Function to execute the update DAG API call (second phase)
  const executeUpdateDag = async () => {
    setExecutionPhase(2)
    setCurrentStep("updating dag")

    try {
      const dagId = getDagId()
      const configId = getConfigId()

      if (!dagId) {
        throw new Error("No DAG ID found. Please create a workflow first.")
      }

      if (!configId) {
        throw new Error("No config ID found. Please execute the workflow first.")
      }

      // Create the request body for updating the DAG
      const requestBody = {
        name: currentWorkflowName || "File Conversion Workflow",
        schedule: "* * * * *",
        dag_sequence: [
          { id: "node_1", type: "start", config_id: configId, next: ["file_node_1"] },
          { id: "file_node_1", type: "file_conversion", config_id: configId, next: ["node_2"] },
          { id: "node_2", type: "end", config_id: configId, next: [] },
        ],
        active: true,
        active_dag_run: 1,
      }

      setApiRequestData(requestBody)
      setShowApiVisualizer(true)

      // Make the API call
      const response = await fetch(`http://localhost:3002/dags/${dagId}`, {
        method: "PUT",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      await response.json()

      // Update will be handled by handleApiVisualizerComplete
    } catch (error) {
      console.error("Error updating DAG:", error)
      alert(`Error updating DAG: ${error instanceof Error ? error.message : "Unknown error"}`)
      setIsExecuting(false)
      setCurrentNodeId(null)
      setCurrentStep("")
      setExecutionPhase(0)
    }
  }

  // Function to execute the trigger run API call (third phase)
  const executeTriggerRun = async () => {
    setExecutionPhase(3)
    setCurrentStep("triggering run")

    try {
      const dagId = getDagId()

      if (!dagId) {
        throw new Error("No DAG ID found. Please create a workflow first.")
      }

      // Create the request body for triggering the run
      const requestBody = {}

      setApiRequestData(requestBody)
      setShowApiVisualizer(true)

      // Make the API call
      const response = await fetch(`http://localhost:3002/dag_runs/${dagId}/trigger_run`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      await response.json()

      // Completion will be handled by handleApiVisualizerComplete
    } catch (error) {
      console.error("Error triggering DAG run:", error)
      alert(`Error triggering DAG run: ${error instanceof Error ? error.message : "Unknown error"}`)
      setIsExecuting(false)
      setCurrentNodeId(null)
      setCurrentStep("")
      setExecutionPhase(0)
    }
  }

  const executeWorkflow = useCallback(async () => {
    setIsExecuting(true)
    setExecutionPhase(1) // Start with phase 1

    try {
      // Find start node and connected nodes
      const startNode = nodes.find((node) => node.id === "start")
      if (!startNode) {
        throw new Error("Start node not found. Please ensure your workflow has a start node.")
      }

      // Find all edges from the start node
      const connectedEdges = edges.filter((edge) => edge.source === startNode.id)
      if (connectedEdges.length === 0) {
        throw new Error("No connections from start node. Please connect your start node to a processing node.")
      }

      // Get the workflow nodes in order
      const workflowNodes: Node[] = []
      let currentNodeId = connectedEdges[0].target

      while (currentNodeId && currentNodeId !== "end") {
        const currentNode = nodes.find((node) => node.id === currentNodeId)
        if (!currentNode) {
          console.warn(`Node with ID ${currentNodeId} not found. Stopping execution chain.`)
          break
        }

        workflowNodes.push(currentNode)

        const nextEdge = edges.find((edge) => edge.source === currentNodeId)
        if (!nextEdge) {
          console.warn(`No outgoing connection from node ${currentNodeId}. Stopping execution chain.`)
          break
        }

        currentNodeId = nextEdge.target
      }

      if (workflowNodes.length === 0) {
        throw new Error("No processing nodes found in the workflow. Please add nodes to your workflow.")
      }

      console.log(`Executing workflow with ${workflowNodes.length} nodes`)

      // Check if this is a File Conversion workflow
      const isFileConversionWorkflow = workflowNodes.some(
        (node) =>
          node.data?.type === "readFileNode" || node.data?.type === "filterNode" || node.data?.type === "writeFileNode",
      )

      if (isFileConversionWorkflow) {
        // Collect data from all nodes
        let inputData = {}
        let filterData = {}
        let outputData = {}

        // Process each node to collect its configuration
        for (const node of workflowNodes) {
          if (node.data?.type === "readFileNode") {
            const formData = node.data.formData || {}
            inputData = {
              provider: formData.provider || "local",
              format: formData.format || "csv",
              path: formData.path || "/app/mock_data/20250408_215503_test_records_2000.csv",
              options: {
                rowTag: "Record",
                rootTag: "Records",
              },
              schema: {
                fields: [
                  { name: "Id", type: "string", nullable: false },
                  { name: "Name", type: "string", nullable: false },
                  { name: "AccountNumber", type: "string", nullable: false },
                  { name: "Site", type: "string", nullable: true },
                  { name: "Type", type: "string", nullable: true },
                  { name: "Industry", type: "string", nullable: true },
                  { name: "AnnualRevenue", type: "long", nullable: true },
                  { name: "Rating", type: "string", nullable: true },
                  { name: "Phone", type: "string", nullable: true },
                  { name: "Fax", type: "string", nullable: true },
                  { name: "Website", type: "string", nullable: true },
                  { name: "TickerSymbol", type: "string", nullable: true },
                  { name: "Ownership", type: "string", nullable: true },
                  { name: "NumberOfEmployees", type: "integer", nullable: true },
                ],
              },
            }
          } else if (node.data?.type === "filterNode") {
            // Use the filter criteria from the node's data if available
            if (node.data.result?.filterCriteria) {
              filterData = node.data.result.filterCriteria
            } else {
              // Otherwise, build it from the form data
              const formData = node.data.formData || {}
              const conditions = []

              if (formData.revenueFilter) {
                conditions.push({
                  field: "AnnualRevenue",
                  operation: "gt",
                  value: formData.revenueValue || 1000000,
                })
              }

              if (formData.industryFilter && (formData.technologyFilter || formData.healthcareFilter)) {
                const industryConditions = []

                if (formData.technologyFilter) {
                  industryConditions.push({
                    field: "Industry",
                    operation: "eq",
                    value: "Technology",
                  })
                }

                if (formData.healthcareFilter) {
                  industryConditions.push({
                    field: "Industry",
                    operation: "eq",
                    value: "Healthcare",
                  })
                }

                if (industryConditions.length > 0) {
                  conditions.push({
                    operator: formData.industryOperator || "OR",
                    conditions: industryConditions,
                  })
                }
              }

              filterData = {
                operator: formData.mainOperator || "AND",
                conditions: conditions,
              }
            }
          } else if (node.data?.type === "writeFileNode") {
            const formData = node.data.formData || {}
            outputData = {
              provider: formData.provider || "local",
              format: formData.format || "json",
              path: formData.path || "/app/mock_data/output/2000_test_records_json",
              mode: "overwrite",
              options: {},
            }
          }
        }

        // Get the current DAG ID
        const dagId = getDagId()

        if (!dagId) {
          throw new Error("No DAG ID found. Please create a workflow first.")
        }

        // Create the request body
        const requestBody = {
          input: inputData,
          filter: filterData,
          output: outputData,
          spark_config: {
            driver_cores: 1,
            driver_memory: "512m",
            executor_instances: 1,
            executor_cores: 1,
            executor_memory: "512m",
          },
          dag_id: dagId,
        }

        // Make the API call
        setCurrentStep("making api call")
        setApiRequestData(requestBody)
        setShowApiVisualizer(true)

        try {
          const response = await fetch("http://localhost:3002/clients/1/file_conversion_configs/", {
            method: "POST",
            headers: {
              accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          })

          if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()

          // Store the config ID for future use
          if (result && result.id) {
            setConfigId(result.id)
          }

          // Update all nodes with success
          setNodes((nds) =>
            nds.map((n) => {
              if (workflowNodes.some((wn) => wn.id === n.id)) {
                return {
                  ...n,
                  data: {
                    ...n.data,
                    executed: true,
                    outputData: result,
                    error: null,
                  },
                }
              }
              return n
            }),
          )

          // The next steps will be handled by handleApiVisualizerComplete
        } catch (error) {
          console.error("Error creating file conversion config:", error)
          throw error
        }

        return
      }

      // For non-file conversion workflows, execute each node in sequence
      for (let i = 0; i < workflowNodes.length; i++) {
        const node = workflowNodes[i]
        const nodeProgress = Math.round(((i + 1) / workflowNodes.length) * 100)

        console.log(
          `Executing node ${i + 1}/${workflowNodes.length}: ${node.data?.label || node.id} (${nodeProgress}% complete)`,
        )
        setCurrentNodeId(node.id)

        try {
          // Step 1: Getting properties
          setCurrentStep("getting properties")
          await new Promise((resolve) => setTimeout(resolve, 1000))

          // Step 2: Preparing request
          setCurrentStep("preparing request")
          await new Promise((resolve) => setTimeout(resolve, 1000))

          // Step 3: Making API call
          setCurrentStep("making api call")
          await new Promise((resolve) => setTimeout(resolve, 1500))

          // Step 4: Processing response
          setCurrentStep("processing response")

          // Make real API calls based on node type
          let outputData = null

          if (node.data.type === "readFileNode") {
            try {
              // Make a real API call to get data
              const response = await fetch("http://localhost:3002/files", {
                method: "GET",
                headers: {
                  accept: "application/json",
                },
              })

              if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`)
              }

              const data = await response.json()
              outputData = {
                success: true,
                records: data,
                metadata: {
                  source: node.data.formData?.source || "unknown",
                  format: node.data.formData?.format || "json",
                  recordCount: Array.isArray(data) ? data.length : 1,
                  timestamp: new Date().toISOString(),
                },
              }
            } catch (error) {
              throw new Error(`Error reading file: ${error instanceof Error ? error.message : "Unknown error"}`)
            }
          } else if (node.data.type === "filterNode") {
            // Get input data from previous node
            const inputData = node.data.inputData

            if (!inputData || !inputData.records) {
              throw new Error(
                `No input data available for filter node ${node.id}. Please ensure previous nodes are executed correctly.`,
              )
            }

            try {
              // Apply filter based on node configuration
              const filterCriteria = node.data.formData?.filterCriteria || {}

              // This would ideally call your backend filter API
              // For now, we'll do basic filtering on the client
              const filteredRecords = inputData.records.filter((record: any) => {
                // Apply basic filtering based on criteria
                if (filterCriteria.field && filterCriteria.value) {
                  if (filterCriteria.operation === "eq") {
                    return record[filterCriteria.field] === filterCriteria.value
                  } else if (filterCriteria.operation === "gt") {
                    return record[filterCriteria.field] > filterCriteria.value
                  } else if (filterCriteria.operation === "lt") {
                    return record[filterCriteria.field] < filterCriteria.value
                  }
                }
                return true
              })

              outputData = {
                success: true,
                records: filteredRecords,
                metadata: {
                  inputRecordCount: inputData.records.length,
                  outputRecordCount: filteredRecords.length,
                  filterCriteria: filterCriteria,
                  timestamp: new Date().toISOString(),
                },
              }
            } catch (error) {
              throw new Error(`Error filtering data: ${error instanceof Error ? error.message : "Unknown error"}`)
            }
          } else if (node.data.type === "writeFileNode") {
            // Get input data from previous node
            const inputData = node.data.inputData

            if (!inputData || !inputData.records) {
              throw new Error(
                `No input data available for write file node ${node.id}. Please ensure previous nodes are executed correctly.`,
              )
            }

            try {
              // Make a real API call to write data
              const response = await fetch("http://localhost:3002/files", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  accept: "application/json",
                },
                body: JSON.stringify({
                  data: inputData.records,
                  destination: node.data.formData?.destination || "output",
                  format: node.data.formData?.format || "json",
                }),
              })

              if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`)
              }

              const result = await response.json()

              outputData = {
                success: true,
                message: "Data successfully written to destination",
                metadata: {
                  destination: node.data.formData?.destination || "output",
                  format: node.data.formData?.format || "json",
                  recordCount: inputData.records.length,
                  timestamp: new Date().toISOString(),
                  result: result,
                },
              }
            } catch (error) {
              throw new Error(`Error writing file: ${error instanceof Error ? error.message : "Unknown error"}`)
            }
          } else if (node.type === "uploadFile") {
            // For upload file nodes, the upload is handled by the node component itself
            // We just need to check if it has output data
            if (node.data.outputData) {
              outputData = node.data.outputData
            } else {
              throw new Error("File upload not completed. Please upload a file first.")
            }
          } else {
            // Generic output for other node types
            outputData = {
              success: true,
              message: `Node ${node.data?.label || node.id} executed successfully`,
              timestamp: new Date().toISOString(),
            }
          }

          // Update node with execution results
          setNodes((nds) =>
            nds.map((n) =>
              n.id === node.id
                ? {
                    ...n,
                    data: {
                      ...n.data,
                      executed: true,
                      outputData,
                      error: null,
                    },
                  }
                : n,
            ),
          )

          // Find next node and pass data
          const nextEdge = edges.find((edge) => edge.source === node.id)
          if (nextEdge) {
            const nextNodeId = nextEdge.target
            if (nextNodeId !== "end") {
              setNodes((nds) =>
                nds.map((n) => (n.id === nextNodeId ? { ...n, data: { ...n.data, inputData: outputData } } : n)),
              )
            }
          }
        } catch (error) {
          console.error(`Error executing node ${node.id}:`, error)

          // Update node with error
          setNodes((nds) =>
            nds.map((n) =>
              n.id === node.id
                ? {
                    ...n,
                    data: {
                      ...n.data,
                      executed: true,
                      error: error instanceof Error ? error.message : "Unknown error",
                    },
                  }
                : n,
            ),
          )

          // Stop execution on error
          break
        }

        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      console.log("Workflow execution completed")
      setIsExecuting(false)
      setCurrentNodeId(null)
      setCurrentStep("")
      setExecutionPhase(0)
    } catch (error) {
      console.error("Workflow execution error:", error)
      alert(error instanceof Error ? error.message : "An error occurred during workflow execution")
      setIsExecuting(false)
      setCurrentNodeId(null)
      setCurrentStep("")
      setExecutionPhase(0)
    }
  }, [nodes, edges, setNodes, executionPhase])

  const stopExecution = useCallback(() => {
    setIsExecuting(false)
    setCurrentNodeId(null)
    setCurrentStep("")
    setExecutionPhase(0)
    alert("Workflow execution stopped by user")
  }, [])

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return <LoginPage onLogin={setIsAuthenticated} />
  }

  return (
    <div className="flex w-full h-screen">
      <CollapsibleSidebar
        onAddNode={handleAddNode}
        onAddTemplate={handleAddTemplate}
        savedWorkflows={savedWorkflows}
        onSelectWorkflow={handleSelectWorkflow}
        onViewWorkflowInfo={handleViewWorkflowInfo}
        onShowLogs={() => setShowLogs(true)}
      />

      {showLogs ? (
        <LogsDashboard className="flex-1" />
      ) : (
        <div ref={reactFlowWrapper} className="flex-1 h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onNodeDoubleClick={onNodeDoubleClick}
            nodeTypes={nodeTypes}
            className="bg-gray-50"
            deleteKeyCode={["Delete", "Backspace"]}
            defaultViewport={{ x: 0, y: 0, zoom: 0.75 }}
            minZoom={0.5}
            maxZoom={1.5}
            fitView
          >
            <Background color="#aaa" gap={16} />
            <Controls />
            <MiniMap
              nodeStrokeColor={(n) => {
                if (n.type === "start") return "#22c55e"
                if (n.type === "end") return "#ef4444"
                return "#ddd"
              }}
              nodeColor={(n) => {
                if (n.type === "start") return "#22c55e"
                if (n.type === "end") return "#ef4444"
                return "#ffffff"
              }}
            />

            <Panel
              position="top"
              className="flex justify-between items-center w-full bg-white border-b border-gray-200 p-3"
            >
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-gray-900">Mi-Ware Workflow System</h1>
                <Button variant="outline" size="sm" className="ml-4" onClick={() => setShowCreateDagModal(true)}>
                  <Plus size={16} className="mr-1" /> New Workflow
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  id="load-workflow"
                  accept=".json"
                  className="hidden"
                  onChange={handleLoadWorkflowFromFile}
                />
                <label htmlFor="load-workflow">
                  <Button
                    variant="outline"
                    className="cursor-pointer bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
                    as="div"
                  >
                    <Upload size={18} className="mr-1" /> Load
                  </Button>
                </label>
                <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={() => setShowSaveDialog(true)}>
                  <Save size={18} className="mr-1" /> Save
                </Button>
                {isExecuting ? (
                  <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={stopExecution}>
                    <StopCircle size={18} className="mr-1" /> Stop
                  </Button>
                ) : (
                  <Button
                    className="bg-green-500 hover:bg-green-600 text-white"
                    onClick={executeWorkflow}
                    disabled={isExecuting}
                  >
                    <Play size={18} className="mr-1" /> Run
                  </Button>
                )}
              </div>
            </Panel>
          </ReactFlow>

          {/* Properties Modal */}
          <Modal
            isOpen={!!selectedNode}
            onClose={() => setSelectedNode(null)}
            title={selectedNode?.data?.label || "Node Properties"}
          >
            {selectedNode && selectedNode.data?.category === "demo-file-conversion" && (
              <DemoFileConversionProperties
                node={selectedNode}
                onUpdateNode={handleUpdateNode}
                isExecuting={isExecuting}
              />
            )}
          </Modal>

          {/* Create DAG Modal */}
          <CreateDagModal
            isOpen={showCreateDagModal}
            onClose={() => setShowCreateDagModal(false)}
            onCreateDag={handleCreateDag}
          />

          {/* Workflow Progress */}
          <WorkflowProgress
            isExecuting={isExecuting}
            nodes={nodes}
            currentNodeId={currentNodeId}
            currentStep={currentStep}
            onComplete={() => {}}
            onAllNodesProcessed={handleAllNodesProcessed}
          />

          {/* API Visualizer */}
          <ApiVisualizer
            isVisible={showApiVisualizer}
            requestData={apiRequestData}
            onComplete={handleApiVisualizerComplete}
          />

          {/* Save Workflow Dialog */}
          <SaveWorkflowDialog
            isOpen={showSaveDialog}
            onClose={() => setShowSaveDialog(false)}
            onSave={handleSaveWorkflow}
          />

          {/* Workflow Info Modal */}
          {selectedWorkflow && (
            <WorkflowInfoModal
              isOpen={showWorkflowInfo}
              onClose={() => setShowWorkflowInfo(false)}
              workflow={selectedWorkflow}
            />
          )}

          {/* API Monitor */}
          {showApiMonitor && <ApiMonitor />}
        </div>
      )}
    </div>
  )
}

// Export the wrapped component as default
export default FlowBuilderWithProvider
