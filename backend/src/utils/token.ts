import * as jwt from "jsonwebtoken";
import { SignOptions } from "jsonwebtoken";
import * as dotenv from "dotenv";
import { JwtPayload } from "./jwtPayload";

dotenv.config();

const ACCESS_SECRET: jwt.Secret = process.env.JWT_ACCESS_SECRET || "default-access-secret";
const REFRESH_SECRET: jwt.Secret = process.env.JWT_REFRESH_SECRET || "default-refresh-secret";

if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
  console.warn('JWT secrets not found in environment, using defaults');
}

export const generateAccessToken = (payload: JwtPayload): string => {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || "15m") as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, ACCESS_SECRET, options);
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || "7d") as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, REFRESH_SECRET, options);
};

