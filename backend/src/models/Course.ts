import { Schema, model } from 'mongoose';

const courseSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  enrolled: { type: Boolean, required: true, default: false },
});

export default model('Course', courseSchema);
