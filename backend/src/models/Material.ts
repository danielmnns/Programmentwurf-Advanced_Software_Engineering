import { Schema, model } from 'mongoose';

const materialSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true }
});

export default model('Material', materialSchema);