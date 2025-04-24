import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TaskDocument = Task & Document;

// Definiere explizite Sub-Schemas für bessere Typisierung
@Schema()
class FileData {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  fileId: string;
}

@Schema()
class FeedbackData {
  @Prop({ required: true })
  text: string;

  @Prop({ required: true })
  feedbackFrom: string;
}

@Schema()
class SubmissionData {
  @Prop({ required: true })
  userName: string;

  @Prop({ type: FileData, required: true })
  file: FileData;

  @Prop()
  comment: string;

  @Prop({ type: FeedbackData })
  feedback?: FeedbackData;
}

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true })
  courseName: string;

  @Prop({ required: true })
  taskName: string;

  @Prop()
  taskDescription: string;

  @Prop({ type: [{ name: String, fileId: String }] })
  documents: { name: string; fileId: string }[];

  @Prop({ type: [SubmissionData], default: [] })
  submissions: SubmissionData[];
}

export const TaskSchema = SchemaFactory.createForClass(Task);