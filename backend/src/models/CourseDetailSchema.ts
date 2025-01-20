import { Schema, model, Document } from 'mongoose';

interface DocumentDetails {
  name: string;
  url: string;
}

interface CourseDetail extends Document {
  courseName: string;
  textContent: string;
  aufgabeContent: string;
  feedbackContent: string;
  participants: string[];
  documents: DocumentDetails[];
  aufgaben: DocumentDetails[];
  abgaben: DocumentDetails[];
}

const DocumentSchema = new Schema<DocumentDetails>({
  name: { type: String, required: true },
  url: { type: String, required: true },
});

const CourseDetailSchema = new Schema<CourseDetail>({
  courseName: { type: String, required: true, unique: true },
  textContent: { type: String, required: true },
  aufgabeContent: { type: String, required: true },
  feedbackContent: { type: String, required: true },
  participants: { type: [String], required: true },
  documents: { type: [DocumentSchema], default: [] },
  aufgaben: { type: [DocumentSchema], default: [] },
  abgaben: { type: [DocumentSchema], default: [] },
});

export default model<CourseDetail>('CourseDetail', CourseDetailSchema);
