import mongoose, { Document, Schema, CallbackError } from "mongoose";
import * as bcrypt from "bcryptjs";

// User interface
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  rating: number;
  role: "USER" | "ADMIN";
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Original Mongoose schema (for when MongoDB is fixed)
const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // never returned unless explicitly selected
    },

    rating: {
      type: Number,
      default: 1200,
    },

    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },

    refreshToken: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/* ================= PRE-SAVE HOOK ================= */

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

/* ================= INSTANCE METHODS ================= */

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Mock User class for testing
class MockUser {
  static async create(userData: any) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const newUser = {
      _id: Date.now().toString(),
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      role: "USER",
      rating: 1200,
      refreshToken: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...userData
    };
    
    const mockUsers = (global as any).mockUsers || [];
    mockUsers.push(newUser);
    return newUser;
  }
  
  static async findOne(query: any) {
    const mockUsers = (global as any).mockUsers || [];
    if (query.email) {
      return mockUsers.find((user: any) => user.email === query.email);
    }
    if (query.username) {
      return mockUsers.find((user: any) => user.username === query.username);
    }
    return null;
  }
  
  static async findById(id: string) {
    const mockUsers = (global as any).mockUsers || [];
    return mockUsers.find((user: any) => user._id === id);
  }
  
  static async findByIdAndUpdate(id: string, update: any, options: any = {}) {
    const mockUsers = (global as any).mockUsers || [];
    const userIndex = mockUsers.findIndex((user: any) => user._id === id);
    
    if (userIndex !== -1) {
      mockUsers[userIndex] = { ...mockUsers[userIndex], ...update, updatedAt: new Date() };
      return mockUsers[userIndex];
    }
    return null;
  }
  
  static select(fields: string) {
    // Mock select method - just return this for chaining
    return this;
  }
}

/* ================= MODEL ================= */

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema, "Addy");
export { MockUser };
