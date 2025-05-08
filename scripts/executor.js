import { MigrationQueue } from "../db/models/migrationQueue.js";
import { connectMongoDB, disconnectMongoDB } from "../db/database.js";
import { getPendingMigratingData } from "../helper/index.js";
import { log } from "console";
import { spawn } from "child_process";
let c = 0;
async function executeMigrationFile(file, type, env) {
  return new Promise((resolve, reject) => {
    let filePath = "";
    if (type === "parser") {
      filePath = `parsers/${file}`; // parsers/rays/index.js
    } else if (type === "service") {
      filePath = `services/${file}`; // services/rays/indexService.js
    } else {
      return reject(new Error(`Unknown file type: ${type}`));
    }

    console.log(`Executing file: ${filePath}`);
    c++;
    log(c);
    const process = spawn("node", [filePath], { env });

    process.stdout.on("data", (data) => {
      console.log(`=====> ${data}`);
    });

    process.stderr.on("data", (data) => {
      console.error(`Error: ${data}`);
    });

    process.on("close", (code) => {
      if (code !== 0) {
        return reject(
          new Error(`Execution failed for file ${file} with code ${code}`)
        );
      }
      resolve(`Execution completed for file ${file}`);
    });

    process.on("error", (err) => {
      reject(
        new Error(`Failed to start process for file ${file}: ${err.message}`)
      );
    });
  });
}

async function configureAndExecuteMigration() {
  await connectMongoDB();
  let migration = null;
  try {
    migration = await getPendingMigratingData();
    if (migration) {
      let r = await MigrationQueue.updateOne(
        { _id: migration._id },
        {
          $set: {
            status: "PENDING",
            migrationStartedAt: new Date(),
          },
        }
      ).exec();
      console.log(
        `Migration for store ${migration.storeId} marked as IN_PROGRESS`
      );
      const customEnv = {
        ...process.env,
        GOOGLE_DRIVE_URL: migration.dataSource?.googleDriveUrl,
        GOOGLE_DRIVE_URL_SECONDARY:
          migration.dataSource?.googleDriveUrlSecondary,
        INBOUND_API_URL: migration.dataSource?.inboundApiCredentials?.apiUrl,
        INBOUND_API_TOKEN:
          migration.dataSource?.inboundApiCredentials?.authentication?.token,
        STORE_ID: migration.storeId,
        DB_UPLOAD_CHUNK_SIZE: migration.dbUploadChunkSize,
        MIGRATION_ID: migration._id.toString(),
        BULK_UPLOAD_CHUNK_SIZE: migration.bulkUploadChunkSize,
      };
      const { platform, parsers, services } = migration.filesToExecute;

      if (parsers && parsers.length > 0) {
        for (const file of parsers) {
          await executeMigrationFile(
            `${platform}/${file}`, // rays/index.js
            "parser",
            customEnv
          );
        }
      } else {
        console.log("No parser files to execute for migration.");
      }

      if (services && services.length > 0) {
        for (const file of services) {
          let r = await executeMigrationFile(file, "service", customEnv);
          log(r);
        }
      } else {
        console.log("No service files to execute for migration.");
      }

      await MigrationQueue.updateOne(
        { _id: migration._id },
        {
          $set: {
            status: "PENDING",
            migrationCompletedAt: new Date(),
          },
        }
      ).exec();
      console.log(
        `Migration for store ${migration.storeId} completed successfully.`
      );
    } else {
      console.log(
        "No PENDING migration tasks found or a store's migration is already in progress."
      );
      await disconnectMongoDB();
    }
  } catch (err) {
    console.error("Error fetching or executing migration task:", err);
    if (migration) {
      try {
        await MigrationQueue.updateOne(
          { _id: migration._id },
          {
            $set: {
              status: "FAILED",
              migrationFailedAt: new Date(),
              failureReason: JSON.stringify(err),
            },
          }
        ).exec();
        console.log(
          `Migration for store ${migration.storeId} marked as FAILED.`
        );
      } catch (updateError) {
        console.error("Error updating migration failure status:", updateError);
      }
    }
    process.exit(1);
  } finally {
    await disconnectMongoDB();
  }
}

configureAndExecuteMigration();