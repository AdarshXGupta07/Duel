import mongoose from "mongoose";

// Mock database for testing while MongoDB Atlas connection issues are resolved
const mockUsers: any[] = [];

export const connectDB = async () => {
  try {
    console.log('🧪 Using mock database for testing while Atlas connection is fixed...');
    console.log('📝 Note: Data will not persist between server restarts');
    console.log('💡 To persist data, fix MongoDB Atlas IP whitelist for cluster0.bibyp0r.mongodb.net');
    
    // Mock successful connection
    console.log("✅ Mock database connected");
    
    // Store mock users in global scope for testing
    (global as any).mockUsers = mockUsers;
    
  } catch (err) {
    console.error("❌ Database error:", err);
    process.exit(1);
  }
};
