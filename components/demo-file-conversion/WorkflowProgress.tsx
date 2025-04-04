"use client"

import { useState, useEffect, useRef } from "react"
import { Check, Loader2, AlertCircle, X, Laptop, ExternalLink, Code } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

interface WorkflowProgressProps {
  isExecuting: boolean
  nodes: any[]
  currentNodeId: string | null
  currentStep: string
  onComplete: () => void
  onAllNodesProcessed: (requestData: any) => void
}

export function WorkflowProgress({
  isExecuting,
  nodes,
  currentNodeId,
  currentStep,
  onComplete,
  onAllNodesProcessed,
}: WorkflowProgressProps) {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const [steps, setSteps] = useState<
    { id: string; label: string; status: "pending" | "processing" | "complete" | "error" }[]
  >([])
  const [requestData, setRequestData] = useState<any>({
    input: {},
    filter: {},
    output: {},
    spark_config: {},
  })
  const [executionComplete, setExecutionComplete] = useState(false)
  const [generatingSection, setGeneratingSection] = useState<string | null>(null)
  const [generatedContent, setGeneratedContent] = useState<Record<string, string[]>>({
    input: [],
    filter: [],
    output: [],
    spark_config: [],
    completion: []
  })
  
  // Use refs to track previous values and prevent unnecessary updates
  const prevNodeIdRef = useRef<string | null>(null)
  const prevStepRef = useRef<string>("")
  
  // Show modal when execution starts
  useEffect(() => {
    if (isExecuting) {
      setVisible(true)
      setExecutionComplete(false)
      setGeneratedContent({
        input: [],
        filter: [],
        output: [],
        spark_config: [],
        completion: []
      })
      setGeneratingSection(null)
      
      // Initialize steps based on nodes
      const workflowSteps = nodes
        .filter((node) => node.type === "custom" && node.data.category === "demo-file-conversion")
        .map((node) => ({
          id: node.id,
          label: node.data.label,
          status: "pending" as const,
        }))

      setSteps(workflowSteps)
      setProgress(0)
      prevNodeIdRef.current = null
      prevStepRef.current = ""
    }
  }, [isExecuting, nodes])

  // Handle node and step changes
  useEffect(() => {
    if (!isExecuting || !currentNodeId || !visible) return;
    
    // Skip update if nothing changed
    if (prevNodeIdRef.current === currentNodeId && prevStepRef.current === currentStep) {
      return;
    }
    
    // Update refs
    prevNodeIdRef.current = currentNodeId;
    prevStepRef.current = currentStep;
    
    // Update step status
    setSteps((prevSteps) =>
      prevSteps.map((step) => {
        if (step.id === currentNodeId) {
          return { ...step, status: "processing" }
        } else if (
          prevSteps.findIndex((s) => s.id === currentNodeId) > prevSteps.findIndex((s) => s.id === step.id)
        ) {
          return { ...step, status: "complete" }
        }
        return step
      }),
    );

    // Calculate progress
    const totalSteps = steps.length * 4 // 4 sub-steps per node
    const currentNodeIndex = steps.findIndex((step) => step.id === currentNodeId)
    const completedNodes = currentNodeIndex

    const subStepProgress = {
      "getting properties": 0.25,
      "preparing request": 0.5,
      "making api call": 0.75,
      "processing response": 1,
    }

    const currentSubStepProgress = subStepProgress[currentStep as keyof typeof subStepProgress] || 0
    const newProgress = ((completedNodes + currentSubStepProgress) / totalSteps) * 100

    setProgress(Math.min(newProgress, 99)) // Cap at 99% until complete

    // Update request data and simulate text generation
    if (currentStep === "processing response") {
      const node = nodes.find((n) => n.id === currentNodeId)
      if (node) {
        if (node.data.type === "readFileNode") {
          const formData = node.data.formData || {}
          const inputData = {
            provider: formData.provider || "local",
            format: formData.format || "xml",
            path: formData.path || "/app/mock_data/test_records_2000.xml",
            options: {
              rowTag: "Record",
              rootTag: "Records",
            },
            schema: {
              fields: [
                { name: "Id", type: "string", nullable: false },
                { name: "Name", type: "string", nullable: false },
                { name: "AccountNumber", type: "string", nullable: false },
              ],
            },
          }
          
          setRequestData((prev) => ({
            ...prev,
            input: inputData
          }))
          
          // Generate text for input section
          setGeneratingSection("input")
          simulateTextGeneration(
            JSON.stringify(inputData, null, 2), 
            "input", 
            () => setGeneratingSection(null)
          )
          
        } else if (node.data.type === "filterNode") {
          const formData = node.data.formData || {}
          const filterData = {
            operator: "AND",
            conditions: [
              { field: "AnnualRevenue", operation: "gt", value: formData.revenueValue || 1000000 },
              {
                operator: "OR",
                conditions: [
                  { field: "Industry", operation: "eq", value: "Technology" },
                  { field: "Industry", operation: "eq", value: "Healthcare" },
                ],
              },
            ],
          }
          
          setRequestData((prev) => ({
            ...prev,
            filter: filterData
          }))
          
          // Generate text for filter section
          setGeneratingSection("filter")
          simulateTextGeneration(
            JSON.stringify(filterData, null, 2), 
            "filter", 
            () => setGeneratingSection(null)
          )
          
        } else if (node.data.type === "writeFileNode") {
          const formData = node.data.formData || {}
          const outputData = {
            provider: formData.provider || "aws",
            format: formData.format || "json",
            path: formData.path || "kmk-iscs/output/test_records_json",
            mode: "overwrite",
            options: {},
          }
          
          const sparkConfigData = {
            driver_cores: 1,
            driver_memory: "512m",
            executor_instances: 1,
            executor_cores: 1,
            executor_memory: "512m",
          }
          
          setRequestData((prev) => ({
            ...prev,
            output: outputData,
            spark_config: sparkConfigData
          }))
          
          // Generate text for output section
          setGeneratingSection("output")
          simulateTextGeneration(
            JSON.stringify(outputData, null, 2), 
            "output", 
            () => {
              // After output is generated, start generating spark config
              setGeneratingSection("spark_config")
              simulateTextGeneration(
                JSON.stringify(sparkConfigData, null, 2), 
                "spark_config", 
                () => {
                  setGeneratingSection(null)
                  
                  // All nodes processed, prepare for API call
                  const allNodesComplete = steps.every((step) =>
                    step.id === currentNodeId ? step.status === "processing" : step.status === "complete"
                  )

                  if (allNodesComplete) {
                    // Complete execution
                    setTimeout(() => {
                      setProgress(100)
                      setExecutionComplete(true)
                      onAllNodesProcessed({
                        input: requestData.input,
                        filter: requestData.filter,
                        output: outputData,
                        spark_config: sparkConfigData
                      })
                      
                      // Mark all steps as complete
                      setSteps(prevSteps => 
                        prevSteps.map(step => ({ ...step, status: "complete" }))
                      )
                      
                      // Generate completion message
                      setGeneratingSection("completion")
                      simulateTextGeneration(
                        [
                          "// Execute API Call",
                          "async function executeWorkflow() {",
                          "  const response = await api.post('/workflow/execute', requestBody);",
                          "  return response.data;",
                          "}",
                          "// ✓ Workflow execution completed successfully"
                        ].join("\n"),
                        "completion",
                        () => setGeneratingSection(null)
                      )
                    }, 1000)
                  }
                }
              )
            }
          )
        }
      }
    }
  }, [isExecuting, currentNodeId, currentStep, nodes, onAllNodesProcessed, steps.length, visible])

  // Simulates text generation, like Claude typing out a response
  const simulateTextGeneration = (content: string, section: string, onComplete: () => void) => {
    // Split the content into lines
    const lines = content.split("\n")
    let currentIndex = 0
    
    // Function to add a line with delay
    const addLineWithDelay = () => {
      if (currentIndex < lines.length) {
        setGeneratedContent(prev => ({
          ...prev,
          [section]: [...prev[section], lines[currentIndex]]
        }))
        currentIndex++
        
        // Random delay between 50-150ms for more natural typing feel
        const delay = Math.floor(Math.random() * 100) + 50
        setTimeout(addLineWithDelay, delay)
      } else {
        // All lines added
        onComplete()
      }
    }
    
    // Start generating
    addLineWithDelay()
  }

  // Handle closing the modal
  const handleClose = () => {
    setVisible(false)
    if (executionComplete) {
      onComplete()
    }
  }

  // Get cursor blink style
  const getCursorStyle = (section: string | null) => {
    if (generatingSection === section) {
      return "inline-block w-2 h-4 bg-blue-400 animate-pulse ml-1"
    }
    return "hidden"
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-5xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <div className="flex items-center space-x-2">
            <Laptop className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Workflow Execution</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-full text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <div className="flex flex-grow overflow-hidden">
          {/* Left panel - Steps */}
          <div className="w-1/2 p-4 overflow-auto border-r">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Execution Progress</span>
                <span className="text-sm font-medium text-gray-700">{Math.round(progress)}%</span>
              </div>
              <Progress 
                value={progress} 
                className="h-2.5 bg-gray-100" 
                indicatorClassName={executionComplete ? "bg-green-500" : "bg-blue-500"}
              />
            </div>

            <div className="space-y-3">
              {steps.map((step, index) => (
                <div 
                  key={step.id} 
                  className={`flex items-start rounded-md p-3 border ${
                    step.status === "processing" 
                      ? "bg-blue-50 border-blue-200" 
                      : step.status === "complete" 
                        ? "bg-green-50 border-green-200" 
                        : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="w-8 h-8 flex items-center justify-center rounded-full mr-3 flex-shrink-0">
                    {step.status === "complete" ? (
                      <div className="bg-green-100 w-8 h-8 rounded-full flex items-center justify-center">
                        <Check className="w-5 h-5 text-green-600" />
                      </div>
                    ) : step.status === "processing" ? (
                      <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                      </div>
                    ) : step.status === "error" ? (
                      <div className="bg-red-100 w-8 h-8 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      </div>
                    ) : (
                      <div className="bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-500">{index + 1}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{step.label}</div>
                    {step.status === "processing" && (
                      <div className="text-sm text-blue-600 mt-1 flex items-center">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                        {currentStep === "getting properties" && "Retrieving node properties..."}
                        {currentStep === "preparing request" && "Preparing API request..."}
                        {currentStep === "making api call" && "Executing API call..."}
                        {currentStep === "processing response" && "Processing data response..."}
                      </div>
                    )}
                    {step.status === "complete" && (
                      <div className="text-sm text-green-600 mt-1 flex items-center">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                        Completed successfully
                      </div>
                    )}
                    {step.status === "error" && (
                      <div className="text-sm text-red-600 mt-1 flex items-center">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></div>
                        Failed to process
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel - API Request Builder with Claude-like generation */}
          <div className="w-1/2 p-4 overflow-auto bg-gray-50">
            <div className="flex items-center mb-4 text-lg font-medium text-gray-800">
              <Code className="h-5 w-5 mr-2 text-blue-600" />
              API Request Builder
            </div>
            
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="p-3 bg-gray-100 border-b flex items-center justify-between">
                <div className="font-medium text-gray-700">Request Configuration</div>
                <div className="flex space-x-2">
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                  <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                </div>
              </div>

              <div className="p-4 font-mono text-sm overflow-auto max-h-[400px] bg-slate-900 text-gray-100 rounded-b-lg">
                <div className="text-blue-400 mb-1">// API Request being constructed</div>
                <div className="text-pink-400">{"const requestBody = {"}</div>
                
                {/* Input Section */}
                <div className="pl-4">
                  <div className="text-amber-400 flex items-center">
                    {"input: {"}
                    <div className={getCursorStyle("input")}></div>
                  </div>
                  
                  {generatedContent.input.length > 0 && (
                    <div className="pl-4 text-gray-300">
                      {generatedContent.input.map((line, index) => (
                        <div key={`input-${index}`} className="whitespace-pre-wrap">
                          {line}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="text-amber-400">{"},"}</div>
                  
                  {/* Filter Section */}
                  <div className="text-amber-400 mt-2 flex items-center">
                    {"filter: {"}
                    <div className={getCursorStyle("filter")}></div>
                  </div>
                  
                  {generatedContent.filter.length > 0 && (
                    <div className="pl-4 text-gray-300">
                      {generatedContent.filter.map((line, index) => (
                        <div key={`filter-${index}`} className="whitespace-pre-wrap">
                          {line}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="text-amber-400">{"},"}</div>
                  
                  {/* Output Section */}
                  <div className="text-amber-400 mt-2 flex items-center">
                    {"output: {"}
                    <div className={getCursorStyle("output")}></div>
                  </div>
                  
                  {generatedContent.output.length > 0 && (
                    <div className="pl-4 text-gray-300">
                      {generatedContent.output.map((line, index) => (
                        <div key={`output-${index}`} className="whitespace-pre-wrap">
                          {line}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="text-amber-400">{"},"}</div>
                  
                  {/* Spark Config Section */}
                  <div className="text-amber-400 mt-2 flex items-center">
                    {"spark_config: {"}
                    <div className={getCursorStyle("spark_config")}></div>
                  </div>
                  
                  {generatedContent.spark_config.length > 0 && (
                    <div className="pl-4 text-gray-300">
                      {generatedContent.spark_config.map((line, index) => (
                        <div key={`spark-${index}`} className="whitespace-pre-wrap">
                          {line}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="text-amber-400">{"},"}</div>
                </div>
                
                <div className="text-pink-400">{"};"}</div>
                
                {/* API call simulation */}
                {generatedContent.completion.length > 0 && (
                  <div className="mt-4 border-t border-gray-700 pt-2 text-gray-300">
                    {generatedContent.completion.map((line, index) => (
                      <div 
                        key={`exec-${index}`} 
                        className={`whitespace-pre ${
                          typeof line === "string" && line.startsWith("//") ? "text-blue-400" :
                          typeof line === "string" && line.includes("function") ? "text-green-400" :
                          typeof line === "string" && line.includes("✓") ? "text-green-400" : ""
                        }`}
                        
                        
                      >
                        {line}
                      </div>
                    ))}
                    <div className={getCursorStyle("completion")}></div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Typing indicator during generation */}
            {generatingSection && (
              <div className="flex items-center space-x-1 mt-2 text-blue-600 text-sm">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Building request configuration...</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t flex justify-end items-center bg-gray-50">
          {executionComplete && (
            <div className="mr-auto text-green-600 font-medium flex items-center">
              <Check className="w-5 h-5 mr-1" />
              Workflow execution completed
            </div>
          )}
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClose}
            >
              Close
            </Button>
            <Button 
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!executionComplete}
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              View Results
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}