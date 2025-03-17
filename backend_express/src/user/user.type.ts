import mongoose, { Document } from 'mongoose';

export interface User {
  id: string;
  username: string;
  password: string;
  roles: mongoose.Types.ObjectId[];
  permissions: string[];
}

export interface IUser extends Document {
  username: string;
  password: string;
  roles: mongoose.Types.ObjectId[];
}