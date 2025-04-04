"use client"

export const apiCodeSnippets = {
  createConfig: `const createConfig = async () => {
  try {
    const response = await fetch('http://localhost:8000/clients/1/file_conversion_configs/?dag_id=1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify({
        input: {
          source_type: "s3",
          bucket: "my-data-bucket",
          path: "raw/data.csv",
          format: "csv"
        },
        output: {
          destination_type: "s3",
          bucket: "processed-data",
          path: "transformed/data.parquet",
          format: "parquet"
        },
        spark_config: {
          executor_memory: "4g",
          executor_cores: 2,
          num_executors: 4
        }
      })
    });
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error creating config:', error);
  }
};`,

  listConfigs: `const listConfigs = async () => {
  try {
    const response = await fetch('http://localhost:8000/clients/1/file_conversion_configs/?skip=0&limit=100', {
      method: 'GET',
      headers: {
        'accept': 'application/json'
      }
    });
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error listing configs:', error);
  }
};`,

  getConfig: `const getConfig = async (clientId, configId) => {
  try {
    const response = await fetch(\`http://localhost:8000/clients/\${clientId}/file_conversion_configs/\${configId}\`, {
      method: 'GET',
      headers: {
        'accept': 'application/json'
      }
    });
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error getting config:', error);
  }
};`,

  updateConfig: `const updateConfig = async (clientId, configId) => {
  try {
    const response = await fetch(\`http://localhost:8000/clients/\${clientId}/file_conversion_configs/\${configId}\`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify({
        input: {
          source_type: "s3",
          bucket: "updated-bucket",
          path: "updated/data.csv",
          format: "csv"
        },
        output: {
          destination_type: "s3",
          bucket: "updated-output",
          path: "processed/data.parquet",
          format: "parquet"
        },
        spark_config: {
          executor_memory: "8g",
          executor_cores: 4,
          num_executors: 8
        }
      })
    });
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error updating config:', error);
  }
};`,

  deleteConfig: `const deleteConfig = async (clientId, configId) => {
  try {
    const response = await fetch(\`http://localhost:8000/clients/\${clientId}/file_conversion_configs/\${configId}\`, {
      method: 'DELETE',
      headers: {
        'accept': 'application/json'
      }
    });
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error deleting config:', error);
  }
};`,

  onSchedule: `fetch("http://localhost:8001/api/fetch?object_name=ISCS__c&limit=100&use_bulk_api=false", {
  method: "GET",
  headers: {
      "Accept": "application/json"
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error("Error:", error));`,

  readFile: `import { useEffect, useState } from "react";

const DataTable = () => {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8001/api/fetch?object_name=ISCS__c&limit=100&use_bulk_api=false")
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setRecords(data.records);
        }
      })
      .catch(error => console.error("Error fetching data:", error));
  }, []);

  return (
    <div className="overflow-x-auto p-4">
      <table className="min-w-full bg-white border border-gray-300 shadow-md rounded-lg">
        <thead className="bg-gray-200">
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Customer Name</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Phone</th>
            <th className="border px-4 py-2">Registration Date</th>
            <th className="border px-4 py-2">Account Balance</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.Id} className="hover:bg-gray-100">
              <td className="border px-4 py-2">{record.Id}</td>
              <td className="border px-4 py-2">{record.Customer_Name__c || "N/A"}</td>
              <td className="border px-4 py-2">{record.Email_Address__c || "N/A"}</td>
              <td className="border px-4 py-2">{record.Phone_Number__c || "N/A"}</td>
              <td className="border px-4 py-2">{record.Registration_Date__c || "N/A"}</td>
              <td className="border px-4 py-2">
                {record.Account_Balance__c !== undefined ? \`$\${record.Account_Balance__c}\` : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;`,

  writeFile: `// Write file logic
if (inputData && inputData.success) {
  console.log("Writing data to file:", inputData.records.length, "records");
  return { success: true, message: "Data written successfully" };
} else {
  console.error("No data to write");
  return { success: false, message: "No data to write" };
}`,
}

