require("dotenv").config();
const sql = require("mssql");

// Load environment variables
const {
  SOURCE_HOST,
  SOURCE_PORT,
  SOURCE_DB,
  SOURCE_USER,
  SOURCE_DB_PASSWORD,
  TARGET_HOST,
  TARGET_PORT,
  TARGET_DB,
  TARGET_USER,
  TARGET_DB_PASSWORD,
} = process.env;

// Connection function
const connect = async ({ name, user, password, server, port, database }) => {
  try {
    console.log(`🔄 Connecting to ${name} database...`);
    await sql.connect({
      user,
      password,
      server,
      port: Number(port),
      database,
      options: {
        encrypt: true,
        trustServerCertificate: false,
      },
    });
    console.log(`✅ Successfully connected to ${name} database`);
  } catch (err) {
    console.error(`❌ Failed to connect to ${name} database:`, err.message);
  } finally {
    await sql.close(); // Always close the connection
  }
};

// Main check
(async () => {
  await connect({
    name: "SOURCE",
    user: SOURCE_USER,
    password: SOURCE_DB_PASSWORD,
    server: SOURCE_HOST,
    port: SOURCE_PORT,
    database: SOURCE_DB,
  });

  await connect({
    name: "TARGET",
    user: TARGET_USER,
    password: TARGET_DB_PASSWORD,
    server: TARGET_HOST,
    port: TARGET_PORT,
    database: TARGET_DB,
  });
})();
