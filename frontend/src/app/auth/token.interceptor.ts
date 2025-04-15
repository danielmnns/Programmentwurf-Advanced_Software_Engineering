import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // JWT-Token aus dem LocalStorage abrufen
    const token = localStorage.getItem('token');
    
    // Wenn Token vorhanden, an alle HTTP-Anfragen anhängen
    if (token) {
      const cloned = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return next.handle(cloned).pipe(
        catchError((error: HttpErrorResponse) => {
          // Überprüfen, ob der Fehler mit dem JWT-Token zusammenhängt (401 - Unauthorized)
          if (error.status === 401) {
            console.log('Token abgelaufen oder ungültig. Benutzer wird abgemeldet.');
            this.authService.logout();
            this.router.navigate(['/login'], { 
              queryParams: { reason: 'expired' } 
            });
          }
          return throwError(error);
        })
      );
    }
    
    return next.handle(request);
  }
}