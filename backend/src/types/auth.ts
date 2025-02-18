export interface AuthRequestLogin {
  username: string;
  password: string;
  }

export interface AuthResponseLogin {
  success: boolean;
  message: string;
  token: string;
  user: {
    username: string;
    usertype: string;
  };
}


export interface AuthResponseRegister {
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
}

export interface AuthRequestChangePassword {
  username: string;
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface AuthResponseChangePassword {
  success: boolean;
  message: string;
}