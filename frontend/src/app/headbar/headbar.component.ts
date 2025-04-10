import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { TranslatePipe } from '../pipes/translate.pipe';
import { Language, LanguageService } from '../services/language.service';

@Component({
  selector: 'app-headbar',
  templateUrl: './headbar.component.html',
  styleUrls: ['./headbar.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    TranslatePipe
  ]
})
export class HeadbarComponent {
  currentDate: string = '';
  currentTime: string = '';
  userName: string | null = '';
  userType: string | null = '';
  currentLanguage: Language;

  constructor(
    private router: Router, 
    private authService: AuthService, 
    private http: HttpClient,
    public languageService: LanguageService
  ) {
    this.currentLanguage = this.languageService.getCurrentLanguage();
  }

  ngOnInit(): void {
    this.updateDateTime();
    setInterval(() => {
      this.updateDateTime();
    }, 1000); // Jede Sekunde aktualisieren

    this.loadUserData();
    
    // Subscribe to language changes
    this.languageService.currentLanguage$.subscribe(lang => {
      this.currentLanguage = lang;
    });
  }

  loadUserData(): void {
    this.http.get('http://localhost:3000/api/user/userdata').subscribe(
      (response: any) => {
        if (response.success && response.user) {
          this.userName = response.user.username;
          this.userType = response.user.userType;
          console.log('Benutzerdaten erfolgreich geladen:', response.user);
        } else {
          console.error('Ungültige Antwort von /api/user/userdata:', response);
        }
      },
      (error) => {
        console.error('Fehler beim Abrufen der Benutzerdaten:', error);
      }
    );
  }

  updateDateTime(): void {
    const now = new Date();
    this.currentDate = now.toLocaleDateString();
    this.currentTime = now.toLocaleTimeString();
  }

  navigateToHome(): void {
    if (this.userType === 'admin' || this.userType === 'studiengangsleiter') {
      this.router.navigate(['/admin-dashboard']);  // Weiterleitung zur Admin- oder Studiengangsleiter-Dashboard-Seite
    } else if (this.userType === 'student' || this.userType === 'dozent') {
      this.router.navigate(['/user-dashboard']);  // Weiterleitung zur Benutzer-Dashboard-Seite
    } else {
      this.router.navigate(['/']);  // Standard-Route, wenn der Benutzertyp nicht erkannt wird
    }
  }

  navigateToAccount(): void {
    this.router.navigate(['/account']);
  }

  // Change language method
  changeLanguage(lang: Language): void {
    // Nutze die verbesserte setLanguage-Methode des LanguageService
    // Die Angular Change Detection wird innerhalb des Service erzwungen
    this.languageService.setLanguage(lang);
    
    // Das UI wird automatisch aktualisiert durch die Observable-Subscription
    // in der ngOnInit-Methode
  }

  getLanguageLabel(): string {
    return this.languageService.translate(this.currentLanguage === 'de' ? 'german' : 'english');
  }

  getLanguageFlag(): string {
    return this.currentLanguage === 'de' ? '🇩🇪' : '🇬🇧';
  }
}
