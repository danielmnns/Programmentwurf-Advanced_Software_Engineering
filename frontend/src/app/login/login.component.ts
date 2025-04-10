import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { TranslatePipe } from '../pipes/translate.pipe';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    TranslatePipe
  ]
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(
    private authService: AuthService, 
    private router: Router,
    public languageService: LanguageService
  ) {}

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
