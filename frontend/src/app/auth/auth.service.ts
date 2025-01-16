import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://your-backend-url.com/api';
  private user: { username: string; userType: string } | null = null;

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { username, password });
  }

  storeUserData(username: string, userType: string): void {
    this.user = { username, userType };
  }

  getUserType(): string | null {
    return this.user?.userType || null;
  }

  isAuthenticated(): boolean {
    return this.user !== null;
  }
}
