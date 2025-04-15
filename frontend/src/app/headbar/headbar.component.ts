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
  
  // Neue Eigenschaften für die Sitzungszeitanzeige
  remainingTime: string = '';
  isLoggedIn: boolean = false;
  isTimerWarning: boolean = false;
  timerActive: boolean = false; // Für Sichtbarkeitssteuerung des Timers
  private sessionTimerSubscription?: Subscription;
  private readonly WARNING_THRESHOLD = 5 * 60 * 1000; // 5 Minuten in Millisekunden

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
    }, 1000); // Jede Sekunde aktualisieren

    this.loadUserData();
    
    // Subscribe to language changes
    this.languageService.currentLanguage$.subscribe(lang => {
      this.currentLanguage = lang;
    });
    
    // Login-Status prüfen und Timer starten
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.startSessionTimer();
    }
  }
  
  ngOnDestroy(): void {
    // Aufräumen der Subscription beim Zerstören der Komponente
    if (this.sessionTimerSubscription) {
      this.sessionTimerSubscription.unsubscribe();
    }
  }

  loadUserData(): void {
    this.http.get('http://localhost:3000/api/user/userdata').subscribe(
      (response: any) => {
        if (response.success && response.user) {
          this.userName = response.user.username;
          this.userType = response.user.userType;
          console.log('Benutzerdaten erfolgreich geladen:', response.user);
          this.isLoggedIn = true;
          
          // Timer neu starten, wenn Benutzerdaten geladen wurden
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
  
  /**
   * Startet den Timer für die Sitzungszeitanzeige
   */
  startSessionTimer(): void {
    // Alte Subscription aufräumen, falls vorhanden
    if (this.sessionTimerSubscription) {
      this.sessionTimerSubscription.unsubscribe();
    }
    
    // Alle Sekunde die verbleibende Zeit aktualisieren
    this.sessionTimerSubscription = interval(1000).subscribe(() => {
      // Timer-Status aus dem Service abfragen
      this.timerActive = this.inactivityService.isTimerActive();
      
      // Nur verbleibende Zeit berechnen, wenn Timer aktiv ist
      if (this.timerActive) {
        const timeLeft = this.inactivityService.getTimeoutDuration();
        
        if (timeLeft > 0) {
          // Verbleibende Zeit formatieren
          this.formatRemainingTime(timeLeft);
          
          // Warnung anzeigen, wenn weniger als 5 Minuten übrig sind
          this.isTimerWarning = timeLeft <= this.WARNING_THRESHOLD;
        } else {
          this.remainingTime = '0:00';
          this.isTimerWarning = true;
        }
      }
    });
  }
  
  /**
   * Formatiert die verbleibende Zeit in Minuten und Sekunden (MM:SS)
   */
  private formatRemainingTime(timeInMs: number): void {
    const totalSeconds = Math.floor(timeInMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    this.remainingTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
}
