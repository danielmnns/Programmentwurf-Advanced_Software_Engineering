export interface User {
  id: string;
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