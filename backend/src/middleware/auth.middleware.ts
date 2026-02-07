import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError';
import { User } from '../models/user.models';

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.accessToken || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new ApiError(401, 'Access token required');
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as any;
    const user = await User.findById(decoded._id).select('-password');

    if (!user) {
      throw new ApiError(401, 'Invalid token - user not found');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new ApiError(401, 'Invalid token'));
    } else {
      next(error);
    }
  }
};
