import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../../.env") });

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/maison_noir";

async function cleanStaleCarts() {
  console.log("[Clean Carts] Connecting to MongoDB...");
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  if (!db) {
    console.error("DB connection failed");
    return;
  }

  // Clear inflated cart items for dev accounts
  const result = await db.collection("carts").updateMany({}, { $set: { items: [] } });
  console.log(`[Clean Carts] Reset ${result.modifiedCount} carts in MongoDB to empty items.`);

  await mongoose.disconnect();
  console.log("[Clean Carts] Done.");
}

cleanStaleCarts().catch(console.error);
