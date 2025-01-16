import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    console.log('AuthGuard: canActivate überprüft');
    if (this.authService.isLoggedIn()) {
      const userType = this.authService.getUserType();
      console.log('AuthGuard: Benutzer eingeloggt als', userType);
      return true;
    } else {
      console.log('AuthGuard: Benutzer nicht eingeloggt, Weiterleitung zur Login-Seite');
      this.router.navigate(['/login']);
      return false;
    }
  }
}
