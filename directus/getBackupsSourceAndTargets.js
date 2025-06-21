require("dotenv").config();
const { exec } = require("child_process");

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
} = process.env;

const getTimestamp = () => new Date().toISOString().replace(/[-T:.Z]/g, "");

const SOURCE_DUMP_FILE = `backup_${getTimestamp()}_source.sql`;
const TARGET_DUMP_FILE = `backup_${getTimestamp()}_target.sql`;

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

// Function to dump a database, excluding specified tables
const dumpDatabase = async (host, port, dbname, username, dumpFile) => {
  const dumpCommand = `pg_dump --host=${host} --port=${port} --dbname=${dbname} --username=${username} --no-owner --exclude-table-data=directus_activity --exclude-table-data=directus_revision > ${dumpFile}`;
  try {
    await execPromise(dumpCommand);
    console.log(`Dump of ${dbname} completed successfully. File: ${dumpFile}`);
  } catch (error) {
    console.error(`Failed to dump ${dbname}: ${error}`);
    throw error;
  }
};

// Main function to create backups of both databases
const main = async () => {
  try {
    // Dump the source database
    await dumpDatabase(SOURCE_HOST, SOURCE_PORT, SOURCE_DB, SOURCE_USER, SOURCE_DUMP_FILE);

    // Dump the target database
    await dumpDatabase(TARGET_HOST, TARGET_PORT, TARGET_DB, TARGET_USER, TARGET_DUMP_FILE);
  } catch (error) {
    console.error(`Backup process failed: ${error}`);
  }
};

main();
