import mongoose, { Schema, Document, Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

// Interface for User Document
interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
  profileImage?: string;
  settings: {
    language: string;
    theme: string;
  };
  validatePassword(password: string): Promise<boolean>;
}

// Schema Definition
const UserSchema: Schema<IUser> = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      default: 'user',
    },
    permissions: {
      type: [String],
      default: [],
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    profileImage: {
      type: String,
    },
    settings: {
      type: Object,
      default: {
        language: 'en',
        theme: 'light',
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Password Hashing Middleware
UserSchema.pre<IUser>('save', async function (next) {
  if (this.isModified('password')) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});

// Password Validation Method
UserSchema.methods.validatePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

// Model Creation
const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);

export default User;
