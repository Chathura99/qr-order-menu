const axios = require("axios");
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

// Fields to remove before pushing to the target (forign key like user_updated, user_created etc.)
const fieldsToRemove = ["user_created","user_updated"];

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
    const response = await axios.get(`${baseURL}/items/${collection}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { limit: -1 }
    });
    return response.data.data;
  } catch (error) {
    throw new Error(
      `Failed to fetch data from ${collection}: ${
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

async function syncCollection(sourceData, targetData, collection, accessToken, fieldsToRemove) {
  // Create a Map for quick lookup of target items by id
  const targetMap = new Map(targetData.map((item) => [item.id, item]));

  for (const item of sourceData) {
    // Remove specified fields from the item
    const cleanedItem = removeFields(item, fieldsToRemove);

    try {
      if (targetMap.has(item.id)) {
        // If item exists, update it (PUT request to /items/{collection}/{id})
        await axios.patch(
          `${TARGET}/items/${collection}/${item.id}`,
          cleanedItem,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        console.log(`Updated item with id: ${item.id} in collection: ${collection}`);
      } else {
        // If item does not exist, create it
        await axios.post(
          `${TARGET}/items/${collection}`,
          cleanedItem,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        console.log(`Added new item with id: ${item.id} to collection: ${collection}`);
      }
    } catch (error) {
      console.error(
        `Failed to sync item id: ${item.id} to collection: ${collection}`,
        error.response ? error.response.data : error.message
      );
    }
  }
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

    // Define collections to sync
    const collections = ["test_collection_1"];

    // Loop through each collection and sync data
    for (const collection of collections) {
      console.log(`Syncing collection: ${collection}`);
      const sourceData = await fetchData(SOURCE, sourceAccessToken, collection);
      const targetData = await fetchData(TARGET, targetAccessToken, collection);
      await syncCollection(
        sourceData,
        targetData,
        collection,
        targetAccessToken,
        fieldsToRemove // Pass fields to remove
      );
    }

    console.log("Sync completed successfully.");
  } catch (error) {
    console.error("Error during sync:", error.message);
  }
})();
