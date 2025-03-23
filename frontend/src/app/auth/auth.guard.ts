import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { UserDataService } from '../services/userdata.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard  {
  constructor(
    private authService: AuthService,
    private userDataService: UserDataService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> | boolean {
    const allowedRoles = route.data['allowedRoles'] as string[];

    // Prüfen, ob der Benutzer eingeloggt ist
    if (this.authService.isLoggedIn()) {
      // Wenn die Benutzerdaten nicht vorhanden sind, holen wir sie
      if (!this.userDataService.getUserData()) {
        return this.userDataService.fetchUserData().pipe(
          map((data) => {
            if (data && allowedRoles.includes(data.user.userType)) {
              return true;
            } else {
              this.handleAccessDenied(allowedRoles);
              return false;
            }
          })
        );
      }

      const userType = this.userDataService.getUserData()?.user.userType;
      if (userType && allowedRoles.includes(userType)) {
        return true;
      } else {
        this.handleAccessDenied(allowedRoles);
        return false;
      }
    } else {
      // Wenn der Benutzer nicht eingeloggt ist, Weiterleitung zur Login-Seite
      this.router.navigate(['/login']);
      return false;
    }
  }

  // Methode für die Handhabung des Zugriffs verweigert
  private handleAccessDenied(allowedRoles: string[]): void {
    // Ausloggen des Benutzers
    this.authService.logout();
    
    // Popup mit der Fehlermeldung anzeigen
    alert(`Zugriff verweigert! Erforderlicher Benutzer-Typ: ${this.getRequiredUserType(allowedRoles)}`);
    
    // Weiterleitung zur Login-Seite
    this.router.navigate(['/login']);
  }

  // Funktion, die den erforderlichen User-Typ für die Route anzeigt
  private getRequiredUserType(allowedRoles: string[]): string {
    // Hier wird der erste erlaubte User-Typ genommen, da es mehrere erlaubte Rollen geben könnte
    return allowedRoles.join(', ') || 'unbekannt';
  }
}
