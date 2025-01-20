import { Schema, model } from 'mongoose';

const passwordChangeSchema = new Schema({
  userName: { type: String, required: true },
  passwordChangeSuccess: { type: Boolean, required: true },
});

export default model('PasswordChange', passwordChangeSchema);
