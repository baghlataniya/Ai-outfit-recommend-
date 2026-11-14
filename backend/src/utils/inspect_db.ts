import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../../.env") });

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/maison_noir";

async function inspectDb() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  if (!db) {
    console.error("DB connection failed");
    return;
  }

  const users = await db.collection("users").find({}).toArray();
  console.log("=== USERS ===");
  users.forEach(u => {
    console.log(`User ID: ${u._id}, Email: ${u.email}, Name: ${u.firstName} ${u.lastName}, Role: ${u.role}`);
  });

  const carts = await db.collection("carts").find({}).toArray();
  console.log("\n=== CARTS ===");
  carts.forEach(c => {
    console.log(`Cart ID: ${c._id}, UserID: ${c.userId}`);
    console.log("Items:", JSON.stringify(c.items, null, 2));
  });

  await mongoose.disconnect();
}

inspectDb().catch(console.error);
