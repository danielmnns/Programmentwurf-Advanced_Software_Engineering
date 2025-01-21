import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { UserDataService } from '../services/userdata.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private userDataService: UserDataService,
    private router: Router
  ) {}

  canActivate(): boolean | Observable<boolean> {
    if (this.authService.isLoggedIn()) {
      if (!this.userDataService.getUserData()) {
        return this.userDataService.fetchUserData().pipe(
          tap((data) => {
            if (!data) {
              this.router.navigate(['/login']);
            }
          }),
          tap(() => true)
        );
      }
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
