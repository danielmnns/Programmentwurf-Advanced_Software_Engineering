import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { TranslatePipe } from '../pipes/translate.pipe';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslatePipe
  ]
})
export class AccountComponent implements OnInit {
  userName: string | null = '';
  oldPassword: string = '';
  newPassword: string = '';
  successMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    public languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.userName = this.authService.getUserName(); /* Benutzernamen aus dem AuthService abrufen */
    
    if (!this.userName) {
      /* Zum Login weiterleiten, wenn nicht authentifiziert */
      this.router.navigate(['/login']);
    }
  }

  /* Benutzer abmelden und zur Login-Seite weiterleiten */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  /* Passwort des Benutzers ändern mit Validierung und Feedback */
  changePassword(): void {
    /* Statusmeldungen zurücksetzen */
    this.successMessage = '';
    this.errorMessage = '';
    
    if (!this.oldPassword || !this.newPassword) {
      this.errorMessage = 'Bitte füllen Sie alle Felder aus.';
      return;
    }
    
    /* Einfache Validierung der Passwortstärke */
    if (this.newPassword.length < 8) {
      this.errorMessage = 'Das neue Passwort muss mindestens 8 Zeichen lang sein.';
      return;
    }

    this.isLoading = true;
    const payload = {
      userName: this.userName,
      password: this.oldPassword,
      newPassword: this.newPassword
    };

    this.authService.changePassword(payload).subscribe(
      (response) => {
        this.isLoading = false;
        if (response.passwordChangeSuccess) {
          this.successMessage = 'Ihr Passwort wurde erfolgreich geändert.';
          /* Passwortfelder leeren */
          this.oldPassword = '';
          this.newPassword = '';
          
          /* Verzögerte Abmeldung nach erfolgreicher Änderung */
          setTimeout(() => {
            this.logout();
          }, 3000);
        } else {
          this.errorMessage = 'Passwortänderung fehlgeschlagen. Bitte überprüfen Sie Ihre Eingaben.';
        }
      },
      (error) => {
        this.isLoading = false;
        console.error('Fehler beim Ändern des Passworts:', error);
        this.errorMessage = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
      }
    );
  }
  
  /* Hilfsmethode zur Beurteilung der Passwortstärke */
  getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
    if (!password || password.length < 8) {
      return 'weak';
    }
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const passedChecks = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
    
    if (password.length >= 12 && passedChecks >= 3) {
      return 'strong';
    } else if (password.length >= 8 && passedChecks >= 2) {
      return 'medium';
    }
    
    return 'weak';
  }
}

