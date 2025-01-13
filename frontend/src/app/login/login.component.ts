import { Component } from '@angular/core';
import { Router } from '@angular/router'; // Für die Navigation
import { FormsModule } from '@angular/forms'; // Für [(ngModel)] und ngForm

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [FormsModule],
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  selectedLanguage: string = 'de'; // Standard: Deutsch

  constructor(private router: Router) {}

  // Formular absenden
  onSubmit(): void {
    console.log('Anmeldung:');
    console.log('Benutzername:', this.username);
    console.log('Passwort:', this.password);

    // Dummy-Datenprüfung
    const users: { [key: string]: string } = {
      admin: 'cisco',
      kursleiter: 'cisco',
      student: 'cisco',
      dozent: 'cisco',
    };

    if (users[this.username] === this.password) {
      console.log('Login erfolgreich');
      this.router.navigate(['/startseite']);
    } else {
      console.log('Ungültige Anmeldedaten');
      this.password = '';
      alert('Benutzername oder Passwort falsch'); // Popup-Meldung
    }
  }

  // Sprache ändern
  changeLanguage(language: string): void {
    this.selectedLanguage = language;
    console.log('Sprache gewechselt zu:', this.selectedLanguage);
    // Hier kannst du weitere Logik hinzufügen
  }

  // Registrieren-Button
  onRegister(): void {
    console.log('Registrierung aufgerufen');
    // Hier kannst du eine Weiterleitung zur Registrierungsseite einfügen
    // z.B.: this.router.navigate(['/register']);
  }
}
