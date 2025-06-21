const axios = require("axios");
const readline = require("readline");
require("dotenv").config();

// Extract values from .env
const {
  SOURCE,
  TARGET,
  SOURCE_EMAIL,
  SOURCE_PASSWORD,
  TARGET_EMAIL,
  TARGET_PASSWORD,
} = process.env;

// Fields to remove before pushing to the target (foreign key like user_updated, user_created etc.)
const fieldsToRemove = ["user_updated"];

// Authenticate with Directus
async function authenticate(baseURL, email, password) {
  try {
    const response = await axios.post(`${baseURL}/auth/login`, {
      email: email,
      password: password,
    });
    return response.data.data.access_token;
  } catch (error) {
    throw new Error(
      `Failed to authenticate to ${baseURL}: ${
        error.response ? error.response.data : error.message
      }`
    );
  }
}

// Fetch data from Directus collection
async function fetchData(baseURL, accessToken, collection) {
  try {
    const response = await axios.get(
      `${baseURL}/items/${collection.collection}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { limit: -1 },
      }
    );
    return response.data.data;
  } catch (error) {
    throw new Error(
      `Failed to fetch data from ${collection.collection}: ${
        error.response ? error.response.data : error.message
      }`
    );
  }
}

// Remove specified fields from an item
function removeFields(item, fields) {
  const newItem = { ...item };
  fields.forEach((field) => {
    if (newItem.hasOwnProperty(field)) {
      delete newItem[field];
      console.log(`Removed field "${field}" from item id: ${item.id}`);
    }
  });
  return newItem;
}

// Sync source collection data with the target
async function syncCollection(
  sourceData,
  targetData,
  collection,
  accessToken,
  fieldsToRemove
) {
  const targetIds = new Set(targetData.map((item) => item.id));
  const newItems = sourceData.filter((item) => !targetIds.has(item.id));

  for (const item of newItems) {
    try {
      // Remove specified fields from the item
      const fieldsToRemove = ["user_created","user_updated"];

      const cleanedItem = removeFields(item, fieldsToRemove);
      await axios.post(`${TARGET}/items/${collection.collection}`, cleanedItem, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      console.log(
        `Added new item with id: ${item.id} to collection: ${collection.collection}`
      );
    } catch (error) {
      console.error(
        `Failed to sync item id: ${item.id} to collection: ${collection.collection}`,
        error.response ? error.response.data : error.message
      );
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

// Main function to perform sync
(async () => {
  try {
    // Authenticate to source and target
    const sourceAccessToken = await authenticate(
      SOURCE,
      SOURCE_EMAIL,
      SOURCE_PASSWORD
    );
    const targetAccessToken = await authenticate(
      TARGET,
      TARGET_EMAIL,
      TARGET_PASSWORD
    );

    // Fetch and display collections from the source
    const collectionsResponse = await axios.get(`${SOURCE}/collections`, {
      headers: { Authorization: `Bearer ${sourceAccessToken}` },
    });
    const collections = collectionsResponse.data.data;

    console.log("Available collections:");
    collections.forEach((collection, index) => {
      console.log(`${index + 1}. ${collection.collection}`);
    });

    // Ask user to select a collection
    const userInput = await askQuestion(
      "Please enter the number of the collection to sync: "
    );

    const collectionIndex = parseInt(userInput) - 1;
    if (collectionIndex >= 0 && collectionIndex < collections.length) {
      const selectedCollection = collections[collectionIndex];
      console.log(`Selected collection: ${selectedCollection.collection}`);

      // Fetch data from source and target
      const sourceData = await fetchData(
        SOURCE,
        sourceAccessToken,
        selectedCollection
      );
      const targetData = await fetchData(
        TARGET,
        targetAccessToken,
        selectedCollection
      );

      // Sync selected collection
      await syncCollection(
        sourceData,
        targetData,
        selectedCollection,
        targetAccessToken,
        fieldsToRemove // Pass fields to remove
      );

      console.log("Sync completed successfully.");
    } else {
      console.error("Invalid selection. Exiting.");
      process.exit(1);
    }
  } catch (error) {
    console.error("Error during sync:", error.message);
  }
})();
