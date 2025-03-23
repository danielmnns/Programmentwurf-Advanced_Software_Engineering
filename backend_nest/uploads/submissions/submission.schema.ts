import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SubmissionDocument = Submission & Document;

@Schema({ timestamps: true })
export class Submission {
  @Prop({ required: true })
  userName: string;

  @Prop({ required: true })
  courseName: string;

  @Prop({ required: true })
  taskName: string;

  @Prop()
  file: {
    name: string;
    url: string;
  };

  @Prop()
  feedback: {
    text: string;
    feedbackFrom: string;
    createdAt: Date;
  };

  @Prop({ default: false })
  isGraded: boolean;

  @Prop()
  grade: number;
}

export const SubmissionSchema = SchemaFactory.createForClass(Submission);