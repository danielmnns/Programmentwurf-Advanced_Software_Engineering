import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UserDataService {
  private apiUrl = 'http://localhost:3000/api/userdata';
  private userDataSubject = new BehaviorSubject<any>(null);
  userData$ = this.userDataSubject.asObservable();

  constructor(private http: HttpClient) {
    this.restoreUserData();
  }

  private restoreUserData(): void {
    const storedData = sessionStorage.getItem('userData');
    if (storedData) {
      this.userDataSubject.next(JSON.parse(storedData));
    }
  }

  fetchUserData(): Observable<any> {
    return this.http.get<any>(this.apiUrl).pipe(
      tap((data) => {
        this.userDataSubject.next(data);
        sessionStorage.setItem('userData', JSON.stringify(data));
      })
    );
  }

  getUserData(): any {
    return this.userDataSubject.value;
  }

  clearUserData(): void {
    this.userDataSubject.next(null);
    sessionStorage.removeItem('userData');
  }
}
