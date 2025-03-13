export interface LoginResponse {
    success: boolean; // Gibt an, ob der Login erfolgreich war
    user?: {
      username: string; // Benutzername des eingeloggten Users
      userType: string; // Rolle des Benutzers (admin, student, etc.)
      token: string; // Authentifizierungstoken
    };
    message?: string; // Optionale Fehlermeldung oder Info
  }