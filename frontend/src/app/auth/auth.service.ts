import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth/login'; // Backend-URL
  private username: string = ''; // Speichern des Benutzernamens

  constructor(private http: HttpClient) {}

  // Login-Methode zur Kommunikation mit dem Backend
  login(username: string, password: string): Observable<any> {
    const payload = { username, password };
    return this.http.post<any>(this.apiUrl, payload);
  }

  // Setzen des Benutzernamens nach erfolgreichem Login
  setUsername(username: string): void {
    this.username = username;
  }

  // Abrufen des Benutzernamens
  getUsername(): string {
    return this.username;
  }
}


