import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CourseDocument = Course & Document;

@Schema()
export class Course {
  @Prop({ required: true })
  title: string;

  @Prop()
  textContent: string;

  @Prop({ type: [String] })
  participants: string[];

  @Prop({ type: [{ name: String, url: String }] })
  documents: { name: string; url: string }[];

  @Prop({ 
    type: [{ 
      taskId: String, 
      name: String, 
      description: String, 
      documents: [{ name: String, url: String }] 
    }] 
  })
  tasks: {
    taskId: string;
    name: string;
    description: string;
    documents: { name: string; url: string }[];
  }[];
  
}

export const CourseSchema = SchemaFactory.createForClass(Course);