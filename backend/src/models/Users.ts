import * as bcrypt from 'bcrypt';
import mongoose, { Document, Model, Schema } from 'mongoose';

// Interface for User Document
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
  profileImage?: string;
  settings: {
    language: string;
    theme: string;
  };
  validatePassword(password: string): Promise<boolean>;
}

// Schema for User
const UserSchema: Schema<IUser> = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
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
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err: unknown) {
    next(err as mongoose.CallbackError);
  }
});

// Method to validate password
UserSchema.methods.validatePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

// Create and export the User model
const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
export default User;