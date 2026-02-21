import { Socket } from "socket.io";
import jwt from "jsonwebtoken";

type JwtPayload = {
  id: string;
  email?: string;
  username?: string;
};

export const socketAuthMiddleware = (socket: Socket, next: (err?: any) => void) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("No token provided in socket handshake"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    // Attach user info to socket
    socket.data.user = { id: decoded.id, email: decoded.email, username: decoded.username };

    return next();
  } catch (err) {
    return next(new Error("Invalid token"));
  }
};