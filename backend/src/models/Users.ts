import mongoose, { Document, Model, Schema } from 'mongoose';
import { generateSalt, hashPassword } from '../utils/passwordUtils';

// Interface for User Document
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  salt: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  profileImage?: string;
  settings: {
    language: string;
    theme: string;
  };
}

// Schema for User
const UserSchema: Schema<IUser> = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  salt: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, required: true },
  permissions: { type: [String], required: true },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  profileImage: { type: String },
  settings: {
    language: { type: String, required: true },
    theme: { type: String, required: true },
  },
});

// Middleware to hash password before saving
UserSchema.pre<IUser>('save', function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = generateSalt();
    this.password = hashPassword(this.password, salt);
    this.salt = salt;
    next();
  } catch (err: unknown) {
    next(err as mongoose.CallbackError);
  }
});

// Create and export the User model
const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
export default User;