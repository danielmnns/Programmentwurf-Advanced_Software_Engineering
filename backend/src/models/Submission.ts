import { Schema, model } from 'mongoose';

const submissionSchema = new Schema({
  taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now }
});

export default model('Submission', submissionSchema);