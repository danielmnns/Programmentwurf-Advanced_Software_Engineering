import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SubmissionDocument = Submission & Document;

// Schema für das Datei-Objekt
class FileData {
  name: string;
  url: string;
}

// Schema für das Feedback-Objekt
class FeedbackData {
  text: string;
  feedbackFrom: string;
  createdAt: Date;
}

@Schema({ timestamps: true })
export class Submission {
  @Prop({ required: true })
  userName: string;

  @Prop({ required: true })
  courseName: string;

  @Prop({ required: true })
  taskName: string;

  @Prop({ type: Object }) // Explizit den Typ als Object angeben
  file: FileData;

  @Prop({ type: Object }) // Explizit den Typ als Object angeben
  feedback: FeedbackData;

  @Prop({ default: false })
  isGraded: boolean;

  @Prop()
  grade: number;
}

export const SubmissionSchema = SchemaFactory.createForClass(Submission);