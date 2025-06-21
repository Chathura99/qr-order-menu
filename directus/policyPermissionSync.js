const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const os = require("os");
const path = require("path");
require("dotenv").config();

const {
  SOURCE,
  TARGET,
  SOURCE_EMAIL,
  SOURCE_PASSWORD,
  TARGET_EMAIL,
  TARGET_PASSWORD,
} = process.env;

// Authenticate and return access token
async function authenticate(baseURL, email, password) {
  const response = await axios.post(`${baseURL}/auth/login`, {
    email,
    password,
  });
  return response.data.data.access_token;
}

// Fetch policies from source
async function fetchPolicies(sourceToken) {
  const fields =
    "admin_access,app_access,description,enforce_tfa,icon,id,ip_access,name,permissions.action,permissions.collection,permissions.fields,permissions.id";
  const response = await axios.get(
    `${SOURCE}/policies?fields=${fields}&export=json`,
    {
      headers: {
        Authorization: `Bearer ${sourceToken}`,
      },
    }
  );
  return response.data;
}

// Push policies to target as file upload
async function pushPolicies(targetToken, policies) {
  // Create temporary JSON file
  const tempFilePath = path.join(os.tmpdir(), `policies-${Date.now()}.json`);
  fs.writeFileSync(tempFilePath, JSON.stringify(policies, null, 2));

  const form = new FormData();
  form.append("file", fs.createReadStream(tempFilePath));

  const response = await axios.post(
    `${TARGET}/utils/import/directus_policies`,
    form,
    {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${targetToken}`,
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    }
  );

  // Cleanup temp file
  fs.unlinkSync(tempFilePath);

  console.log("✅ Policies successfully synced to the target.");
}

// Main
(async () => {
  try {
    console.log("🔐 Authenticating...");
    const sourceToken = await authenticate(
      SOURCE,
      SOURCE_EMAIL,
      SOURCE_PASSWORD
    );
    const targetToken = await authenticate(
      TARGET,
      TARGET_EMAIL,
      TARGET_PASSWORD
    );

    console.log("📥 Fetching policies from source...");
    const policies = await fetchPolicies(sourceToken);

    console.log("📤 Pushing policies to target...");
    await pushPolicies(targetToken, policies);
  } catch (error) {
    console.error(
      "❌ Error during policy sync:",
      error.response ? error.response.data : error.message
    );
  }
})();
