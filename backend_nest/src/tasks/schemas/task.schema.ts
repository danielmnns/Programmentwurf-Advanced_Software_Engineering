import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TaskDocument = Task & Document;

@Schema()
export class Task {
  @Prop({ required: true })
  courseName: string;

  @Prop({ required: true })
  taskName: string;

  @Prop()
  taskDescription: string;

  @Prop({ type: [{ name: String, url: String }] })
  documents: { name: string; url: string }[];

  @Prop({ type: Array })
  submissions: {
    userName: string;
    file: { name: string; url: string };
    feedback?: { 
      text: string;
      feedbackFrom: string;
    };
  }[];
}

export const TaskSchema = SchemaFactory.createForClass(Task);