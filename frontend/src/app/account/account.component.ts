import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Für ngModel und Formulare

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
    // Hier könntest du den Nutzer zur Login-Seite weiterleiten:
    // z.B. this.router.navigate(['/login']);
  }
}
