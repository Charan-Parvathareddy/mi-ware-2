"use client"

import { useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Activity, Server, FileText } from "lucide-react"

interface WorkflowInfoModalProps {
  isOpen: boolean
  onClose: () => void
  workflow: {
    id: string
    name: string
    createdAt: string
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
}

export function WorkflowInfoModal({ isOpen, onClose, workflow }: WorkflowInfoModalProps) {
  const [activeTab, setActiveTab] = useState("overview")

  // Generate sample data for the chart
  const generateChartData = () => {
    const dates = []
    const now = new Date()
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      dates.push(date.toISOString().split("T")[0])
    }

    return dates.map((date) => {
      const successRate = Math.floor(55 + Math.random() * 30)
      return {
        date,
        successRate,
        failureRate: 100 - successRate,
      }
    })
  }

  const chartData = generateChartData()

  // Generate sample execution history if not provided
  const executionHistory = workflow.executionHistory || [
    {
      date: "2025-04-03",
      executionTime: 1.2,
      recordsProcessed: 1250,
      successRate: 98.5,
    },
    {
      date: "2025-04-02",
      executionTime: 1.5,
      recordsProcessed: 1300,
      successRate: 97.2,
    },
    {
      date: "2025-04-01",
      executionTime: 1.3,
      recordsProcessed: 1100,
      successRate: 99.1,
    },
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Workflow: ${workflow.name}`} className="w-[800px]">
      <div className="p-4">
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="history">Execution History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="py-4">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Clock className="w-5 h-5 text-blue-500 mr-2" />
                  <h3 className="text-sm font-medium text-gray-700">Created</h3>
                </div>
                <p className="text-lg font-semibold">{new Date(workflow.createdAt).toLocaleDateString()}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Activity className="w-5 h-5 text-green-500 mr-2" />
                  <h3 className="text-sm font-medium text-gray-700">Success Rate</h3>
                </div>
                <p className="text-lg font-semibold">{workflow.stats?.successRate || 98.2}%</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Server className="w-5 h-5 text-purple-500 mr-2" />
                  <h3 className="text-sm font-medium text-gray-700">Last Run</h3>
                </div>
                <p className="text-lg font-semibold">{workflow.lastRun || "Today"}</p>
              </div>
            </div>

            <div className="bg-white border rounded-lg p-4">
              <h3 className="text-md font-medium mb-4">Success Rate Over Time</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="successRate" stroke="#10b981" name="% In favor" strokeWidth={2} />
                    <Line type="monotone" dataKey="failureRate" stroke="#d1d5db" name="% Opposed" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="py-4">
            <div className="bg-white border rounded-lg p-4 mb-4">
              <h3 className="text-md font-medium mb-4">Performance Metrics</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm text-gray-500 mb-1">Avg. Execution Time</h4>
                  <p className="text-xl font-semibold">{workflow.stats?.executionTime || 1.3}s</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm text-gray-500 mb-1">Records Processed</h4>
                  <p className="text-xl font-semibold">{workflow.stats?.recordsProcessed || 1250}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm text-gray-500 mb-1">Memory Usage</h4>
                  <p className="text-xl font-semibold">512 MB</p>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-lg p-4">
              <h3 className="text-md font-medium mb-4">Node Performance</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-1/4 font-medium">Read File</div>
                  <div className="w-3/4">
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: "15%" }}></div>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span>0.2s</span>
                      <span>15% of total time</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-1/4 font-medium">Filter</div>
                  <div className="w-3/4">
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: "65%" }}></div>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span>0.8s</span>
                      <span>65% of total time</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-1/4 font-medium">Write File</div>
                  <div className="w-3/4">
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: "20%" }}></div>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span>0.3s</span>
                      <span>20% of total time</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="py-4">
            <div className="bg-white border rounded-lg p-4">
              <h3 className="text-md font-medium mb-4">Execution History</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Execution Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Records Processed
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Success Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {executionHistory.map((execution, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{execution.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {execution.executionTime}s
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {execution.recordsProcessed}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{execution.successRate}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <Button variant="ghost" size="sm" className="text-blue-500">
                            <FileText className="w-4 h-4 mr-1" /> Logs
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Modal>
  )
}

