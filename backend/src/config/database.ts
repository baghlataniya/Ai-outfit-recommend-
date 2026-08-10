import mongoose from "mongoose";

export const connectDatabase = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/maison_noir";

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB: ${(error as Error).message}`);
    console.warn(`[Database Warning] Ensure MongoDB is running locally or set MONGODB_URI in backend/.env`);
    throw error;
  }
};
