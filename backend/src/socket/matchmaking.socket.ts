import { Server, Socket } from "socket.io";

// In-memory queue (hackathon MVP)
type QueuedUser = {
  userId: string;
  socketId: string;
  queuedAt: number;
};

const queue: QueuedUser[] = [];

function removeFromQueueByUserId(userId: string) {
  const idx = queue.findIndex((q) => q.userId === userId);
  if (idx !== -1) queue.splice(idx, 1);
}

export const registerMatchmakingEvents = (io: Server, socket: Socket) => {
  const userId = socket.data.user?.id as string;

  // ✅ Find match
  socket.on("matchmaking:find", async () => {
    if (!userId) return;

    // prevent duplicates
    removeFromQueueByUserId(userId);

    // If someone is waiting, match them
    const opponent = queue.shift();

    if (!opponent) {
      queue.push({ userId, socketId: socket.id, queuedAt: Date.now() });
      socket.emit("matchmaking:queued", { message: "Searching for opponent..." });
      console.log(`🟡 Queued user ${userId}. Queue size=${queue.length}`);
      return;
    }

    // If opponent socket disconnected, ignore & re-queue yourself
    const opponentSocket = io.sockets.sockets.get(opponent.socketId);
    if (!opponentSocket) {
      console.log(`⚠️ Opponent socket missing. Re-queue user ${userId}`);
      queue.push({ userId, socketId: socket.id, queuedAt: Date.now() });
      socket.emit("matchmaking:queued", { message: "Searching for opponent..." });
      return;
    }

    // ✅ Create a duelId (for MVP). Later replace with DB duel create.
    const duelId = `duel_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const room = `duel:${duelId}`;

    // join room
    socket.join(room);
    opponentSocket.join(room);

    // notify both
    socket.emit("matchmaking:found", {
      duelId,
      opponentId: opponent.userId,
    });

    opponentSocket.emit("matchmaking:found", {
      duelId,
      opponentId: userId,
    });

    console.log(`🟢 Match found: ${userId} vs ${opponent.userId} duelId=${duelId}`);
  });

  // ✅ Cancel matchmaking
  socket.on("matchmaking:cancel", () => {
    if (!userId) return;
    removeFromQueueByUserId(userId);
    socket.emit("matchmaking:cancelled", { message: "Matchmaking cancelled" });
    console.log(`🔴 Cancel matchmaking: userId=${userId}`);
  });

  // ✅ On disconnect, remove from queue
  socket.on("disconnect", () => {
    if (!userId) return;
    removeFromQueueByUserId(userId);
  });
};