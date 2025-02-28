import mongoose, { Document, Model, Schema } from 'mongoose';
import { comparePasswords, hashPassword } from '../utils/passwordUtils';

// Interface for User Document
export interface IUser extends Document {
  username: string;
  password: string;
  roles: mongoose.Types.ObjectId[];
  validatePassword(password: string): Promise<boolean>;
}

// Schema for User
const UserSchema: Schema<IUser> = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role" }] 
});

// Middleware to hash password before saving
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    this.password = await hashPassword(this.password);
    next();
  } catch (err: unknown) {
    next(err as mongoose.CallbackError);
  }
});

// Method to validate password
UserSchema.methods.validatePassword = async function (password: string): Promise<boolean> {
  return comparePasswords(password, this.password);
};

// Create and export the User model
const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
export default User;