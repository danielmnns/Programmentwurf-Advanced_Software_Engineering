import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private apiUrl = 'http://localhost:3000/api/global-data'; // Beispiel-URL
  private globalDataSubject = new BehaviorSubject<any>(null);
  globalData$ = this.globalDataSubject.asObservable();

  constructor(private http: HttpClient) {}

  getData(): Observable<any> {
    return this.http.get<any>(this.apiUrl).pipe(
      tap((data) => {
        this.globalDataSubject.next(data); // Aktualisiere den globalen Zustand
      })
    );
  }

  getCachedData(): any {
    return this.globalDataSubject.getValue();
  }
}
