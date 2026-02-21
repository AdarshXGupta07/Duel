import { Socket } from "socket.io";
import jwt from "jsonwebtoken";

type JwtPayload = {
  _id?: string;
  id?: string;
  email?: string;
  username?: string;
};

const getCookieToken = (cookieHeader?: string): string | null => {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((value) => value.trim());
  const accessTokenCookie = cookies.find((value) => value.startsWith("accessToken="));

  if (!accessTokenCookie) return null;
  return decodeURIComponent(accessTokenCookie.split("=").slice(1).join("="));
};

export const socketAuthMiddleware = (socket: Socket, next: (err?: any) => void) => {
  try {
    const tokenFromAuth = socket.handshake.auth?.token;
    const tokenFromCookie = getCookieToken(socket.handshake.headers.cookie);
    const token = tokenFromAuth || tokenFromCookie;

    if (!token) {
      return next(new Error("No access token provided in socket handshake"));
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as JwtPayload;
    const userId = decoded._id || decoded.id;

    if (!userId) {
      return next(new Error("Invalid token payload"));
    }

    // Attach user info to socket
    socket.data.user = { id: userId, email: decoded.email, username: decoded.username };

    return next();
  } catch (err) {
    return next(new Error("Invalid token"));
  }
};
