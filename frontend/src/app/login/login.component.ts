import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Importieren für ngModel und ngForm

@Component({
  selector: 'app-login',
  standalone: true, // Standalone-Komponente
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [FormsModule] // FormsModule direkt importieren
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  onSubmit(): void {
    console.log('Benutzername:', this.username);
    console.log('Passwort:', this.password);
  }
}


