export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    permissions: string[];
    profileImage?: string;
    settings: {
      language: string;
      theme: string;
    };
    lastLogin?: Date;
    createdAt?: Date;
    updatedAt?: Date;
  };
}