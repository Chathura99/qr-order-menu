require("dotenv").config();
const { exec } = require("child_process");
const { Client } = require("pg");
const fs = require("fs");

// Configuration from .env
const {
  SOURCE_HOST,
  SOURCE_PORT,
  SOURCE_DB,
  SOURCE_USER,
  TARGET_HOST,
  TARGET_PORT,
  TARGET_DB,
  TARGET_USER,
  TARGET_DB_PASSWORD,
} = process.env;

const DUMP_FILE = `UAT_directus_backup_flows_operations_${new Date()
  .toISOString()
  .replace(/[-T:.Z]/g, "")}.sql`;

// Function to execute shell commands with enhanced logging
const execPromise = (command) =>
  new Promise((resolve, reject) => {
    console.log(`Executing command: ${command}`);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Command failed: ${command}`);
        console.error(`Error: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        reject(error.message);
      } else {
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
        resolve(stdout);
      }
    });
  });

// Dump tables from the source database
const dumpTables = async () => {
  console.log("Dumping tables from source database...");
  const dumpCommand = `pg_dump --host=${SOURCE_HOST} --port=${SOURCE_PORT} --dbname=${SOURCE_DB} --username=${SOURCE_USER} --no-owner -t directus_flows -t directus_operations > ${DUMP_FILE}`;
  try {
    await execPromise(dumpCommand);
    console.log("Dump completed successfully.");
  } catch (error) {
    console.error(`Failed to dump tables: ${error}`);
    throw error;
  }
};

// Drop tables in the target database with CASCADE
const dropTables = async () => {
  console.log("Dropping tables in the target database...");
  const client = new Client({
    host: TARGET_HOST,
    port: TARGET_PORT,
    database: TARGET_DB,
    user: TARGET_USER,
    password: TARGET_DB_PASSWORD,
  });

  try {
    await client.connect();
    await client.query("DROP TABLE IF EXISTS directus_flows, directus_operations CASCADE;");
    console.log("Tables dropped successfully.");
  } catch (error) {
    console.error(`Failed to drop tables: ${error}`);
    throw error;
  } finally {
    await client.end();
  }
};

// Restore dump to the target database
const restoreDump = async () => {
  console.log("Restoring dump to the target database...");
  const restoreCommand = `psql --host=${TARGET_HOST} --port=${TARGET_PORT} --dbname=${TARGET_DB} --username=${TARGET_USER} -f ${DUMP_FILE}`;
  try {
    await execPromise(restoreCommand);
    console.log("Restore completed successfully.");
  } catch (error) {
    console.error(`Failed to restore dump: ${error}`);
    throw error;
  }
};

// Main function to execute the tasks
const main = async () => {
  try {
    await dumpTables();
    await dropTables();
    await restoreDump();
  } catch (error) {
    console.error(`Process failed: ${error}`);
  } finally {
    // Clean up dump file
    if (fs.existsSync(DUMP_FILE)) {
      console.log(`Cleaning up dump file: ${DUMP_FILE}`);
      fs.unlinkSync(DUMP_FILE);
      console.log("Dump file removed.");
    }
  }
};

main();
