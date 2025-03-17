import { Schema, model } from 'mongoose';

const courseSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  dozent: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  enrolled: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }], default: [] },
  tasks: { type: [{ type: Schema.Types.ObjectId, ref: 'Task' }], default: [] },
  isVisible: { type: Boolean, default: true }, // Sichtbarkeit des Kurses
}, {
  timestamps: true // Fügt automatisch createdAt und updatedAt Felder hinzu
});

export default model('Course', courseSchema);