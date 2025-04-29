import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { TranslatePipe } from '../pipes/translate.pipe';
import { InactivityService } from '../services/inactivity.service';
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
export class HeadbarComponent implements OnInit, OnDestroy {
  currentDate: string = '';
  currentTime: string = '';
  userName: string | null = '';
  userType: string | null = '';
  currentLanguage: Language;
  
  /* Eigenschaften für die Anzeige der verbleibenden Sitzungszeit */
  remainingTime: string = '';
  isLoggedIn: boolean = false;
  isTimerWarning: boolean = false;
  timerActive: boolean = false; /* Steuert die Sichtbarkeit des Timers in der UI */
  private sessionTimerSubscription?: Subscription;
  private readonly WARNING_THRESHOLD = 5 * 60 * 1000; /* Warnschwelle: 5 Minuten vor Ablauf der Sitzung */

  constructor(
    private router: Router, 
    private authService: AuthService, 
    private http: HttpClient,
    public languageService: LanguageService,
    private inactivityService: InactivityService
  ) {
    this.currentLanguage = this.languageService.getCurrentLanguage();
  }

  ngOnInit(): void {
    this.updateDateTime();
    setInterval(() => {
      this.updateDateTime();
    }, 1000); /* Datum und Uhrzeit jede Sekunde aktualisieren */

    this.loadUserData();
    
    /* Auf Sprachänderungen reagieren */
    this.languageService.currentLanguage$.subscribe(lang => {
      this.currentLanguage = lang;
    });
    
    /* Login-Status prüfen und Timer starten falls eingeloggt */
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.startSessionTimer();
    }
  }
  
  ngOnDestroy(): void {
    /* Aufräumen der Subscription beim Zerstören der Komponente */
    if (this.sessionTimerSubscription) {
      this.sessionTimerSubscription.unsubscribe();
    }
  }

  /* Lädt die Benutzerdaten vom Backend und aktualisiert die UI entsprechend */
  loadUserData(): void {
    this.http.get('http://localhost:3000/api/user/userdata').subscribe(
      (response: any) => {
        if (response.success && response.user) {
          this.userName = response.user.username;
          this.userType = response.user.userType;
          console.log('Benutzerdaten erfolgreich geladen:', response.user);
          this.isLoggedIn = true;
          
          /* Timer neu starten, wenn Benutzerdaten geladen wurden */
          this.startSessionTimer();
        } else {
          console.error('Ungültige Antwort von /api/user/userdata:', response);
          this.isLoggedIn = false;
        }
      },
      (error) => {
        console.error('Fehler beim Abrufen der Benutzerdaten:', error);
        this.isLoggedIn = false;
      }
    );
  }

  /* Aktualisiert das aktuelle Datum und die Uhrzeit für die Anzeige */
  updateDateTime(): void {
    const now = new Date();
    this.currentDate = now.toLocaleDateString();
    this.currentTime = now.toLocaleTimeString();
  }

  /* Navigiert zum passenden Dashboard je nach Benutzerrolle */
  navigateToHome(): void {
    if (this.userType === 'admin' || this.userType === 'studiengangsleiter') {
      this.router.navigate(['/admin-dashboard']);
    } else if (this.userType === 'student' || this.userType === 'dozent') {
      this.router.navigate(['/user-dashboard']);
    } else {
      this.router.navigate(['/']);
    }
  }

  /* Navigiert zur Kontoseite des Benutzers */
  navigateToAccount(): void {
    this.router.navigate(['/account']);
  }

  /* Ändert die Anzeigesprache der Anwendung */
  changeLanguage(lang: Language): void {
    this.languageService.setLanguage(lang);
  }

  /* Gibt die lokalisierte Bezeichnung der aktuellen Sprache zurück */
  getLanguageLabel(): string {
    return this.languageService.translate(this.currentLanguage === 'de' ? 'german' : 'english');
  }

  /* Gibt das Flaggen-Emoji für die aktuelle Sprache zurück */
  getLanguageFlag(): string {
    return this.currentLanguage === 'de' ? '🇩🇪' : '🇬🇧';
  }
  
  /* Startet den Timer für die Anzeige der verbleibenden Sitzungszeit */
  startSessionTimer(): void {
    if (this.sessionTimerSubscription) {
      this.sessionTimerSubscription.unsubscribe();
    }
    
    this.sessionTimerSubscription = interval(1000).subscribe(() => {
      this.timerActive = this.inactivityService.isTimerActive();
      
      if (this.timerActive) {
        const timeLeft = this.inactivityService.getTimeoutDuration();
        
        if (timeLeft > 0) {
          this.formatRemainingTime(timeLeft);
          this.isTimerWarning = timeLeft <= this.WARNING_THRESHOLD;
        } else {
          this.remainingTime = '0:00';
          this.isTimerWarning = true;
        }
      }
    });
  }
  
  /* Hilfsmethode zur Formatierung der verbleibenden Zeit in MM:SS Format */
  private formatRemainingTime(timeInMs: number): void {
    const totalSeconds = Math.floor(timeInMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    this.remainingTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
}
