import { Schema, model } from 'mongoose';

const loginResponseSchema = new Schema({
  success: { type: Boolean, required: true },
  message: { type: String, required: true },
  user: {
    username: { type: String, required: true },
    userType: { type: String, required: true },
    token: { type: String, required: true },
  },
});

export default model('LoginResponse', loginResponseSchema);
