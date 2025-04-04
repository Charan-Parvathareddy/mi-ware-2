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
import { Play, Save, Upload } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { StartNode } from "./components/nodes/StartNode"
import { EndNode } from "./components/nodes/EndNode"
import { CustomNode } from "./components/nodes/CustomNode"
import { CollapsibleSidebar } from "./components/sidebar/CollapsibleSidebar"
import { isValidConnection } from "./utils/connection-utils"
import { DemoFileConversionProperties } from "./components/demo-file-conversion/DemoFileConversionProperties"
import { WorkflowProgress } from "./components/demo-file-conversion/WorkflowProgress"
import { ApiVisualizer } from "./components/demo-file-conversion/ApiVisualizer"
import { SaveWorkflowDialog } from "./components/demo-file-conversion/SaveWorkflowDialog"
import { WorkflowInfoModal } from "./components/demo-file-conversion/WorkflowInfoModal"
import { LogsDashboard } from "./components/logs/LogsDashboard"
import { getTemplate } from "./components/demo-file-conversion/template-manager"

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
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<string>("")
  const [showApiVisualizer, setShowApiVisualizer] = useState(false)
  const [apiRequestData, setApiRequestData] = useState<any>(null)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [savedWorkflows, setSavedWorkflows] = useState<Workflow[]>([])
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null)
  const [showWorkflowInfo, setShowWorkflowInfo] = useState(false)
  const [showLogs, setShowLogs] = useState(false)
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const { project, getNodes, getEdges } = useReactFlow()

  useEffect(() => {
    // Load the file conversion workflow template by default
    const template = getTemplate("fileConversionWorkflow")
    if (template) {
      setNodes(template.nodes)
      setEdges(template.edges)
    }

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
  }, [setNodes, setEdges])

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
            type: "custom",
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
        type: "custom",
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
    setIsExecuting(false)
    setCurrentNodeId(null)
    setCurrentStep("")
  }, [])

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

  const handleSaveWorkflow = useCallback(
    (name: string) => {
      const currentNodes = getNodes()
      const currentEdges = getEdges()

      const newWorkflow: Workflow = {
        id: `workflow-${Date.now()}`,
        name,
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
        saveAs(blob, `${name.replace(/\s+/g, "-").toLowerCase()}.json`)

        // Show success message
        alert(`Workflow "${name}" saved successfully. The file has been downloaded to your computer.`)
      } catch (error) {
        console.error("Error saving workflow file:", error)
        alert("There was an error saving the workflow file. Please try again.")
      }
    },
    [getNodes, getEdges, savedWorkflows],
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
      }
    },
    [savedWorkflows, setNodes, setEdges],
  )

  const handleViewWorkflowInfo = useCallback(
    (workflowId: string) => {
      if (workflowId === "default") {
        // Show info for default workflow
        setSelectedWorkflow({
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
        })
      } else {
        const workflow = savedWorkflows.find((w) => w.id === workflowId)
        if (workflow) {
          setSelectedWorkflow(workflow)
        }
      }

      setShowWorkflowInfo(true)
    },
    [savedWorkflows],
  )

  const executeWorkflow = useCallback(async () => {
    setIsExecuting(true)

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

      // Execute each node in sequence with progress updates
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

          // Generate mock output data based on node type
          let outputData = null

          if (node.data.type === "readFileNode") {
            outputData = {
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
                source: "/app/mock_data/test_records_2000.xml",
                format: "xml",
                recordCount: 5,
                timestamp: new Date().toISOString(),
              },
            }
          } else if (node.data.type === "filterNode") {
            // Get input data from previous node
            const inputData = node.data.inputData

            if (!inputData || !inputData.records) {
              throw new Error(
                `No input data available for filter node ${node.id}. Please ensure previous nodes are executed correctly.`,
              )
            }

            // Apply filter: AnnualRevenue > 1000000 AND (Industry = 'Technology' OR Industry = 'Healthcare')
            const filteredRecords = inputData.records.filter(
              (record: any) =>
                record.AnnualRevenue > 1000000 &&
                (record.Industry === "Technology" || record.Industry === "Healthcare"),
            )

            outputData = {
              success: true,
              records: filteredRecords,
              metadata: {
                inputRecordCount: inputData.records.length,
                outputRecordCount: filteredRecords.length,
                filterCriteria: {
                  operator: "AND",
                  conditions: [
                    { field: "AnnualRevenue", operation: "gt", value: 1000000 },
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
          } else if (node.data.type === "writeFileNode") {
            // Get input data from previous node
            const inputData = node.data.inputData

            if (!inputData || !inputData.records) {
              throw new Error(
                `No input data available for write file node ${node.id}. Please ensure previous nodes are executed correctly.`,
              )
            }

            outputData = {
              success: true,
              message: "Data successfully written to destination",
              metadata: {
                destination: "kmk-iscs/output/test_records_json",
                format: "json",
                recordCount: inputData.records.length,
                timestamp: new Date().toISOString(),
              },
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
    } catch (error) {
      console.error("Workflow execution error:", error)
      alert(error instanceof Error ? error.message : "An error occurred during workflow execution")
    } finally {
      // Don't set isExecuting to false here, as we want to show the API visualizer first
      // The API visualizer will call handleApiVisualizerComplete which will set isExecuting to false
    }
  }, [nodes, edges, setNodes])

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

            <Panel position="top" className="flex justify-between items-center w-full bg-white border-b p-2">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">File Conversion Workflow</h1>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="load-workflow"
                  accept=".json"
                  className="hidden"
                  onChange={handleLoadWorkflowFromFile}
                />
                <label htmlFor="load-workflow">
                  <Button variant="outline" className="cursor-pointer" as="div">
                    <Upload size={18} className="mr-1" /> Load
                  </Button>
                </label>
                <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={() => setShowSaveDialog(true)}>
                  <Save size={18} className="mr-1" /> Save
                </Button>
                <Button
                  className="bg-green-500 hover:bg-green-600 text-white"
                  onClick={executeWorkflow}
                  disabled={isExecuting}
                >
                  <Play size={18} className="mr-1" /> {isExecuting ? "Running..." : "Run"}
                </Button>
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
        </div>
      )}
    </div>
  )
}

// Export the wrapped component as default
export default FlowBuilderWithProvider

