export function generateApiCode(nodeType: string, formData: any): string {
  switch (nodeType) {
    case "createConfig":
      return generateCreateConfigCode(formData)
    case "listConfigs":
      return generateListConfigsCode(formData)
    case "getConfig":
      return generateGetConfigCode(formData)
    case "updateConfig":
      return generateUpdateConfigCode(formData)
    case "deleteConfig":
      return generateDeleteConfigCode(formData)
    default:
      return ""
  }
}

function generateCreateConfigCode(formData: any): string {
  return `const createConfig = async () => {
  try {
    const response = await fetch('http://localhost:8000/clients/1/file_conversion_configs/?dag_id=${formData.dagId || 1}', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify({
        input: {
          source_type: "${formData.sourceType || "s3"}",
          bucket: "${formData.sourceBucket || "my-data-bucket"}",
          path: "${formData.sourcePath || "raw/data.csv"}",
          format: "${formData.sourceFormat || "csv"}"
        },
        output: {
          destination_type: "${formData.destType || "s3"}",
          bucket: "${formData.destBucket || "processed-data"}",
          path: "${formData.destPath || "transformed/data.parquet"}",
          format: "${formData.destFormat || "parquet"}"
        },
        spark_config: {
          executor_memory: "${formData.executorMemory || "4g"}",
          executor_cores: ${formData.executorCores || 2},
          num_executors: ${formData.numExecutors || 4}
        }
      })
    });
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Error creating config:', error);
    throw error;
  }
};`
}

function generateListConfigsCode(formData: any): string {
  let url = `http://localhost:8000/clients/${formData.clientId || 1}/file_conversion_configs/?skip=${formData.skip || 0}&limit=${formData.limit || 100}`

  if (formData.sortBy) {
    url += `&sort_by=${formData.sortBy}`
  }

  if (formData.sortOrder) {
    url += `&sort_order=${formData.sortOrder}`
  }

  return `const listConfigs = async () => {
  try {
    const response = await fetch('${url}', {
      method: 'GET',
      headers: {
        'accept': 'application/json'
      }
    });
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Error listing configs:', error);
    throw error;
  }
};`
}

function generateGetConfigCode(formData: any): string {
  return `const getConfig = async () => {
  try {
    const response = await fetch(\`http://localhost:8000/clients/${formData.clientId || 1}/file_conversion_configs/${formData.configId || 1}\`, {
      method: 'GET',
      headers: {
        'accept': 'application/json'
      }
    });
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Error getting config:', error);
    throw error;
  }
};`
}

function generateUpdateConfigCode(formData: any): string {
  return `const updateConfig = async () => {
  try {
    const response = await fetch(\`http://localhost:8000/clients/${formData.clientId || 1}/file_conversion_configs/${formData.configId || 1}\`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify({
        input: {
          source_type: "${formData.sourceType || "s3"}",
          bucket: "${formData.sourceBucket || "updated-bucket"}",
          path: "${formData.sourcePath || "updated/data.csv"}",
          format: "${formData.sourceFormat || "csv"}"
        },
        output: {
          destination_type: "${formData.destType || "s3"}",
          bucket: "${formData.destBucket || "updated-output"}",
          path: "${formData.destPath || "processed/data.parquet"}",
          format: "${formData.destFormat || "parquet"}"
        },
        spark_config: {
          executor_memory: "${formData.executorMemory || "8g"}",
          executor_cores: ${formData.executorCores || 4},
          num_executors: ${formData.numExecutors || 8}
        }
      })
    });
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Error updating config:', error);
    throw error;
  }
};`
}

function generateDeleteConfigCode(formData: any): string {
  let url = `http://localhost:8000/clients/${formData.clientId || 1}/file_conversion_configs/${formData.configId || 1}`

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

  return `const deleteConfig = async () => {
  try {
    const response = await fetch(\`${url}\`, {
      method: 'DELETE',
      headers: {
        'accept': 'application/json'
      }
    });
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Error deleting config:', error);
    throw error;
  }
};`
}

