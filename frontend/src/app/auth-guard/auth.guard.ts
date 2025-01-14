import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = JSON.parse(localStorage.getItem('userData') || '{}');

  if (!user || !user.role) {
    router.navigate(['/']); // Falls nicht eingeloggt → Login-Seite
    return false;
  }

  if (state.url.includes('verwalter-startseite') && (user.role === 'admin' || user.role === 'kursleiter')) {
    return true;
  }

  if (state.url.includes('startseite') && (user.role === 'dozent' || user.role === 'student')) {
    return true;
  }

  router.navigate(['/']); // Falls Rolle nicht passt → Login-Seite
  return false;
};
