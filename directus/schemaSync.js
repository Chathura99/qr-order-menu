const axios = require("axios");
const fs = require("fs");
const path = require("path");
require("dotenv").config(); // Load .env file

const sourceUrl = process.env.SOURCE;
const targetUrl = process.env.TARGET;
const sourceEmail = process.env.SOURCE_EMAIL;
const sourcePassword = process.env.SOURCE_PASSWORD;
const targetEmail = process.env.TARGET_EMAIL;
const targetPassword = process.env.TARGET_PASSWORD;

const versionFilePath = path.join(__dirname, "version.json");

// Read and update version number
function getNextVersion() {
  if (!fs.existsSync(versionFilePath)) {
    fs.writeFileSync(versionFilePath, JSON.stringify({ version: "0.0.1" }, null, 2));
    return "0.0.1";
  }

  const versionData = JSON.parse(fs.readFileSync(versionFilePath, "utf8"));
  const [major, minor, patch] = versionData.version.split(".").map(Number);
  
  let newPatch = patch + 1;
  let newMinor = minor;
  let newMajor = major;

  if (newPatch > 9) {
    newPatch = 0;
    newMinor += 1;
    if (newMinor > 9) {
      newMinor = 0;
      newMajor += 1;
    }
  }

  const newVersion = `${newMajor}.${newMinor}.${newPatch}`;
  fs.writeFileSync(versionFilePath, JSON.stringify({ version: newVersion }, null, 2));
  return newVersion;
}

async function authenticate(url, email, password) {
  try {
    const response = await axios.post(`${url}/auth/login`, {
      email,
      password,
    });
    return response.data.data.access_token;
  } catch (error) {
    console.error(
      "Error authenticating:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
}

async function getSchemaSnapshot(url, token) {
  try {
    const response = await axios.get(`${url}/schema/snapshot`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching schema snapshot:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
}

async function getSchemaDiff(url, token, schema) {
  try {
    const response = await axios.post(`${url}/schema/diff`, schema, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching schema diff:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
}

async function applySchemaDiff(url, token, hash, diff) {
  try {
    const response = await axios.post(
      `${url}/schema/apply`,
      { hash, diff },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error applying schema diff:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
}

async function migrateSchema() {
  try {
    // Step 1: Authenticate and get tokens for both environments
    const sourceToken = await authenticate(
      sourceUrl,
      sourceEmail,
      sourcePassword
    );
    const targetToken = await authenticate(
      targetUrl,
      targetEmail,
      targetPassword
    );

    // Step 2: Get schema snapshots from both environments
    const sourceSchema = await getSchemaSnapshot(sourceUrl, sourceToken);
    const targetSchema = await getSchemaSnapshot(targetUrl, targetToken);

    // Save source and target schemas to files
    const outputFolder = path.join(__dirname, "output");
    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder);
    }

    // Get the next version
    const version = "1.0";

    fs.writeFileSync(
      path.join(outputFolder, "source.json"),
      JSON.stringify({ version, ...sourceSchema }, null, 2)
    );
    fs.writeFileSync(
      path.join(outputFolder, "target.json"),
      JSON.stringify({ version, ...targetSchema }, null, 2)
    );

    // Step 3: Calculate the schema diff
    const diffResult = await getSchemaDiff(
      targetUrl,
      targetToken,
      sourceSchema.data
    );

    const { hash, diff } = diffResult.data;

    // Save the diff to a file
    fs.writeFileSync(
      path.join(outputFolder, "diff.json"),
      JSON.stringify({ version, ...diff }, null, 2)
    );

    // Log the list of collections in the schema diff
    console.log(
      "Collections in the diff:",
      diff.collections.map((c) => c.collection)
    );

    // Log the changes (diff) in collections, fields, and relations
    console.log("Collection Changes:", diff.collections);
    console.log("Field Changes:", diff.fields);
    console.log("Relation Changes:", diff.relations);
    console.log("---------------------------------------");
    // Log system collection changes for manual handling
    const systemCollections = diff.collections.filter((c) =>
      c.collection.startsWith("directus_")
    );
    if (systemCollections.length > 0) {
      console.log(
        "System collections changes (manual handling needed):",
        systemCollections
      );
    }

    // Filter out directus_ collections
    const filteredDiff = {
      ...diff,
      collections: diff.collections.filter(
        (c) => !c.collection.startsWith("directus_")
      ),
      fields: diff.fields.filter((f) => !f.collection.startsWith("directus_")),
      relations: diff.relations.filter(
        (r) => !r.collection.startsWith("directus_")
      ),
    };

    // Step 4: Apply the schema diff to the target environment
    if (
      filteredDiff.collections.length > 0 ||
      filteredDiff.fields.length > 0 ||
      filteredDiff.relations.length > 0
    ) {
      const applyResult = await applySchemaDiff(
        targetUrl,
        targetToken,
        hash,
        filteredDiff
      );
      console.log("Schema Applied:", applyResult);
    } else {
      console.log("No schema differences detected.");
    }
  } catch (error) {
    console.error("Error migrating schema:", error);
  }
}

migrateSchema();
