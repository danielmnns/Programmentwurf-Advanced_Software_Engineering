import { Schema, model } from 'mongoose';

const courseSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  enrolled: { type: Boolean, required: true, default: false },
}, {
  timestamps: true // Fügt automatisch createdAt und updatedAt Felder hinzu
});

export default model('Course', courseSchema);