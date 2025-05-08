import mongoose from "mongoose";

const Schema = mongoose.Schema;

const migrationQueueSchema = new Schema(
  {
    dataSource: {
      inboundApiCredentials: {
        apiUrl: {
          type: String,
          required: false
        },
        authentication: {
          username: {
            type: String,
            required: false
          },
          password: {
            type: String,
            required: false
          },
          token: {
            type: String,
            required: false
          }
        }
      },
      googleDriveUrl: {
        type: String,
        required: false
      },
      googleDriveUrlSecondary: {
        type: String,
        required: false
      }
    },
    filesToExecute: {
      platform: {
        type: String,
        required: true
      },
      parsers: {
        type: [String],
        required: false
      },
      services: {
        type: [String],
        required: false
      }
    },
    storeId: {
      type: String,
      required: true
    },
    dbUploadChunkSize: {
      type: Number,
      required: true
    },
    bulkUploadChunkSize: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      required: true,
      enum: ["PENDING", "DONE", "FAILED", "IN_PROGRESS"],
      default: "PENDING"
    },
    migrationStartedAt: {
      type: Date,
      required: false,
      default: null
    },
    migrationCompletedAt: {
      type: Date,
      required: false,
      default: null
    },
    migrationFailedAt: {
      type: Date,
      required: false,
      default: null
    },
    failureReason: {
      type: String,
      required: false,
      default: null
    },
    name: {
      type: String,
      required: false
    }
  },
  {
    timestamps: true
  }
);

export const MigrationQueue = mongoose.model(
  "MigrationQueue",
  migrationQueueSchema,
  "migration_queue"
);
