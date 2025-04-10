import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { LanguageService } from './services/language.service';
import { UserDataService } from './services/userdata.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: false 
})
export class AppComponent implements OnInit {
  title = 'Saugiels Lernplattform';

  constructor(
    private userDataService: UserDataService,
    private authService: AuthService,
    private router: Router,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    // Initialisiere die Spracheinstellung beim Anwendungsstart
    // Der LanguageService lädt die gespeicherte Sprache automatisch

    const token = localStorage.getItem('token');
    if (token) {
      if (!this.userDataService.getUserData()) {
        this.userDataService.fetchUserData().subscribe(
          () => console.log('Benutzerdaten erfolgreich geladen.'),
          (error) => {
            console.error('Fehler beim Laden der Benutzerdaten:', error);
            this.authService.logout();
            this.router.navigate(['/login']);
          }
        );
      }
    }
  }

  isLoginPage(): boolean {
    return this.router.url === '/login';
  }
}