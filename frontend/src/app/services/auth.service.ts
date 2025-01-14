import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loginUrl = 'http://localhost:3000/auth/login';
  private userInfoUrl = 'http://localhost:3000/auth/user';

  constructor(private http: HttpClient) {}

  // Login-Methode zur Kommunikation mit dem Backend
  login(username: string, password: string): Observable<any> {
    const payload = { username, password };
    return this.http.post<any>(this.loginUrl, payload).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem('authToken', response.token);
        }
      })
    );
  }

  // Abrufen von Benutzerinformationen nach erfolgreichem Login
  getUserInfo(): Observable<any> {
    return this.http.get<any>(this.userInfoUrl).pipe(
      tap(userData => {
        if (userData) {
          localStorage.setItem('userData', JSON.stringify(userData)); // User-Daten speichern
        }
      })
    );
  }

  // Methode zum Abrufen des gespeicherten Benutzer-Typs
  getUserType(): string | null {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    return userData?.typ || null;
  }

  // Methode zum Abmelden (Daten löschen)
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  }
}
