import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

import app from "./app";
import { connectDatabase } from "./config/database";

const PORT = process.env.PORT || 5001;

// Start Server & Database Connection
const startServer = async () => {
  try {
    await connectDatabase();

    const server = app.listen(PORT, () => {
      console.log(`==================================================`);
      console.log(`  MAISON NOIR API SERVER IS RUNNING              `);
      console.log(`  Environment: ${process.env.NODE_ENV || "development"}    `);
      console.log(`  Port:        ${PORT}                           `);
      console.log(`  Health Check: http://localhost:${PORT}/api/health`);
      console.log(`==================================================`);
    });

    process.on("unhandledRejection", (err: Error) => {
      console.error("[Unhandled Rejection]", err);
      server.close(() => process.exit(1));
    });

    process.on("uncaughtException", (err: Error) => {
      console.error("[Uncaught Exception]", err);
      process.exit(1);
    });
  } catch (error) {
    console.error("[Startup Error] Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
