export interface AuthRequest {
  username: string;
  password: string;
  email?: string; // Optional für Login, erforderlich für Registrierung
  firstName?: string; // Optional für Login, erforderlich für Registrierung
  lastName?: string; // Optional für Login, erforderlich für Registrierung
  role?: string; // Optional für Login, erforderlich für Registrierung
  permissions?: string[]; // Optional für Login, erforderlich für Registrierung
  profileImage?: string; // Optional für Login, erforderlich für Registrierung
  settings?: {
    language: string;
    theme: string;
  }; // Optional für Login, erforderlich für Registrierung
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
  };
  inputPassword?: string;
  storedPassword?: string;
  error?: string;
}