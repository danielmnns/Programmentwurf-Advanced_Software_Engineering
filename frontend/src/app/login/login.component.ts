import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    console.log('LoginComponent: Login-Formular abgeschickt');
    this.authService.login(this.username, this.password).subscribe(
      (response) => {
        console.log('LoginComponent: Login-Antwort erhalten', response);

        // Zusätzliche Prüfung auf response.user
        if (response.success && response.user && response.user.userType) {
          const userType = response.user.userType;
          console.log('LoginComponent: Weiterleitung für Benutzer-Typ', userType);

          if (userType === 'admin' || userType === 'studiengangsleiter') {
            this.router.navigate(['/admin-dashboard']);
          } else if (userType === 'student' || userType === 'dozent') {
            this.router.navigate(['/user-dashboard']);
          } else {
            console.log('LoginComponent: Unbekannter Benutzer-Typ');
          }
        } else {
          console.log('LoginComponent: Login fehlgeschlagen');
          alert(response.message);
        }
      },
      (error) => {
        console.error('LoginComponent: Fehler beim Login', error);
      }
    );
  }
}
