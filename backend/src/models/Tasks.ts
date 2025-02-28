import { Schema, model } from 'mongoose';

const taskSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  dueDate: { type: Date, required: true },
  createdDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['open', 'completed'], default: 'open' },
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'Student' },
  course: { type: Schema.Types.ObjectId, ref: 'Course' },
  attachments: [{ type: String }],
  grade: { type: Number, min: 0, max: 100 }
});

export default model('Task', taskSchema);