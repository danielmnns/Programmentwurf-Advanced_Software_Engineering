import { Schema, model } from 'mongoose';

const enrollmentSchema = new Schema({
  username: { type: String, required: true },
  courseName: { type: String, required: true },
  enrolled: { type: Boolean, required: true },
  message: { type: String, required: true },
});

export default model('Enrollment', enrollmentSchema);
