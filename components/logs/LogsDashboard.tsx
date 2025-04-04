"use client"

import { useState } from "react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { RefreshCw, Clock, Search, Download, Filter, Info, AlertCircle, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface LogsDashboardProps {
  className?: string
}

export function LogsDashboard({ className }: LogsDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  // Mock data for metrics
  const metricData = [
    { name: "00:00", value: 40 },
    { name: "02:00", value: 30 },
    { name: "04:00", value: 20 },
    { name: "06:00", value: 27 },
    { name: "08:00", value: 90 },
    { name: "10:00", value: 23 },
    { name: "12:00", value: 34 },
    { name: "14:00", value: 51 },
    { name: "16:00", value: 43 },
    { name: "18:00", value: 65 },
    { name: "20:00", value: 45 },
    { name: "22:00", value: 35 },
  ]

  const cpuData = [
    { name: "00:00", value: 40, avg: 35 },
    { name: "02:00", value: 30, avg: 32 },
    { name: "04:00", value: 20, avg: 25 },
    { name: "06:00", value: 27, avg: 30 },
    { name: "08:00", value: 90, avg: 60 },
    { name: "10:00", value: 23, avg: 30 },
    { name: "12:00", value: 34, avg: 35 },
    { name: "14:00", value: 51, avg: 45 },
    { name: "16:00", value: 43, avg: 40 },
    { name: "18:00", value: 65, avg: 55 },
    { name: "20:00", value: 45, avg: 42 },
    { name: "22:00", value: 35, avg: 38 },
  ]

  const memoryData = [
    { name: "00:00", value: 60, avg: 55 },
    { name: "02:00", value: 50, avg: 52 },
    { name: "04:00", value: 40, avg: 45 },
    { name: "06:00", value: 47, avg: 50 },
    { name: "08:00", value: 70, avg: 60 },
    { name: "10:00", value: 43, avg: 50 },
    { name: "12:00", value: 54, avg: 55 },
    { name: "14:00", value: 71, avg: 65 },
    { name: "16:00", value: 63, avg: 60 },
    { name: "18:00", value: 85, avg: 75 },
    { name: "20:00", value: 65, avg: 62 },
    { name: "22:00", value: 55, avg: 58 },
  ]

  const diskData = [
    { name: "00:00", value: 70, avg: 65 },
    { name: "02:00", value: 72, avg: 68 },
    { name: "04:00", value: 75, avg: 70 },
    { name: "06:00", value: 77, avg: 72 },
    { name: "08:00", value: 80, avg: 75 },
    { name: "10:00", value: 83, avg: 78 },
    { name: "12:00", value: 84, avg: 80 },
    { name: "14:00", value: 85, avg: 82 },
    { name: "16:00", value: 86, avg: 83 },
    { name: "18:00", value: 87, avg: 84 },
    { name: "20:00", value: 88, avg: 85 },
    { name: "22:00", value: 89, avg: 86 },
  ]

  const networkData = [
    { name: "00:00", in: 40, out: 20 },
    { name: "02:00", in: 30, out: 15 },
    { name: "04:00", in: 20, out: 10 },
    { name: "06:00", in: 27, out: 13 },
    { name: "08:00", in: 90, out: 45 },
    { name: "10:00", in: 23, out: 12 },
    { name: "12:00", in: 34, out: 17 },
    { name: "14:00", in: 51, out: 25 },
    { name: "16:00", in: 43, out: 22 },
    { name: "18:00", in: 65, out: 32 },
    { name: "20:00", in: 45, out: 23 },
    { name: "22:00", in: 35, out: 18 },
  ]

  const alarmData = [
    { name: "TargetTracking-table/prod-beta", metric: "ConsumedReadCapacityUnits", value: 54, threshold: 60 },
    { name: "TargetTracking-table/prod-beta", metric: "ConsumedReadCapacityUnits", value: 90, threshold: 100 },
    { name: "TargetTracking-table/prod-beta", metric: "ConsumedWriteCapacityUnits", value: 54, threshold: 60 },
    { name: "TargetTracking-table/prod-beta", metric: "ConsumedWriteCapacityUnits", value: 54, threshold: 60 },
  ]

  const pieData = [
    { name: "CPU", value: 45, color: "#10b981" },
    { name: "Memory", value: 30, color: "#3b82f6" },
    { name: "Disk", value: 15, color: "#f59e0b" },
    { name: "Network", value: 10, color: "#8b5cf6" },
  ]

  const multiLineData = [
    { name: "00:00", cpu: 40, memory: 60, disk: 70, network: 30 },
    { name: "02:00", cpu: 30, memory: 50, disk: 72, network: 25 },
    { name: "04:00", cpu: 20, memory: 40, disk: 75, network: 20 },
    { name: "06:00", cpu: 27, memory: 47, disk: 77, network: 22 },
    { name: "08:00", cpu: 90, memory: 70, disk: 80, network: 60 },
    { name: "10:00", cpu: 23, memory: 43, disk: 83, network: 18 },
    { name: "12:00", cpu: 34, memory: 54, disk: 84, network: 25 },
    { name: "14:00", cpu: 51, memory: 71, disk: 85, network: 35 },
    { name: "16:00", cpu: 43, memory: 63, disk: 86, network: 30 },
    { name: "18:00", cpu: 65, memory: 85, disk: 87, network: 45 },
    { name: "20:00", cpu: 45, memory: 65, disk: 88, network: 32 },
    { name: "22:00", cpu: 35, memory: 55, disk: 89, network: 28 },
  ]

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
    }, 1000)
  }

  return (
    <div className={cn("flex flex-col h-full bg-gray-50", className)}>
      <div className="flex items-center justify-between p-4 bg-white border-b">
        <h1 className="text-xl font-bold">System Monitoring Dashboard</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search metrics and logs..."
              className="pl-8 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
        <div className="border-b bg-white px-4">
          <TabsList className="h-10">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gray-100">
              Overview
            </TabsTrigger>
            <TabsTrigger value="explorer" className="data-[state=active]:bg-gray-100">
              Explorer
            </TabsTrigger>
            <TabsTrigger value="alarms" className="data-[state=active]:bg-gray-100">
              Alarms
            </TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-gray-100">
              Logs
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="overview" className="p-4 h-full overflow-auto">
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500">CPU Usage</h3>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-green-500">45%</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: "45%" }}></div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  <span className="text-green-500">↓ 2.3%</span> from last hour
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500">Memory Usage</h3>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-blue-500">68%</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: "68%" }}></div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  <span className="text-red-500">↑ 5.1%</span> from last hour
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500">Disk Usage</h3>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-yellow-500">72%</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 rounded-full" style={{ width: "72%" }}></div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  <span className="text-yellow-500">↑ 0.5%</span> from last hour
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500">Network I/O</h3>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-purple-500">1.2</span>
                    <span className="text-sm ml-1">GB/s</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: "60%" }}></div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  <span className="text-green-500">↓ 3.2%</span> from last hour
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium">CPU Usage Over Time</h3>
                  <Button variant="ghost" size="sm">
                    <Filter className="h-4 w-4 mr-1" /> Filter
                  </Button>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={cpuData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                      <YAxis stroke="#888888" fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name="Current"
                        stroke="#10b981"
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                      />
                      <Line type="monotone" dataKey="avg" name="Average" stroke="#94a3b8" strokeDasharray="5 5" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium">Memory Usage Over Time</h3>
                  <Button variant="ghost" size="sm">
                    <Filter className="h-4 w-4 mr-1" /> Filter
                  </Button>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={memoryData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                      <YAxis stroke="#888888" fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="value"
                        name="Current"
                        stroke="#3b82f6"
                        fill="#93c5fd"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="avg"
                        name="Average"
                        stroke="#94a3b8"
                        fill="#e2e8f0"
                        fillOpacity={0.3}
                        strokeDasharray="5 5"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium">Disk Usage Over Time</h3>
                  <Button variant="ghost" size="sm">
                    <Filter className="h-4 w-4 mr-1" /> Filter
                  </Button>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={diskData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                      <YAxis stroke="#888888" fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="value"
                        name="Current"
                        stroke="#f59e0b"
                        fill="#fcd34d"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="avg"
                        name="Average"
                        stroke="#94a3b8"
                        fill="#e2e8f0"
                        fillOpacity={0.3}
                        strokeDasharray="5 5"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium">Network I/O Over Time</h3>
                  <Button variant="ghost" size="sm">
                    <Filter className="h-4 w-4 mr-1" /> Filter
                  </Button>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={networkData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                      <YAxis stroke="#888888" fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="in" name="Inbound" stroke="#8b5cf6" strokeWidth={2} />
                      <Line type="monotone" dataKey="out" name="Outbound" stroke="#ec4899" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border shadow-sm mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium">Alarm Summary</h3>
                <Button variant="outline" size="sm">
                  <AlertCircle className="h-4 w-4 mr-1" /> Create Alarm
                </Button>
              </div>
              <div className="text-sm mb-4">
                You have <span className="font-bold text-blue-500">66 alarms</span> in{" "}
                <span className="font-bold text-yellow-500">INSUFFICIENT DATA</span> state in US East (N. Virginia)
                region.
              </div>
              <div className="grid grid-cols-4 gap-4">
                {alarmData.map((alarm, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="text-xs text-gray-500 truncate mb-1">{alarm.name}</div>
                    <div className="text-xs text-gray-700 mb-2">
                      {alarm.metric} ≤ {alarm.value}
                    </div>
                    <div className="h-20">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={metricData.slice(0, 6)}>
                          <Line type="monotone" dataKey="value" stroke="#3b82f6" dot={false} strokeWidth={2} />
                          <YAxis domain={[0, alarm.threshold]} hide />
                          <XAxis dataKey="name" hide />
                          <Tooltip />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium">Service Health</h3>
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>
                  <span className="text-sm text-gray-500">All services operational</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Uptime
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Incident
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">API Gateway</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                          Operational
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">99.99%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">30 days ago</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Database</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                          Operational
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">99.95%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">14 days ago</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Storage</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                          Operational
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">100%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">45 days ago</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Authentication</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                          Operational
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">99.98%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">7 days ago</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="explorer" className="p-4 h-full overflow-auto">
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium">System Overview</h3>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Clock className="h-4 w-4 mr-1" /> Last 24 hours
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" /> Export
                    </Button>
                  </div>
                </div>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={multiLineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                      <YAxis stroke="#888888" fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="cpu" name="CPU" stroke="#10b981" strokeWidth={2} />
                      <Line type="monotone" dataKey="memory" name="Memory" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="disk" name="Disk" stroke="#f59e0b" strokeWidth={2} />
                      <Line type="monotone" dataKey="network" name="Network" stroke="#8b5cf6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium">Resource Distribution</h3>
                  <Button variant="ghost" size="sm">
                    <Filter className="h-4 w-4 mr-1" /> Filter
                  </Button>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium">Resource Utilization</h3>
                  <Button variant="ghost" size="sm">
                    <Filter className="h-4 w-4 mr-1" /> Filter
                  </Button>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: "CPU", value: 45 },
                        { name: "Memory", value: 68 },
                        { name: "Disk", value: 72 },
                        { name: "Network", value: 60 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                      <YAxis stroke="#888888" fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Utilization %" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium">CPU Metrics</h3>
                  <Button variant="ghost" size="sm">
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={cpuData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                      <YAxis stroke="#888888" fontSize={12} />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" name="CPU Usage" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium">Memory Metrics</h3>
                  <Button variant="ghost" size="sm">
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={memoryData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                      <YAxis stroke="#888888" fontSize={12} />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" name="Memory Usage" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium">Disk Metrics</h3>
                  <Button variant="ghost" size="sm">
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={diskData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                      <YAxis stroke="#888888" fontSize={12} />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" name="Disk Usage" stroke="#f59e0b" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="alarms" className="p-4 h-full overflow-auto">
            <div className="bg-white p-4 rounded-lg border shadow-sm mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Metric Summary</h3>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" /> Filter
                </Button>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Mi-Ware monitors operational and performance metrics for your cloud resources and applications. You
                currently have <span className="font-bold">1,100</span> metrics available in the US East (N. Virginia)
                region.
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Browse or search your metrics to get started graphing data and creating alarms.
              </p>
              <div className="flex items-center gap-2">
                <Button>Browse Metrics</Button>
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input placeholder="Search Metrics" className="pl-8" />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border shadow-sm mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Alarm Summary</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-1" /> Refresh
                  </Button>
                  <Button>Create Alarm</Button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                You have <span className="font-bold text-blue-500">66 alarms</span> in{" "}
                <span className="font-bold text-yellow-500">INSUFFICIENT DATA</span> state in US East (N. Virginia)
                region.
              </p>
              <p className="text-sm text-gray-600 mb-4">
                You can set up billing alarms to receive e-mail alerts when your AWS charges exceed a threshold you
                choose. To get started, visit the
                <span className="text-blue-500 cursor-pointer"> Account Billing console</span>, click Preferences in the
                left navigation pane and check the Receive Billing Alerts box, then return here to the Mi-Ware console.
              </p>
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">See top 20 alarms:</h4>
                <div className="grid grid-cols-4 gap-4">
                  {alarmData.map((alarm, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="text-xs text-gray-500 truncate mb-1">{alarm.name}</div>
                      <div className="text-xs text-gray-700 mb-2">
                        {alarm.metric} ≤ {alarm.value}
                      </div>
                      <div className="h-20">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={metricData.slice(0, 6)}>
                            <Line type="monotone" dataKey="value" stroke="#3b82f6" dot={false} strokeWidth={2} />
                            <YAxis domain={[0, alarm.threshold]} hide />
                            <XAxis dataKey="name" hide />
                            <Tooltip />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Service Health</h3>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-1" /> Refresh
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">API Gateway</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                          Operational
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Database</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                          Operational
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Storage</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                          Operational
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="logs" className="p-4 h-full overflow-auto">
            <div className="bg-white p-4 rounded-lg border shadow-sm mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Log Streams</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-1" /> Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" /> Export
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Level
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Message
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2025-04-04 06:45:12</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          INFO
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">API Gateway</td>
                      <td className="px-6 py-4 text-sm text-gray-500">Request processed successfully</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2025-04-04 06:44:58</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          WARN
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Database</td>
                      <td className="px-6 py-4 text-sm text-gray-500">Connection pool reaching capacity</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2025-04-04 06:44:32</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          ERROR
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Storage</td>
                      <td className="px-6 py-4 text-sm text-gray-500">Failed to write file: permission denied</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2025-04-04 06:43:45</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          DEBUG
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Authentication</td>
                      <td className="px-6 py-4 text-sm text-gray-500">User authentication attempt from 192.168.1.1</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2025-04-04 06:43:12</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          INFO
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">API Gateway</td>
                      <td className="px-6 py-4 text-sm text-gray-500">Request received for /api/data</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Additional Info</h3>
                <Button variant="outline" size="sm">
                  <Info className="h-4 w-4 mr-1" /> Help
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <ChevronRight className="h-4 w-4 text-blue-500 mr-2" />
                      <a href="#" className="text-blue-500 hover:underline">
                        Getting Started Guide
                      </a>
                    </li>
                    <li className="flex items-center">
                      <ChevronRight className="h-4 w-4 text-blue-500 mr-2" />
                      <a href="#" className="text-blue-500 hover:underline">
                        Monitoring Scripts Guide
                      </a>
                    </li>
                    <li className="flex items-center">
                      <ChevronRight className="h-4 w-4 text-blue-500 mr-2" />
                      <a href="#" className="text-blue-500 hover:underline">
                        Overview and Features
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <ChevronRight className="h-4 w-4 text-blue-500 mr-2" />
                      <a href="#" className="text-blue-500 hover:underline">
                        Documentation
                      </a>
                    </li>
                    <li className="flex items-center">
                      <ChevronRight className="h-4 w-4 text-blue-500 mr-2" />
                      <a href="#" className="text-blue-500 hover:underline">
                        Forums
                      </a>
                    </li>
                    <li className="flex items-center">
                      <ChevronRight className="h-4 w-4 text-blue-500 mr-2" />
                      <a href="#" className="text-blue-500 hover:underline">
                        Report an Issue
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

