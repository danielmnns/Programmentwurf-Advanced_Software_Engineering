import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserDataService } from '../services/userdata.service';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const userDataService = inject(UserDataService);

  // Get allowed roles from route data
  const allowedRoles = route.data?.['allowedRoles'];

  // Check if user is logged in and has appropriate role
  if (authService.isLoggedIn()) {
    const userType = authService.getUserType();

    if (allowedRoles && allowedRoles.length) {
      // Check if user has one of the allowed roles
      if (allowedRoles.includes(userType)) {
        return true;
      } else {
        // Redirect based on user type if not authorized for this route
        if (userType === 'admin' || userType === 'studiengangsleiter') {
          router.navigate(['/admin-dashboard']);
        } else {
          router.navigate(['/user-dashboard']);
        }
        return false;
      }
    }
    return true;
  }

  // Not logged in, redirect to login
  router.navigate(['/login']);
  return false;
};
