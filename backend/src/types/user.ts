export interface User {
  id: string;
  salt?: string;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'instructor';
  permissions: string[];
  profileImage?: string;
  settings: {
    language: string;
    theme: string;
  };
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUser {
  username: string;
  email: string;
  password: string;
  salt: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  profileImage?: string;
  settings: {
    language: string;
    theme: string;
  };
}