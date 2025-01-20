import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, required: true, default: 'user' },
  permissions: { type: [String], default: [] },
  lastLogin: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  profileImage: { type: String },
  settings: {
    language: { type: String, default: 'en' },
    theme: { type: String, default: 'light' },
  },
});

export default model('User', userSchema);
