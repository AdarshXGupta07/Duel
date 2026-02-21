import { Server } from "socket.io";
import { socketAuthMiddleware } from "./auth.socket";
import { registerMatchmakingEvents } from "./matchmaking.socket";

export const initSocket = (server: any) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  // Add authentication middleware
  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id, "User ID:", socket.data.user?.id);

    // Register matchmaking events
    registerMatchmakingEvents(io, socket);

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
    });
  });

  return io;
};
