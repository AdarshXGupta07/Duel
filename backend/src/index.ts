import dotenv from "dotenv";
import mongoose from "mongoose";
import http from "http";
import app from "./app";
import { initSocket } from "./socket/io"; // ✅ new

dotenv.config();

const PORT = Number(process.env.PORT) || 8000;

const startServer = async () => {
  try {
    // ✅ MongoDB connection (same as your code)
    const atlasUri = process.env.MONGODB_URI as string;

    console.log("Connecting to MongoDB Atlas...");

    let dbUri: string;
    if (atlasUri.includes("mongodb+srv://")) {
      // SRV URI format - append database name
      if (atlasUri.includes("?")) {
        dbUri = atlasUri.replace("?", "/Dev?");
      } else {
        dbUri = atlasUri + "/Dev";
      }
    } else {
      dbUri = atlasUri;
    }

    console.log("MongoDB URI:", dbUri.replace(/\/\/.*@/, "//***:***@"));

    await mongoose.connect(dbUri);
    console.log("✅ MongoDB connected");
    console.log("Database name:", mongoose.connection.name);

    // ✅ Create HTTP server from Express app
    const server = http.createServer(app);

    // ✅ Attach Socket.IO to the same server
    initSocket(server);

    // ✅ Start server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server failed to start", error);
    console.log("💡 Make sure your IP is whitelisted for MongoDB Atlas cluster");
    process.exit(1);
  }
};

startServer();