import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app";

dotenv.config();

const PORT = Number(process.env.PORT) || 8000;

const startServer = async () => {
  try {
    // Handle MongoDB connection directly in index.ts
    const atlasUri = process.env.MONGODB_URI as string;
    
    console.log('Connecting to MongoDB Atlas...');
    
    // For SRV URIs, append database name
    let dbUri;
    if (atlasUri.includes('mongodb+srv://')) {
      // SRV URI format - append database name
      if (atlasUri.includes('?')) {
        dbUri = atlasUri.replace('?', 'Dev?');
      } else {
        dbUri = atlasUri + '/Dev';
      }
    } else {
      // Regular URI format
      dbUri = atlasUri;
    }
    
    console.log('MongoDB URI:', dbUri.replace(/\/\/.*@/, '//***:***@'));
    
    await mongoose.connect(dbUri);
    console.log("✅ MongoDB connected");
    console.log('Database name:', mongoose.connection.name);

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server failed to start", error);
    console.log("💡 Make sure your IP is whitelisted for MongoDB Atlas cluster");
    process.exit(1);
  }
};

startServer();
