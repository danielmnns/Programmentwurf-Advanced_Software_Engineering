import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: any): boolean {
    const userType = this.authService.getUserType();
    const allowedRoles = route.data['roles'];

    if (this.authService.isAuthenticated() && allowedRoles.includes(userType)) {
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }
}
