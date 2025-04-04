import type { Node, Edge } from "reactflow"
import {
  createClient,
  createDag,
  createFileConversionConfig,
  updateDag,
  executeWorkflow,
} from "@/components/demo111/api-service"
import {
  readFile,
  filterData,
  writeFile,
  mockReadFileData,
  mockFilterData,
  mockWriteFileData,
} from "@/components/demo-file-conversion/api-service"

export async function executeNode(
  node: Node,
  nodes: Node[],
  edges: Edge[],
  setNodes: (updater: (nodes: Node[]) => Node[]) => void,
) {
  console.log(`Executing node: ${node.id}`)

  // Mark node as executing
  setNodes((nds) => nds.map((n) => (n.id === node.id ? { ...n, data: { ...n.data, executing: true } } : n)))

  let outputData = null

  // Execute node based on type
  if (node.data.type === "onSchedule") {
    try {
      const response = await fetch("http://localhost:8001/api/fetch?object_name=ISCS__c&limit=100&use_bulk_api=false", {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      })
      outputData = await response.json()
      console.log("API Response:", outputData)
    } catch (error) {
      console.error("Error:", error)
      outputData = { error: "Failed to fetch data" }
    }
  } else if (node.data.type === "readFile") {
    // Process input data and prepare for display
    const inputData = node.data.inputData || {}
    outputData = inputData
  } else if (node.data.type === "writeFile") {
    // Check if input data is populated correctly
    const inputData = node.data.inputData || {}
    if (inputData.success && inputData.records && inputData.records.length > 0) {
      outputData = { success: true, message: "Data written successfully" }
    } else {
      outputData = { success: false, message: "No data to write" }
    }
  } else if (node.data.type === "createConfig") {
    try {
      const formData = node.data.formData || {}
      const response = await fetch(
        `http://localhost:8000/clients/1/file_conversion_configs/?dag_id=${formData.dagId || 1}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify({
            input: {
              source_type: formData.sourceType || "s3",
              bucket: formData.sourceBucket || "my-data-bucket",
              path: formData.sourcePath || "raw/data.csv",
              format: formData.sourceFormat || "csv",
            },
            output: {
              destination_type: formData.destType || "s3",
              bucket: formData.destBucket || "processed-data",
              path: formData.destPath || "transformed/data.parquet",
              format: formData.destFormat || "parquet",
            },
            spark_config: {
              executor_memory: formData.executorMemory || "4g",
              executor_cores: formData.executorCores || 2,
              num_executors: formData.numExecutors || 4,
            },
          }),
        },
      )
      outputData = await response.json()
      console.log("Create Config Response:", outputData)
    } catch (error) {
      console.error("Error creating config:", error)
      outputData = {
        id: Math.floor(Math.random() * 1000),
        created_at: new Date().toISOString(),
        message: "Config created successfully (mock data)",
      }
    }
  } else if (node.data.type === "listConfigs") {
    try {
      const formData = node.data.formData || {}
      let url = `http://localhost:8000/clients/${formData.clientId || 1}/file_conversion_configs/?skip=${formData.skip || 0}&limit=${formData.limit || 100}`

      if (formData.sortBy) {
        url += `&sort_by=${formData.sortBy}`
      }

      if (formData.sortOrder) {
        url += `&sort_order=${formData.sortOrder}`
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      })
      outputData = await response.json()
      console.log("List Configs Response:", outputData)
    } catch (error) {
      console.error("Error listing configs:", error)
      outputData = {
        items: [
          {
            id: 1,
            input: {
              source_type: "s3",
              bucket: "my-data-bucket",
              path: "raw/data.csv",
              format: "csv",
            },
            output: {
              destination_type: "s3",
              bucket: "processed-data",
              path: "transformed/data.parquet",
              format: "parquet",
            },
            created_at: new Date().toISOString(),
          },
          {
            id: 2,
            input: {
              source_type: "s3",
              bucket: "another-bucket",
              path: "raw/logs.csv",
              format: "csv",
            },
            output: {
              destination_type: "s3",
              bucket: "processed-logs",
              path: "transformed/logs.parquet",
              format: "parquet",
            },
            created_at: new Date().toISOString(),
          },
        ],
        total: 2,
      }
    }
  } else if (node.data.type === "getConfig") {
    try {
      const formData = node.data.formData || {}
      const clientId = formData.clientId || 1
      const configId = formData.configId || 1
      const response = await fetch(`http://localhost:8000/clients/${clientId}/file_conversion_configs/${configId}`, {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      })
      outputData = await response.json()
      console.log("Get Config Response:", outputData)
    } catch (error) {
      console.error("Error getting config:", error)
      outputData = {
        id: node.data.formData?.configId || 1,
        input: {
          source_type: "s3",
          bucket: "my-data-bucket",
          path: "raw/data.csv",
          format: "csv",
        },
        output: {
          destination_type: "s3",
          bucket: "processed-data",
          path: "transformed/data.parquet",
          format: "parquet",
        },
        spark_config: {
          executor_memory: "4g",
          executor_cores: 2,
          num_executors: 4,
        },
        created_at: new Date().toISOString(),
      }
    }
  } else if (node.data.type === "updateConfig") {
    try {
      const formData = node.data.formData || {}
      const clientId = formData.clientId || 1
      const configId = formData.configId || 1
      const response = await fetch(`http://localhost:8000/clients/${clientId}/file_conversion_configs/${configId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          input: {
            source_type: formData.sourceType || "s3",
            bucket: formData.sourceBucket || "updated-bucket",
            path: formData.sourcePath || "updated/data.csv",
            format: formData.sourceFormat || "csv",
          },
          output: {
            destination_type: formData.destType || "s3",
            bucket: formData.destBucket || "updated-output",
            path: formData.destPath || "processed/data.parquet",
            format: formData.destFormat || "parquet",
          },
          spark_config: {
            executor_memory: formData.executorMemory || "8g",
            executor_cores: formData.executorCores || 4,
            num_executors: formData.numExecutors || 8,
          },
        }),
      })
      outputData = await response.json()
      console.log("Update Config Response:", outputData)
    } catch (error) {
      console.error("Error updating config:", error)
      outputData = {
        id: node.data.formData?.configId || 1,
        message: "Config updated successfully (mock data)",
      }
    }
  } else if (node.data.type === "deleteConfig") {
    try {
      const formData = node.data.formData || {}
      const clientId = formData.clientId || 1
      const configId = formData.configId || 1

      let url = `http://localhost:8000/clients/${clientId}/file_conversion_configs/${configId}`

      const queryParams = []
      if (formData.forceDelete) {
        queryParams.push("force=true")
      }

      if (formData.deleteRelatedJobs) {
        queryParams.push("delete_related_jobs=true")
      }

      if (queryParams.length > 0) {
        url += `?${queryParams.join("&")}`
      }

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          accept: "application/json",
        },
      })
      outputData = await response.json()
      console.log("Delete Config Response:", outputData)
    } catch (error) {
      console.error("Error deleting config:", error)
      outputData = {
        message: "Config deleted successfully (mock data)",
      }
    }
  } else if (node.data.type === "createClient") {
    try {
      const formData = node.data.formData || {}
      outputData = await createClient(formData.clientName || "Salesforce")
    } catch (error) {
      console.error("Error creating client:", error)
      outputData = {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        name: formData.clientName || "Salesforce",
        id: Math.floor(Math.random() * 1000),
        api_key: `api-key-${Math.random().toString(36).substring(2, 15)}`,
        file_conversion_configs: [],
        salesforce_configs: [],
      }
    }
  } else if (node.data.type === "createDag") {
    try {
      const formData = node.data.formData || {}
      outputData = await createDag(formData.dagName || "Sample DAG", formData.schedule || "* * * * *")
    } catch (error) {
      console.error("Error creating DAG:", error)
      const dagId = `dag_${(formData.dagName || "sample_dag").toLowerCase().replace(/\s+/g, "_")}_${Math.random().toString(36).substring(2, 10)}`
      outputData = {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        name: formData.dagName || "Sample DAG",
        schedule: formData.schedule || "* * * * *",
        id: Math.floor(Math.random() * 1000),
        dag_id: dagId,
        dag_sequence: [
          {
            id: "node_1",
            type: "start",
            config_id: 1,
            next: ["node_2"],
          },
          {
            id: "node_2",
            type: "end",
            config_id: 1,
            next: [],
          },
        ],
      }
    }
  } else if (node.data.type === "fileConversionConfig") {
    try {
      const formData = node.data.formData || {}
      const config = {
        input: {
          provider: formData.inputProvider || "local",
          format: formData.inputFormat || "xml",
          path: formData.inputPath || "/app/mock_data/test_records_2000.xml",
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
        },
        filter: {
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
        output: {
          provider: formData.outputProvider || "aws",
          format: formData.outputFormat || "json",
          path: formData.outputPath || "kmk-iscs/output/test_records_json",
          mode: "overwrite",
          options: {},
        },
        spark_config: {
          driver_cores: 1,
          driver_memory: "512m",
          executor_instances: 1,
          executor_cores: 1,
          executor_memory: "512m",
        },
      }

      outputData = await createFileConversionConfig(
        formData.clientId || 1,
        formData.dagId || "dag_sample_dag_f1ab5f34",
        config,
      )
    } catch (error) {
      console.error("Error creating file conversion config:", error)
      outputData = {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        id: Math.floor(Math.random() * 1000),
        client_id: formData.clientId || 1,
      }
    }
  } else if (node.data.type === "updateDag") {
    try {
      const formData = node.data.formData || {}
      let parsedSequence
      try {
        parsedSequence = JSON.parse(formData.dagSequence || "[]")
      } catch (e) {
        console.error("Invalid JSON for DAG sequence:", e)
        parsedSequence = [
          { id: "node_1", type: "start", config_id: 1, next: ["file_node_1"] },
          { id: "file_node_1", type: "file_conversion", config_id: 1, next: ["node_2"] },
          { id: "node_2", type: "end", config_id: 1, next: [] },
        ]
      }

      outputData = await updateDag(
        formData.dagId || "dag_sample_dag_f1ab5f34",
        formData.dagName || "Sample DAG",
        formData.schedule || "* * * * *",
        parsedSequence,
      )
    } catch (error) {
      console.error("Error updating DAG:", error)
      outputData = {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        name: formData.dagName || "Sample DAG",
        schedule: formData.schedule || "* * * * *",
        id: Math.floor(Math.random() * 1000),
        dag_id: formData.dagId || "dag_sample_dag_f1ab5f34",
        dag_sequence: JSON.parse(formData.dagSequence || "[]"),
      }
    }
  } else if (node.data.type === "executeWorkflow") {
    try {
      const formData = node.data.formData || {}
      outputData = await executeWorkflow(formData.dagId || "dag_sample_dag_f1ab5f34")
    } catch (error) {
      console.error("Error executing workflow:", error)
      outputData = {
        execution_id: `exec-${Math.random().toString(36).substring(2, 10)}`,
        status: "running",
        start_time: new Date().toISOString(),
        nodes: {
          node_1: {
            status: "completed",
            start_time: new Date().toISOString(),
            end_time: new Date(Date.now() + 1000).toISOString(),
          },
          file_node_1: {
            status: "running",
            start_time: new Date(Date.now() + 1500).toISOString(),
          },
        },
      }
    }
  } else if (node.data.type === "readFileNode") {
    try {
      const formData = node.data.formData || {}
      const options = {
        provider: formData.provider || "local",
        format: formData.format || "xml",
        path: formData.path || "/app/mock_data/test_records_2000.xml",
        options: {
          rowTag: formData.rowTag || "Record",
          rootTag: formData.rootTag || "Records",
        },
      }

      outputData = await readFile(options)
    } catch (error) {
      console.error("Error reading file:", error)
      outputData = mockReadFileData
    }
  } else if (node.data.type === "filterNode") {
    try {
      const formData = node.data.formData || {}
      const inputData = node.data.inputData

      if (!inputData) {
        throw new Error("No input data available")
      }

      // Build filter criteria
      const conditions = []

      if (formData.revenueFilter) {
        conditions.push({
          field: "AnnualRevenue",
          operation: "gt",
          value: formData.revenueValue || 1000000,
        })
      }

      if (formData.industryFilter) {
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

      const filterCriteria = {
        operator: formData.operator || "AND",
        conditions,
      }

      outputData = await filterData(inputData, filterCriteria)
    } catch (error) {
      console.error("Error filtering data:", error)
      if (node.data.inputData) {
        outputData = mockFilterData(node.data.inputData)
      } else {
        outputData = {
          success: false,
          records: [],
          metadata: {
            inputRecordCount: 0,
            outputRecordCount: 0,
            filterCriteria: {
              operator: "AND",
              conditions: [],
            },
            timestamp: new Date().toISOString(),
          },
        }
      }
    }
  } else if (node.data.type === "writeFileNode") {
    try {
      const formData = node.data.formData || {}
      const inputData = node.data.inputData

      if (!inputData) {
        throw new Error("No input data available")
      }

      const options = {
        provider: formData.provider || "aws",
        format: formData.format || "json",
        path: formData.path || "kmk-iscs/output/test_records_json",
        mode: formData.mode || "overwrite",
        options: {},
      }

      outputData = await writeFile(inputData, options)
    } catch (error) {
      console.error("Error writing file:", error)
      if (node.data.inputData) {
        outputData = mockWriteFileData(node.data.inputData)
      } else {
        outputData = {
          success: false,
          message: "Failed to write data: No input data available",
          metadata: {
            destination: "",
            format: "",
            recordCount: 0,
            timestamp: new Date().toISOString(),
          },
        }
      }
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
              executing: false,
              executed: true,
              outputData: outputData,
            },
          }
        : n,
    ),
  )

  // Find next connected node
  const connectedEdges = edges.filter((edge) => edge.source === node.id)
  if (connectedEdges.length > 0) {
    const nextNodeId = connectedEdges[0].target
    const nextNode = nodes.find((n) => n.id === nextNodeId)
    if (nextNode) {
      // Pass data to next node
      setNodes((nds) =>
        nds.map((n) => (n.id === nextNodeId ? { ...n, data: { ...n.data, inputData: outputData } } : n)),
      )

      // Execute next node
      await executeNode(nextNode, nodes, edges, setNodes)
    }
  }

  return outputData
}

export async function executeFlow(
  nodes: Node[],
  edges: Edge[],
  setNodes: (updater: (nodes: Node[]) => Node[]) => void,
  setIsExecuting: (isExecuting: boolean) => void,
) {
  setIsExecuting(true)

  // Find start node and connected nodes
  const startNode = nodes.find((node) => node.id === "start")
  if (!startNode) {
    console.error("Start node not found")
    setIsExecuting(false)
    return
  }

  // Find all edges from the start node
  const connectedEdges = edges.filter((edge) => edge.source === startNode.id)
  if (connectedEdges.length === 0) {
    console.error("No connections from start node")
    setIsExecuting(false)
    return
  }

  // Get the first node connected to start
  const firstNodeId = connectedEdges[0].target
  const firstNode = nodes.find((node) => node.id === firstNodeId)
  if (!firstNode) {
    console.error("First node not found")
    setIsExecuting(false)
    return
  }

  // Execute the flow starting from the first node
  await executeNode(firstNode, nodes, edges, setNodes)

  setIsExecuting(false)
}

