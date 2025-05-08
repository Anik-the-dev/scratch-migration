import { MigrationQueue } from "../db/models/migrationQueue.js";
export const getPendingMigratingData = async () => {
    const result = await MigrationQueue.aggregate([
      {
        $match: { status: "PENDING" }
      },
      {
        $sort: { _id: -1 }
      },
      {
        $limit: 1
      },
      {
        $lookup: {
          from: "migration_queue",
          localField: "storeId",
          foreignField: "storeId",
          pipeline: [{ $match: { status: "IN_PROGRESS" } }, { $limit: 1 }],
          as: "inProgressCheck"
        }
      },
      {
        $match: {
          inProgressCheck: { $size: 0 }
        }
      },
      {
        $project: {
          _id: 0,
          pendingDoc: "$$ROOT"
        }
      }
    ]);
  
    if (result && result.length > 0) {
      const data = {
        ...result[0].pendingDoc
      };
      delete data.dataSource;
      console.log("Pending Migration:", data);
      return result[0].pendingDoc;
    } else {
      console.log("No Pending Migration found.");
      return null;
    }
  };