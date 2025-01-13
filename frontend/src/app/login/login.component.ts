import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Für [(ngModel)] und ngForm

@Component({
  selector: 'app-login',
  standalone: true, // Standalone-Komponente
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [FormsModule] // FormsModule wird benötigt für ngModel
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  selectedLanguage: string = 'de'; // Standard: Deutsch

  // Formular absenden
  onSubmit(): void {
    console.log('Anmeldung:');
    console.log('Benutzername:', this.username);
    console.log('Passwort:', this.password);
  }

  // Sprache ändern
  changeLanguage(language: string): void {
    this.selectedLanguage = language;
    console.log('Sprache gewechselt zu:', this.selectedLanguage);
    // Hier kannst du weitere Logik hinzufügen
  }

 
}
