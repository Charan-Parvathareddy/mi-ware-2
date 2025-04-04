"use client"

import { useState, useEffect } from "react"
import { X, ExternalLink, Edit, Check } from "lucide-react"
import type { Node } from "reactflow"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable } from "./components/data-table/DataTable"
import { ConfigTable } from "./components/data-table/ConfigTable"
import { apiCodeSnippets } from "./utils/api-code-snippets"

interface PropertiesProps {
  node: Node | null
  onClose: () => void
}

export function Properties({ node, onClose }: PropertiesProps) {
  const [activeTab, setActiveTab] = useState<"parameters" | "settings">("parameters")
  const [codeValue, setCodeValue] = useState<string>("")
  const [runOption, setRunOption] = useState<string>("Run Once for All Items")
  const [alwaysOutputData, setAlwaysOutputData] = useState(false)
  const [executeOnce, setExecuteOnce] = useState(false)
  const [retryOnFail, setRetryOnFail] = useState(false)
  const [onError, setOnError] = useState("Stop Workflow")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (node) {
      // Initialize with default code based on node type
      let defaultCode = `return [
{
  "Name": "Flour",
},
{
  "Name": "Eggs",
},
{
  "Name": "Milk",
},
{
  "Name": "Sugar",
}
]`

      // Set code based on node type
      if (node.data?.type === "onSchedule") {
        defaultCode = apiCodeSnippets.onSchedule
      } else if (node.data?.type === "readFile") {
        defaultCode = apiCodeSnippets.readFile
      } else if (node.data?.type === "writeFile") {
        defaultCode = apiCodeSnippets.writeFile
      } else if (node.data?.type === "createConfig") {
        defaultCode = apiCodeSnippets.createConfig
      } else if (node.data?.type === "listConfigs") {
        defaultCode = apiCodeSnippets.listConfigs
      } else if (node.data?.type === "getConfig") {
        defaultCode = apiCodeSnippets.getConfig
      } else if (node.data?.type === "updateConfig") {
        defaultCode = apiCodeSnippets.updateConfig
      } else if (node.data?.type === "deleteConfig") {
        defaultCode = apiCodeSnippets.deleteConfig
      }

      setCodeValue(defaultCode)
    }
  }, [node])

  if (!node) return null

  const nodeTitle = node.data?.label || "Node Properties"
  const nodeType = node.data?.type || ""

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="text-orange-500">{"{}"}</div>
            <h2 className="text-lg font-medium">
              {nodeType && <span className="text-orange-500">A. </span>}
              {nodeTitle} {nodeType && <span className="text-gray-500">Needed</span>}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="bg-orange-500 text-white px-3 py-1 rounded-md text-sm font-medium">Test step</button>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === "parameters"
                ? "text-orange-500 border-b-2 border-orange-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("parameters")}
          >
            Parameters
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === "settings"
                ? "text-orange-500 border-b-2 border-orange-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("settings")}
          >
            Settings
          </button>
          <div className="flex-grow"></div>
          <button className="px-6 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1">
            Docs <ExternalLink size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* INPUT Section */}
          <div className="w-1/4 border-r overflow-auto p-4 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-500 mb-4">INPUT</h3>
            {node?.data?.inputData ? (
              <div className="max-h-[300px] overflow-auto">
                {node.data.type === "readFile" && node.data.inputData.records ? (
                  <div className="text-xs">
                    <div className="bg-green-100 p-2 rounded mb-2 text-green-800">
                      <Check className="inline-block w-4 h-4 mr-1" />
                      Received {node.data.inputData.records.length} records
                    </div>
                    <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-[200px]">
                      {JSON.stringify(node.data.inputData, null, 2)}
                    </pre>
                  </div>
                ) : node.data.type === "writeFile" && node.data.inputData.records ? (
                  <div className="text-xs">
                    <div className="bg-green-100 p-2 rounded mb-2 text-green-800">
                      <Check className="inline-block w-4 h-4 mr-1" />
                      Received {node.data.inputData.records.length} records
                    </div>
                    <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-[200px]">
                      {JSON.stringify(node.data.inputData, null, 2)}
                    </pre>
                  </div>
                ) : node.data.type === "getConfig" ||
                  node.data.type === "updateConfig" ||
                  node.data.type === "deleteConfig" ? (
                  <div className="text-xs">
                    <div className="bg-green-100 p-2 rounded mb-2 text-green-800">
                      <Check className="inline-block w-4 h-4 mr-1" />
                      Config ID: {node.data.inputData.id || node.data.inputData.config_id || 1}
                    </div>
                    <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-[200px]">
                      {JSON.stringify(node.data.inputData, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-[250px]">
                    {JSON.stringify(node.data.inputData, null, 2)}
                  </pre>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px]">
                <p className="text-gray-500 text-sm">No input data yet</p>
                <button className="mt-4 px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm">
                  Execute previous nodes
                </button>
                <p className="text-xs text-gray-400 mt-2 text-center">(From the earliest node that needs it)</p>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto p-4">
            {activeTab === "parameters" && (
              <div className="space-y-4">
                <div>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={runOption}
                    onChange={(e) => setRunOption(e.target.value)}
                  >
                    <option>Run Once for All Items</option>
                    <option>Run Once for Each Item</option>
                  </select>
                </div>

                <div>
                  <div className="mb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">JavaScript</span>
                      <div className="flex gap-2">
                        <button className="text-sm text-orange-500 font-medium">Code</button>
                        <button className="text-sm text-gray-500 font-medium flex items-center gap-1">
                          Ask AI <span className="text-xs">✨</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-gray-50 p-2 border-b flex items-center">
                      <div className="flex-grow"></div>
                    </div>
                    <div className="relative">
                      <pre className="p-4 text-sm font-mono bg-white overflow-auto max-h-[300px]">
                        <div className="flex">
                          <div className="text-gray-400 select-none pr-4 text-right">
                            {codeValue.split("\n").map((_, i) => (
                              <div key={i}>{i + 1}</div>
                            ))}
                          </div>
                          <div className="flex-grow">
                            <code className="text-blue-600">{codeValue}</code>
                          </div>
                        </div>
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-md p-3 text-sm text-orange-800">
                  Type $ for a list of <span className="text-orange-500">special vars/methods</span>. Debug by using{" "}
                  <code className="bg-orange-100 px-1 rounded">console.log()</code> statements and viewing their output
                  in the browser console.
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Always Output Data</span>
                  <Switch checked={alwaysOutputData} onCheckedChange={setAlwaysOutputData} />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Execute Once</span>
                  <Switch checked={executeOnce} onCheckedChange={setExecuteOnce} />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Retry On Fail</span>
                  <Switch checked={retryOnFail} onCheckedChange={setRetryOnFail} />
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium">On Error</span>
                  <Select value={onError} onValueChange={setOnError}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select action on error" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Stop Workflow">Stop Workflow</SelectItem>
                      <SelectItem value="Continue">Continue</SelectItem>
                      <SelectItem value="Skip Node">Skip Node</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium">Notes</span>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this node..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* OUTPUT Section */}
          <div className="w-1/4 border-l overflow-auto p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-500">OUTPUT</h3>
              <button className="text-gray-500 hover:text-gray-700">
                <Edit size={16} />
              </button>
            </div>
            {node?.data?.outputData ? (
              <div className="max-h-[300px] overflow-auto">
                {node.data.type === "readFile" && node.data.outputData.records ? (
                  <DataTable records={node.data.outputData.records.slice(0, 5)} />
                ) : node.data.type === "writeFile" && node.data.outputData.success ? (
                  <div className="bg-green-100 p-4 rounded text-green-800 flex items-center">
                    <Check className="w-5 h-5 mr-2" />
                    {node.data.outputData.message}
                  </div>
                ) : node.data.type === "listConfigs" && node.data.outputData.items ? (
                  <ConfigTable configs={node.data.outputData.items.slice(0, 5)} />
                ) : node.data.type === "createConfig" && node.data.outputData.id ? (
                  <div className="bg-green-100 p-4 rounded text-green-800">
                    <div className="flex items-center mb-2">
                      <Check className="w-5 h-5 mr-2" />
                      Config created successfully
                    </div>
                    <div className="text-sm">
                      <strong>ID:</strong> {node.data.outputData.id}
                    </div>
                  </div>
                ) : node.data.type === "getConfig" && node.data.outputData.id ? (
                  <div>
                    <div className="bg-green-100 p-2 rounded mb-2 text-green-800">
                      <Check className="inline-block w-4 h-4 mr-1" />
                      Config retrieved successfully
                    </div>
                    <div className="bg-gray-100 p-3 rounded text-sm">
                      <div>
                        <strong>ID:</strong> {node.data.outputData.id}
                      </div>
                      <div>
                        <strong>Source:</strong> {node.data.outputData.input?.source_type}/
                        {node.data.outputData.input?.bucket}
                      </div>
                      <div>
                        <strong>Destination:</strong> {node.data.outputData.output?.destination_type}/
                        {node.data.outputData.output?.bucket}
                      </div>
                    </div>
                  </div>
                ) : node.data.type === "updateConfig" && node.data.outputData.id ? (
                  <div className="bg-green-100 p-4 rounded text-green-800">
                    <div className="flex items-center mb-2">
                      <Check className="w-5 h-5 mr-2" />
                      Config updated successfully
                    </div>
                    <div className="text-sm">
                      <strong>ID:</strong> {node.data.outputData.id}
                    </div>
                  </div>
                ) : node.data.type === "deleteConfig" ? (
                  <div className="bg-green-100 p-4 rounded text-green-800 flex items-center">
                    <Check className="w-5 h-5 mr-2" />
                    Config deleted successfully
                  </div>
                ) : (
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-[250px]">
                    {JSON.stringify(node.data.outputData, null, 2)}
                  </pre>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px]">
                <p className="text-gray-500 text-sm">Execute this node to view data</p>
                <p className="text-sm mt-2">
                  or <span className="text-orange-500">set mock data</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

