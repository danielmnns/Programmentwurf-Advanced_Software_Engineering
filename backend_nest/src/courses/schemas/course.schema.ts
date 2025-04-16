import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CourseDocument = Course & Document;

// Definiere ein Task-Dokument-Interface für die klare Struktur
export interface TaskDocument {
  taskId: string;
  name: string;
  description: string;
  documents: { name: string; fileId: string }[];
}

@Schema()
export class Course {
  @Prop({ required: true })
  title: string;

  @Prop({ default: '' })
  textContent: string;

  @Prop({ type: [{ name: String, fileId: String }] })
  documents: { name: string; fileId: string }[];

  @Prop({
    type: [{
      taskId: String,
      name: String,
      description: String,
      documents: [{ name: String, fileId: String }]
    }],
    default: []
  })
  tasks: TaskDocument[];

  @Prop({ type: [String], default: [] })
  participants: string[];
}

export const CourseSchema = SchemaFactory.createForClass(Course);