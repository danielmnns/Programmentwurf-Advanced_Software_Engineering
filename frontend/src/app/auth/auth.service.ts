import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginResponse } from '../models/login-response.model'; // Importiere die Schnittstelle

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn = false;
  private userType: string | null = null;
  private userName: string | null = null;
  private token: string | null = null;

  constructor(private http: HttpClient) {}

  // Login-Methode, die die LoginResponse erwartet
  login(username: string, password: string): Observable<LoginResponse> {
    console.log('AuthService: Login gestartet');
    const payload = { username, password };
    return this.http.post<LoginResponse>('http://localhost:3000/api/login', payload).pipe(
      tap(response => {
        console.log('AuthService: Login-Antwort erhalten', response);

        // Überprüfe, ob response.user nicht undefined ist
        if (response.success && response.user) {
          this.loggedIn = true;
          this.userName = response.user.username || null; // Benutzername wird jetzt aus 'username' gesetzt
          this.userType = response.user.userType || null; // Benutzer-Typ korrekt zuweisen
          this.token = response.user.token || null; // Token setzen, falls vorhanden
          localStorage.setItem('token', this.token || ''); // Optionales Token in LocalStorage speichern
          console.log('AuthService: Benutzer eingeloggt', this.userType);
        } else {
          console.log('AuthService: Login fehlgeschlagen');
        }
      })
    );
  }

  // Gibt zurück, ob der Benutzer eingeloggt ist
  isLoggedIn(): boolean {
    console.log('AuthService: isLoggedIn aufgerufen', this.loggedIn);
    return this.loggedIn;
  }

  // Gibt den Benutzertyp zurück
  getUserType(): string | null {
    console.log('AuthService: getUserType aufgerufen', this.userType);
    return this.userType;
  }

  // Gibt den Benutzernamen zurück
  getUserName(): string | null {
    console.log('AuthService: getUserName aufgerufen', this.userName);
    return this.userName;
  }
}
