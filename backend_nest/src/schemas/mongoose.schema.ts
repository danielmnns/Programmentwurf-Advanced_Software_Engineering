import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  email: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop({ enum: ['admin', 'studiengangsleiter', 'dozent', 'student'], default: 'student' })
  userType: string;

  @Prop()
  token: string;

  @Prop({ default: false })
  isOnline: boolean;

  @Prop({ type: Object })
  settings: {
    language: string;
    theme: string;
  };

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Role' }] })
  roles: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);

// Pre-save Hook zum Hashen des Passworts
UserSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});