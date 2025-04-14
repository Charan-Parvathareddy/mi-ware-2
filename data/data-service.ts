"use client"

interface ApiData {
  request: {
    method: string
    url: string
    headers?: Record<string, string>
    body?: any
  }
  response?: {
    status: number
    statusText: string
    body: any
  }
  timestamp: string
  error?: string
}

// In-memory storage for API calls
let apiCalls: ApiData[] = []
let dagId: string | null = null
let configId: number | null = null

// Function to save API call data
export function saveApiCall(apiCall: ApiData): void {
  apiCalls = [apiCall, ...apiCalls]

  // Save to localStorage for persistence
  try {
    localStorage.setItem("api-calls", JSON.stringify(apiCalls))
  } catch (error) {
    console.error("Error saving API calls to localStorage:", error)
  }

  // Check if this is a DAG creation response and extract the dag_id
  if (apiCall.request.url.includes("/dags/") && apiCall.request.method === "POST" && apiCall.response?.body?.dag_id) {
    dagId = apiCall.response.body.dag_id
    localStorage.setItem("current-dag-id", dagId)
  }

  // Check if this is a file conversion config response and extract the config_id
  if (
    apiCall.request.url.includes("/file_conversion_configs/") &&
    apiCall.request.method === "POST" &&
    apiCall.response?.body?.id
  ) {
    configId = apiCall.response.body.id
    localStorage.setItem("current-config-id", String(configId))
  }
}

// Function to get all API calls
export function getApiCalls(): ApiData[] {
  return apiCalls
}

// Function to get the current DAG ID
export function getDagId(): string | null {
  return dagId
}

// Function to set the DAG ID
export function setDagId(id: string): void {
  dagId = id
  localStorage.setItem("current-dag-id", id)
}

// Function to get the current config ID
export function getConfigId(): number | null {
  return configId
}

// Function to set the config ID
export function setConfigId(id: number): void {
  configId = id
  localStorage.setItem("current-config-id", String(id))
}

// Initialize from localStorage if available
export function initializeDataService(): void {
  try {
    const savedApiCalls = localStorage.getItem("api-calls")
    if (savedApiCalls) {
      apiCalls = JSON.parse(savedApiCalls)
    }

    const savedDagId = localStorage.getItem("current-dag-id")
    if (savedDagId) {
      dagId = savedDagId
    }

    const savedConfigId = localStorage.getItem("current-config-id")
    if (savedConfigId) {
      configId = Number.parseInt(savedConfigId, 10)
    }
  } catch (error) {
    console.error("Error loading data from localStorage:", error)
  }
}

// Create a JSON file with the API data (this is a mock function since we can't write to the filesystem in the browser)
export function exportDataToJson(): void {
  const dataStr = JSON.stringify({ apiCalls, dagId, configId }, null, 2)
  const dataBlob = new Blob([dataStr], { type: "application/json" })
  const url = URL.createObjectURL(dataBlob)

  const link = document.createElement("a")
  link.href = url
  link.download = "data.json"
  document.body.appendChild(link)
  link.click()

  setTimeout(() => {
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, 100)
}
