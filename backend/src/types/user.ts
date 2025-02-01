export interface User {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'instructor';
    permissions?: string[];
    profileImage?: string;
    settings?: {
      language: string;
      theme: string;
    };
    createdAt?: Date;
    updatedAt?: Date;
  }