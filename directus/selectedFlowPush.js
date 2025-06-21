const axios = require("axios");
const fs = require("fs");
const readline = require("readline");
require("dotenv").config();

const {
  SOURCE,
  TARGET,
  SOURCE_EMAIL,
  SOURCE_PASSWORD,
  TARGET_EMAIL,
  TARGET_PASSWORD,
} = process.env;

async function authenticate(baseURL, email, password) {
  try {
    const response = await axios.post(`${baseURL}/auth/login`, {
      email: email,
      password: password,
    });
    return response.data.data.access_token;
  } catch (error) {
    console.error(`Failed to authenticate to ${baseURL}: ${error.message}`);
    throw error;
  }
}

async function exportData(accessToken, baseURL) {
  try {
    const flowsResponse = await axios.get(`${baseURL}/flows`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { limit: -1 },
    });
    fs.writeFileSync(
      "flows.json",
      JSON.stringify(flowsResponse.data.data, null, 2)
    );
    console.log("Flows exported and saved to flows.json");

    const operationsResponse = await axios.get(`${baseURL}/operations`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { limit: -1 },
    });
    fs.writeFileSync(
      "operations.json",
      JSON.stringify(operationsResponse.data.data, null, 2)
    );
    console.log("Operations exported and saved to operations.json");
  } catch (error) {
    console.error(`Failed to export data: ${error.message}`);
    throw error;
  }
}

async function importData(accessToken, baseURL, selectedFlowId) {
  const flowMap = {};
  const operationMap = {};

  try {
    const flows = JSON.parse(fs.readFileSync("flows.json", "utf-8"));
    const operations = JSON.parse(fs.readFileSync("operations.json", "utf-8"));

    // Step 1: Import the selected flow without foreign keys
    const flow = flows.find((flow) => flow.id === selectedFlowId);
    if (!flow) {
      console.error(`Flow with ID ${selectedFlowId} not found.`);
      return;
    }

    const { operation, operations: operationsList, ...flowWithoutRefs } = flow; // Remove foreign key fields
    try {
      const response = await upsertRecord(
        `${baseURL}/flows`,
        flowWithoutRefs,
        flow.id,
        accessToken
      );
      flowMap[flow.id] = response.data.data.id; // Store ID for later reference
      console.log(flowWithoutRefs);
      console.log(`Flow processed: ${flow.name}`);
    } catch (error) {
      console.error(`Failed to process flow ${flow.name}: ${error.message}`);
    }

    // Step 2: Import related operations (without resolve and reject fields)
    const operationsToProcess = operations.filter(
      (operation) => operation.flow === selectedFlowId
    );

    for (const operation of operationsToProcess) {
      const { resolve, reject, ...operationWithoutRefs } = operation;
      try {
        const response = await upsertRecord(
          `${baseURL}/operations`,
          operationWithoutRefs,
          operation.id,
          accessToken
        );
        operationMap[operation.id] = response.data.data.id; // Store ID for later reference
        console.log(operationWithoutRefs);
        console.log(`Operation processed: ${operation.name}`);
      } catch (error) {
        console.error(
          `Failed to process operation ${operation.name}: ${error.message}`
        );
      }
    }

    // Step 3: Update operations with resolve and reject fields
    for (const operation of operationsToProcess) {
      try {
        const resolveId = operation.resolve
          ? operationMap[operation.resolve]
          : null;
        const rejectId = operation.reject
          ? operationMap[operation.reject]
          : null;

        const updateData = { resolve: resolveId, reject: rejectId };

        await axios.patch(
          `${baseURL}/operations/${operationMap[operation.id]}`,
          updateData,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        console.log(updateData);
        console.log(`Operation updated with resolve/reject: ${operation.name}`);
      } catch (error) {
        console.error(
          `Failed to update operation ${operation.name} with resolve/reject: ${error.message}`
        );
      }
    }

    // Step 4: Update the flow with the foreign key to its operation
    const operationId = flow.operation ? operationMap[flow.operation] : null;
    if (operationId) {
      try {
        await axios.patch(
          `${baseURL}/flows/${flowMap[flow.id]}`,
          { operation: operationId },
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        console.log(operationId);
        console.log(`Flow updated with operation foreign key: ${flow.name}`);
      } catch (error) {
        console.error(
          `Failed to update flow ${flow.name} with operation foreign key: ${error.message}`
        );
      }
    }
  } catch (error) {
    console.error(`Failed to import data: ${error.message}`);
  }
}

async function upsertRecord(url, data, id, accessToken) {
  try {
    await axios.get(`${url}/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return await axios.patch(`${url}/${id}`, data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch (error) {
    if (
      error.response &&
      (error.response.status === 404 || error.response.status === 403)
    ) {
      return await axios.post(
        url,
        { ...data, id },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
    } else {
      throw error;
    }
  }
}

// Function to ask user for input
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

(async () => {
  const sourceToken = await authenticate(SOURCE, SOURCE_EMAIL, SOURCE_PASSWORD);
  const targetToken = await authenticate(TARGET, TARGET_EMAIL, TARGET_PASSWORD);

  await exportData(sourceToken, SOURCE);

  // Display the list of flows and ask for input
  const flows = JSON.parse(fs.readFileSync("flows.json", "utf-8"));
  flows.forEach((flow, index) => {
    console.log(
      `${index + 1}, ${flow.name}, ${flow.id}, ${
        flow.options.method
          ? flow.options.method
          : flow.options.return
          ? "Another Flow"
          : flow.options.cron
          ? "Cron"
          : "GET"
      }`
    );
    // console.log(`${index + 1}. ${flow.name}`);
  });

  console.error("-------------------------------------");
  const userInput = await askQuestion("Please enter the flow number to sync: ");

  const flowIndex = parseInt(userInput) - 1;
  if (flowIndex >= 0 && flowIndex < flows.length) {
    const selectedFlowId = flows[flowIndex].id;
    await importData(targetToken, TARGET, selectedFlowId);
  } else {
    console.error("---------------------------");
    console.error("Invalid selection. Exiting.");
    process.exit(1);
  }
})();
