🔄 Directus Sync & Backup Scripts
This repository contains a set of powerful Node.js scripts to sync schema, migrate data, and perform PostgreSQL backups between source and target Directus environments. These tools help automate migrations, configuration syncing, and backups with both API-level and SQL-level approaches.

📁 Script Overview

1. schemaSync.js – 🔧 Schema Synchronization (Deprecated: Use Directus migration process)

   Syncs all collection structures from source to target.

   Uses Directus /schema/diff and /schema/snapshot endpoints.

   Ensures schema consistency without modifying existing data.

   ⚠️ Recommended to use Directus migration files instead.

2. syncCollections.js – 🔄 Sync New Entries Only

   Syncs only newly added entries for specified collections (e.g., notification_configs, system_configuration).

   Keeps client-side modified values (like email body) intact.

   Does not modify existing data.

   Utilizes the Directus API.

3. dropAllFlowsAndOperationsAndPush.js – 💣 Full Flow & Operation Sync (Deprecated: Use Directus migration process)

   Drops and restores the flows and operations tables at SQL level.

   Uses PostgreSQL commands to drop and restore tables.

⚠️ Use with caution – this will delete all existing data in those tables.

4. selectedFlowPush.js – ✅ Selective Flow Sync

   Prompts to select a specific flow from a list.

   Syncs only the selected flow and its related operations.

   Adds or updates entries as needed using Directus API.

   Safer and more dynamic than full-table replacements.

5. syncConfigurations.js – ⚙️ General-Purpose Collection Sync

   Syncs any collection you choose.

   Prompts for:

   Collection name

   Fields to skip (optional)

   Adds missing data and updates existing entries.

   Ideal for syncing configuration tables.

6. getBackupsSourceAndTargets.js – 💾 PostgreSQL Backup Script

   Creates database backups for both source and target environments.

   Uses pg_dump and pg_restore.

   Names files with timestamp for easy tracking.

   ⚠️ Ensure correct DB credentials are set in .env.

7. policyPermissionSync.js – 🔐 Policy & Permission Sync

   Fetches policies and permissions from source using the Directus API.

   Uploads them to the target via the /utils/import/directus_policies endpoint.

   Automatically converts the export into a file and sends it via multipart/form-data.

⚙️ Setup

1. Install Dependencies

   npm install

2. Configure Environments
   Create a .env file in the root folder with the following variables:

# Source and target environments

    SOURCE=http://192.168.0.72:8058
    TARGET=http://192.168.0.72:8059

# Source credentials

    SOURCE_EMAIL=admin@example.com
    SOURCE_PASSWORD=admin123

# Target credentials

    TARGET_EMAIL=admin@example.com
    TARGET_PASSWORD=admin123

# Source DB credentials

    SOURCE_HOST=localhost
    SOURCE_PORT=5432
    SOURCE_DB=directus_source
    SOURCE_USER=postgres
    SOURCE_DB_PASSWORD=yourpassword

# Target DB credentials

    TARGET_HOST=localhost
    TARGET_PORT=5432
    TARGET_DB=directus_target
    TARGET_USER=postgres
    TARGET_DB_PASSWORD=yourpassword

🚀 Usage

Run any script using Node.js:

    node schemaSync.js
    node syncCollections.js
    node dropAllFlowsAndOperationsAndPush.js
    node selectedFlowPush.js
    node syncConfigurations.js
    node getBackupsSourceAndTargets.js
    node policyPermissionSync.js

# Extensions

1. Schema Sync
2. Extension Sync
3. Migration Bundle
4. Firebase Notification

{
"msg_obj": {
"tokens": [
"fM-Jhsco2vF6GZOUKUFoGj:APA91bG0w-1cpSSPNPDM6qWfu9Fb45oeU7ATifs8wFQweusxjIxrc1x5T3yFgewtv3ig8EVVCEU0_4ZChWAUXH1EYdwvbyAaMO_IGNiwqWWeAZgf7TlC78AaM5iZfIJRkmeVgHqRRTmw",
],
"notification": {
"title": "Remote Lab Test - Assigned to Operator",
"body": "'Reference Number: REFLT0000371, Remote Lab Test request has been assigned to the operations team.",
"image": "null"
},
"data": {},
"apns": {
"payload": {
"aps": {
"content-available": 1
}
},
"headers": {
"apns-priority": "5"
}
}
}
}


{
  "title": "Hello!",
  "body": "This is a test notification.",
  "tokens": [
    "your_device_handle_1",
    "your_device_handle_2"
  ],
  "data": {
    "customKey": "customValue"
  }
}
