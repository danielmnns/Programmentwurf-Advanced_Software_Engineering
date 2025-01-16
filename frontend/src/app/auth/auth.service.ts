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

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<LoginResponse> {
    console.log('AuthService: Login gestartet');
    const payload = { username, password };
    return this.http.post<LoginResponse>('http://localhost:3000/api/login', payload).pipe(
      tap(response => {
        console.log('AuthService: Login-Antwort erhalten', response);
        if (response.success) {
          this.loggedIn = true;
          this.userType = response.user?.userType || null;
          localStorage.setItem('token', response.user?.token || ''); // Optional
          console.log('AuthService: Benutzer eingeloggt', this.userType);
        } else {
          console.log('AuthService: Login fehlgeschlagen');
        }
      })
    );
  }

  isLoggedIn(): boolean {
    console.log('AuthService: isLoggedIn aufgerufen', this.loggedIn);
    return this.loggedIn;
  }

  getUserType(): string | null {
    console.log('AuthService: getUserType aufgerufen', this.userType);
    return this.userType;
  }
}
