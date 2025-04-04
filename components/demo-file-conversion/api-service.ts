// API service for Demo - File-Conversion workflow

export interface ReadFileResponse {
  success: boolean
  records: Record<string, any>[]
  metadata: {
    source: string
    format: string
    recordCount: number
    timestamp: string
  }
}

export interface FilterResponse {
  success: boolean
  records: Record<string, any>[]
  metadata: {
    inputRecordCount: number
    outputRecordCount: number
    filterCriteria: {
      operator: string
      conditions: any[]
    }
    timestamp: string
  }
}

export interface WriteFileResponse {
  success: boolean
  message: string
  metadata: {
    destination: string
    format: string
    recordCount: number
    timestamp: string
  }
}

// Mock data for Read File
export const mockReadFileData: ReadFileResponse = {
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

// Mock data for Filter
export const mockFilterData = (inputData: ReadFileResponse): FilterResponse => {
  // Apply filter: AnnualRevenue > 1000000 AND (Industry = 'Technology' OR Industry = 'Healthcare')
  const filteredRecords = inputData.records.filter(
    (record) =>
      record.AnnualRevenue > 1000000 && (record.Industry === "Technology" || record.Industry === "Healthcare"),
  )

  return {
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
}

// Mock data for Write File
export const mockWriteFileData = (inputData: FilterResponse): WriteFileResponse => {
  return {
    success: true,
    message: "Data successfully written to destination",
    metadata: {
      destination: "kmk-iscs/output/test_records_json",
      format: "json",
      recordCount: inputData.records.length,
      timestamp: new Date().toISOString(),
    },
  }
}

// Read File API
export async function readFile(options: {
  provider: string
  format: string
  path: string
  options?: Record<string, any>
}): Promise<ReadFileResponse> {
  try {
    // In a real implementation, this would make an API call
    console.log("Reading file with options:", options)

    // Return mock data
    return mockReadFileData
  } catch (error) {
    console.error("Error reading file:", error)
    throw error
  }
}

// Filter API
export async function filterData(
  inputData: ReadFileResponse,
  filterCriteria: {
    operator: string
    conditions: any[]
  },
): Promise<FilterResponse> {
  try {
    // In a real implementation, this would make an API call
    console.log("Filtering data with criteria:", filterCriteria)

    // Return mock filtered data
    return mockFilterData(inputData)
  } catch (error) {
    console.error("Error filtering data:", error)
    throw error
  }
}

// Write File API
export async function writeFile(
  inputData: FilterResponse,
  options: {
    provider: string
    format: string
    path: string
    mode: string
    options?: Record<string, any>
  },
): Promise<WriteFileResponse> {
  try {
    // In a real implementation, this would make an API call
    console.log("Writing file with options:", options)

    // Return mock write response
    return mockWriteFileData(inputData)
  } catch (error) {
    console.error("Error writing file:", error)
    throw error
  }
}

