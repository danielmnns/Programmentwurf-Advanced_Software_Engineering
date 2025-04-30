import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UserDataService {
  private apiUrl = 'http://localhost:3000/api/user/userdata';
  private userDataSubject = new BehaviorSubject<any>(null);
  userData$ = this.userDataSubject.asObservable();

  constructor(private http: HttpClient) {
    this.restoreUserData();
  }

  /* Stellt Benutzerdaten aus dem SessionStorage wieder her */
  private restoreUserData(): void {
    const storedData = sessionStorage.getItem('userData');
    if (storedData) {
      this.userDataSubject.next(JSON.parse(storedData));
    }
  }

  /* Holt aktuelle Benutzerdaten vom Server und speichert sie */
  fetchUserData(): Observable<any> {
    return this.http.get<any>(this.apiUrl).pipe(
      tap((data) => {
        this.userDataSubject.next(data);
        sessionStorage.setItem('userData', JSON.stringify(data));
      })
    );
  }

  /* Gibt die aktuellen Benutzerdaten zurück */
  getUserData(): any {
    return this.userDataSubject.value;
  }

  /* Löscht die Benutzerdaten beim Abmelden */
  clearUserData(): void {
    this.userDataSubject.next(null);
    sessionStorage.removeItem('userData');
  }
}
