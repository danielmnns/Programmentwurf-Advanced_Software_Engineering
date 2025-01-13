import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // Router importieren

@Component({
  selector: 'app-account',
  standalone: true,
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css'],
  imports: [FormsModule]
})
export class AccountComponent {
  oldPassword: string = '';
  newPassword: string = '';

  constructor(private router: Router) {} // Router im Konstruktor einfügen

  // Passwort ändern
  onChangePassword(): void {
    console.log('Altes Passwort:', this.oldPassword);
    console.log('Neues Passwort:', this.newPassword);
    alert('Passwort erfolgreich geändert!');
    // Hier kannst du deine Logik für die Passwortänderung hinzufügen.
  }

  // Abmelden
  onLogout(): void {
    console.log('Benutzer abgemeldet');
    alert('Sie wurden abgemeldet.');

    // Hier könntest du den Nutzer-Login-Status zurücksetzen (z.B. aus einem AuthService)
    // this.authService.logout();

    // Weiterleitung zur Login-Seite
    this.router.navigate(['/login']);
  }

  navigateToHome(): void {
    this.router.navigate(['/startseite']); // Navigiert zur Startseite
  }
}
