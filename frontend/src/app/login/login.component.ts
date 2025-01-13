import { Component } from '@angular/core';
import { Router } from '@angular/router'; // Für die Navigation
import { FormsModule } from '@angular/forms'; // Für [(ngModel)] und ngForm
import { HttpClient, HttpClientModule } from '@angular/common/http'; // Für die Kommunikation mit dem Backend

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [FormsModule, HttpClientModule],
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  selectedLanguage: string = 'de'; // Standard: Deutsch

  constructor(private router: Router, private http: HttpClient) {}

  // Formular absenden
  onSubmit(): void {
    console.log('Anmeldung:');
    console.log('Benutzername:', this.username);
    console.log('Passwort:', this.password);

    // Dummy-Datenprüfung (Vorabprüfung)
    const users: { [key: string]: string } = {
      admin: 'cisco',
      kursleiter: 'cisco',
      student: 'cisco',
      dozent: 'cisco',
    };

    if (users[this.username] === this.password) {
      console.log('Login erfolgreich (Dummy-Datenprüfung)');
      this.router.navigate(['/startseite']);
    } else {
      console.log('Benutzername oder Passwort falsch (Dummy-Datenprüfung)');
      this.password = '';
      alert('Benutzername oder Passwort falsch'); // Popup-Meldung
      return; // Beende die Methode hier, um keine Backend-Anfrage zu senden
    }

    // API-URL (angepasst an dein Backend)
    const apiUrl = 'http://localhost:8080/api/login';

    // Login-Daten für den API-Aufruf
    const loginData = {
      username: this.username,
      password: this.password,
    };

    // POST-Anfrage an das Backend
    this.http.post(apiUrl, loginData).subscribe(
      (response: any) => {
        // Verarbeite die Backend-Antwort
        if (response.loginSuccess) {
          console.log('Login erfolgreich:', response.userType);
          // Je nach Benutzertyp auf die Startseite weiterleiten
          this.router.navigate(['/startseite']);
        } else {
          console.log('Ungültige Anmeldedaten');
          this.password = ''; // Passwortfeld leeren
          alert('Benutzername oder Passwort falsch'); // Popup-Meldung
        }
      },
      (error) => {
        console.error('Fehler bei der Anmeldung:', error);
        alert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
      }
    );
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
