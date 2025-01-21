import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginResponse } from '../models/login-response.model';
import { UserDataService } from '../services/userdata.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loggedIn = false;
  private userType: string | null = null;
  private userName: string | null = null;
  private token: string | null = null;

  constructor(private http: HttpClient, private userDataService: UserDataService) {
    this.restoreSession();
  }

  private restoreSession(): void {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    const userName = localStorage.getItem('userName');

    if (token) {
      this.loggedIn = true;
      this.token = token;
      this.userType = userType;
      this.userName = userName;
    }
  }

  login(username: string, password: string): Observable<LoginResponse> {
    console.log('AuthService: Login gestartet');
    const payload = { username, password };
    return this.http.post<LoginResponse>('http://localhost:3000/api/login', payload).pipe(
      tap((response) => {
        console.log('AuthService: Login-Antwort erhalten', response);

        if (response.success && response.user) {
          this.loggedIn = true;
          this.userName = response.user.username || null;
          this.userType = response.user.userType || null;
          this.token = response.user.token || null;

          localStorage.setItem('token', this.token || '');
          localStorage.setItem('userType', this.userType || '');
          localStorage.setItem('userName', this.userName || '');

          this.userDataService.fetchUserData().subscribe();
        } else {
          this.loggedIn = false;
        }
      })
    );
  }

  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  getUserType(): string | null {
    return this.userType;
  }

  getUserName(): string | null {
    return this.userName;
  }

  logout(): void {
    this.loggedIn = false;
    this.userType = null;
    this.token = null;

    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userName');
    this.userDataService.clearUserData();
  }

  changePassword(payload: { userName: string | null; password: string; newPassword: string }): Observable<{ passwordChangeSuccess: boolean }> {
    console.log('AuthService: Passwortänderung gestartet');
    return this.http.post<{ passwordChangeSuccess: boolean }>('http://localhost:3000/api/change-password', payload).pipe(
      tap((response) => {
        console.log('AuthService: Passwortänderung-Antwort erhalten', response);
      })
    );
  }
}
