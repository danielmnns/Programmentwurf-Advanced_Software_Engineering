import { Schema, model } from 'mongoose';

const userDataSchema = new Schema({
  success: { type: Boolean, required: true },
  user: {
    id: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: { type: String, required: true },
    permissions: { type: [String], required: true },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
    profileImage: { type: String },
    settings: {
      language: { type: String, default: 'en' },
      theme: { type: String, default: 'light' },
    },
  },
});

export default model('UserData', userDataSchema);
