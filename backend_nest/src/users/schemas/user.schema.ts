import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  email: string;

  @Prop({ default: '' })
  firstName: string;

  @Prop({ default: '' })
  lastName: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Role' }] })
  roles: MongooseSchema.Types.ObjectId[];

  @Prop({ default: false })
  isOnline: boolean;

  @Prop({ default: Date.now })
  lastLogin: Date;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;

  @Prop({ default: null })
  profileImage: string;

  @Prop({
    type: {
      language: { type: String, default: 'de' },
      theme: { type: String, default: 'light' }
    },
    default: { language: 'de', theme: 'light' }
  })
  settings: {
    language: string;
    theme: string;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);

// Pre-save hook zum Hashen des Passworts
UserSchema.pre('save', async function(next) {
  const user = this as UserDocument;

  // Nur hashen, wenn das Passwort geändert wurde
  if (!user.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Methode zum Vergleichen von Passwörtern
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};