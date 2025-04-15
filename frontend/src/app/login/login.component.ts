import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
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
export class LoginComponent implements OnInit {
  username: string = '';
  password: string = '';
  loginFailed: boolean = false;
  errorMessage: string = '';
  isLoading: boolean = false;
  infoMessage: string = '';

  constructor(
    private authService: AuthService, 
    private router: Router,
    private route: ActivatedRoute,
    public languageService: LanguageService
  ) {}

  ngOnInit(): void {
    // Nach URL-Parametern suchen
    this.route.queryParams.subscribe(params => {
      const reason = params['reason'];
      
      if (reason === 'inactivity') {
        this.infoMessage = 'Sie wurden aufgrund von Inaktivität automatisch abgemeldet.';
      } else if (reason === 'expired') {
        this.infoMessage = 'Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.';
      }
    });
  }

  onSubmit(): void {
    this.isLoading = true;
    this.loginFailed = false;
    this.infoMessage = ''; // Infomeldung bei neuem Login-Versuch ausblenden
    
    console.log('LoginComponent: Login-Formular abgeschickt');
    this.authService.login(this.username, this.password).subscribe(
      (response) => {
        this.isLoading = false;
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
            this.loginFailed = true;
            this.errorMessage = 'Unbekannter Benutzertyp.';
          }
        } else {
          console.log('LoginComponent: Login fehlgeschlagen');
          this.loginFailed = true;
          this.errorMessage = response.message || 'Login fehlgeschlagen. Bitte überprüfen Sie Ihre Anmeldedaten.';
        }
      },
      (error) => {
        this.isLoading = false;
        console.error('LoginComponent: Fehler beim Login', error);
        this.loginFailed = true;
        this.errorMessage = 'Login fehlgeschlagen. Bitte überprüfen Sie Ihre Anmeldedaten.';
      }
    );
  }
}