import * as jwt from "jsonwebtoken";
import asyncHandler from "../utils/Asynchandler";
import { ApiError } from "../utils/ApiError";
import {ApiResponse} from "../utils/ApiResponse";
import {User, MockUser} from "../models/user.models";
import {generateAccessToken,generateRefreshToken} from "../utils/token";
import { hashPassword, comparePasswords } from "../utils/hash";
import { Request, Response} from 'express';
import * as dotenv from "dotenv";
dotenv.config();

// Extend Request interface
declare global {
  namespace Express {
    interface Request {
      user?: import("../models/user.models").IUser;
    }
  }
}

const getCookieOptions = (maxAge?: number) => {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: maxAge || 7 * 24 * 60 * 60 * 1000, // 7 days default
  };
};

const registerUser = asyncHandler(async (req:Request, res:Response) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  // Use real User model for MongoDB
  const user = await User.create({
    username,
    email,
    password,
  });

  const safeUser = await User.findById(user._id).select("-password");

  if (!safeUser) {
    throw new ApiError(500, "Failed to create user");
  }

  // Generate tokens for auto-login after registration
  const accessToken = generateAccessToken({
    _id: safeUser._id.toString(),
    email: safeUser.email,
    username: safeUser.username,
    role: safeUser.role,
  });

  const refreshToken = generateRefreshToken({
    _id: safeUser._id.toString(),
    email: safeUser.email,
    username: safeUser.username,
    role: safeUser.role,
  });

  // Save refresh token
  await User.findByIdAndUpdate(safeUser._id, { refreshToken }, { validateBeforeSave: false });

  return res
    .status(201)
    .cookie("accessToken", accessToken, getCookieOptions(15 * 60 * 1000)) // 15 minutes
    .cookie("refreshToken", refreshToken, getCookieOptions()) // 7 days default
    .json(new ApiResponse(201, "User registered successfully", { user: safeUser, accessToken }));
  });

const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log('Login attempt for email:', email);

  if (!email || !password) {
    console.log('Missing email or password');
    throw new ApiError(400, "Email and password are required");
  }

  // Use real User model for MongoDB
  const normalizedEmail = email.trim().toLowerCase();
  
  const user = await User.findOne({ email: normalizedEmail }).select("+password");
  
  if (!user) {
    console.log('User not found with email:', normalizedEmail);
    throw new ApiError(401, "Invalid credentials");
  }

  console.log('User found, comparing password...');
  console.log('Input password:', password);
  console.log('Stored hash:', user.password);
  
  const isPasswordValid = await comparePasswords(password, user.password);
  console.log('Password comparison result:', isPasswordValid);

  if (!isPasswordValid) {
    console.log('Invalid password for user:', user.email);
    throw new ApiError(401, "Invalid credentials");
  }

  const accessToken = generateAccessToken({
    _id: user._id.toString(),
    email: user.email,
    username: user.username,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    _id: user._id.toString(),
    email: user.email,
    username: user.username,
    role: user.role
  });

  // save refresh token
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const loggedInUser = await User.findById(user._id).select("-password");

  return res
    .status(200)
    .cookie("accessToken", accessToken, getCookieOptions(15 * 60 * 1000)) // 15 minutes
    .cookie("refreshToken", refreshToken, getCookieOptions()) // 7 days default
    .json(
      new ApiResponse(
        200,
        "User logged in successfully",
        { user: loggedInUser, accessToken }
      )
    );
  });
const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  await User.findByIdAndUpdate(
    req.user!._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .clearCookie("accessToken", getCookieOptions())
    .clearCookie("refreshToken", getCookieOptions())
    .json(
      new ApiResponse(200, "User logged out successfully", {})
    );
});
const getCurrentUser = asyncHandler(async (req:Request, res:Response) => {
  const user = await User.findById(req.user!._id).select("-password");
  res.status(200).json(new ApiResponse(200, "User retrieved successfully", user));
});
const refreshToken=asyncHandler(async(req:Request,res:Response)=>{
  const incomingRefreshToken=req.cookies.refreshToken||req.header("Authorization")?.replace("Bearer ","");
  
  if(!incomingRefreshToken){
    throw new ApiError(401,"Unauthorized request");
  }
  
  try{
    const decoded=jwt.verify(incomingRefreshToken,process.env.JWT_REFRESH_SECRET!) as any;
    
    const user=await User.findById(decoded._id).select("-password");
    
    if(!user){
      throw new ApiError(401,"Invalid refresh token");
    }
    
    if(user.refreshToken!==incomingRefreshToken){
      throw new ApiError(401,"Refresh token is expired or used");
    }
    
    const accessToken=generateAccessToken({
      _id:user._id.toString(),
      email:user.email,
      username:user.username,
      role:user.role,
    });
    
    const newRefreshToken=generateRefreshToken({
      _id:user._id.toString(),
      email:user.email,
      username:user.username,
      role:user.role,
    });
    
    user.refreshToken=newRefreshToken;
    await user.save({validateBeforeSave:false});
    
    return res
      .status(200)
      .cookie("accessToken",accessToken,getCookieOptions(15*60*1000))
      .cookie("refreshToken",newRefreshToken,getCookieOptions())
      .json(new ApiResponse(200, "Access token refreshed", { accessToken, refreshToken: newRefreshToken }));
  }catch(error){
    throw new ApiError(401,"Invalid refresh token");
  }
});
const accessToken = asyncHandler(async (req:Request, res:Response) => {
  const user = await User.findById(req.user!._id).select("-password");
  res.status(200).json(new ApiResponse(200, "User retrieved successfully", user));
});
const updateUserProfile = asyncHandler(async(req:Request,res:Response)=>{
  const {username,email}=req.body;
  const currentUserId = req.user!._id;

  // Check if username already exists (excluding current user)
  if (username) {
    const existingUser = await User.findOne({ 
      username, 
      _id: { $ne: currentUserId } 
    });
    if (existingUser) {
      throw new ApiError(400, "Username already taken");
    }
  }

  // Check if email already exists (excluding current user)
  if (email) {
    const existingEmail = await User.findOne({ 
      email, 
      _id: { $ne: currentUserId } 
    });
    if (existingEmail) {
      throw new ApiError(400, "Email already registered");
    }
  }

  const user = await User.findByIdAndUpdate(
    currentUserId, 
    {username,email}, 
    {new:true}
  );
  
  res.status(200).json(new ApiResponse(200, "User profile updated successfully", user));
})
const updatePassword=asyncHandler(async(req:Request,res:Response)=>{
  const {oldPassword,newPassword}=req.body;
  
  if(!oldPassword || !newPassword){
    throw new ApiError(400,"Old password and new password are required");
  }
  
  const user=await User.findById(req.user!._id).select("+password");
  
  if(!user){
    throw new ApiError(404,"User not found");
  }
  
  const isOldPasswordValid=await comparePasswords(oldPassword,user.password);
  
  if(!isOldPasswordValid){
    throw new ApiError(401,"Invalid old password");
  }
  
  const hashedNewPassword=await hashPassword(newPassword);
  
  await User.findByIdAndUpdate(req.user!._id,{password:hashedNewPassword},{new:true});
  
  res.status(200).json(new ApiResponse(200, "Password updated successfully", {}));
})
const deleteUser=asyncHandler(async(req:Request,res:Response)=>{
  const user=await User.findByIdAndDelete(req.user!._id);
  res.status(200).json(new ApiResponse(200, "User deleted successfully", user));
})


export {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  refreshToken,
  accessToken,
  updateUserProfile,
  updatePassword,
  deleteUser
}
