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

  @Prop({ type: [{ name: String, fileId: String }] })
  documents: { name: string; fileId: string }[];

  @Prop({ type: Array })
  submissions: {
    userName: string;
    file: { name: string; fileId: string };
    feedback?: { 
      text: string;
      feedbackFrom: string;
    };
  }[];
}

export const TaskSchema = SchemaFactory.createForClass(Task);