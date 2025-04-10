import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { TranslatePipe } from '../pipes/translate.pipe';

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
export class AccountComponent {
  userName: string | null = '';
  oldPassword: string = '';
  newPassword: string = '';

  constructor(private authService: AuthService, private router: Router) {
    this.userName = this.authService.getUserName(); // Benutzername aus AuthService holen
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  changePassword(): void {
    if (!this.oldPassword || !this.newPassword) {
      alert('Bitte füllen Sie alle Felder aus.');
      return;
    }

    const payload = {
      userName: this.userName,
      password: this.oldPassword,
      newPassword: this.newPassword
    };

    this.authService.changePassword(payload).subscribe(
      (response) => {
        if (response.passwordChangeSuccess) {
          alert(`${this.userName} Ihr Passwort wurde geändert.\nSie werden nun ausgeloggt.`);
          this.router.navigate(['/']); // Weiterleitung nach erfolgreicher Änderung
        } else {
          alert(`Passwortänderung für Benutzer ${this.userName} fehlgeschlagen. Bitte überprüfen Sie Ihre Eingaben.`);
        }
      },
      (error) => {
        console.error('Fehler beim Ändern des Passworts:', error);
        alert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
      }
    );
  }
}

