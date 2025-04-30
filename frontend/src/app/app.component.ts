import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from './auth/auth.service';
import { InactivityService } from './services/inactivity.service';
import { LanguageService } from './services/language.service';
import { UserDataService } from './services/userdata.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: false 
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Saugiels Lernplattform';
  private routerSubscription: Subscription | undefined;

  constructor(
    private userDataService: UserDataService,
    private authService: AuthService,
    private router: Router,
    private languageService: LanguageService,
    private inactivityService: InactivityService
  ) {}

  ngOnInit(): void {
    /* Initialisiere die Spracheinstellung beim Anwendungsstart
       Der LanguageService lädt die gespeicherte Sprache automatisch */

    const token = localStorage.getItem('token');
    if (token) {
      if (!this.userDataService.getUserData()) {
        this.userDataService.fetchUserData().subscribe(
          () => {
            console.log('Benutzerdaten erfolgreich geladen.');
            /* Starte die Inaktivitätsüberwachung wenn der Benutzer angemeldet ist */
            this.startInactivityMonitoring();
          },
          (error) => {
            console.error('Fehler beim Laden der Benutzerdaten:', error);
            this.authService.logout();
            this.router.navigate(['/login']);
          }
        );
      } else {
        /* Benutzer ist angemeldet und Daten sind bereits geladen */
        this.startInactivityMonitoring();
      }
    }

    /* Überwache Routerwechsel für die Inaktivitätsüberwachung */
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      /* Nach jedem Routerwechsel prüfen, ob Benutzer angemeldet ist */
      if (this.authService.isLoggedIn()) {
        this.startInactivityMonitoring();
      } else {
        this.stopInactivityMonitoring();
      }
    });
  }

  ngOnDestroy(): void {
    /* Router-Subscription bereinigen */
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    
    /* Inaktivitätsüberwachung beenden */
    this.stopInactivityMonitoring();
  }

  /* Startet die Überwachung der Benutzeraktivität */
  private startInactivityMonitoring(): void {
    if (this.authService.isLoggedIn()) {
      this.inactivityService.init();
      console.log('Inaktivitätsüberwachung gestartet');
    }
  }

  /* Beendet die Überwachung der Benutzeraktivität */
  private stopInactivityMonitoring(): void {
    this.inactivityService.stopMonitoring();
    console.log('Inaktivitätsüberwachung beendet');
  }

  /* Prüft, ob die aktuelle Seite die Login-Seite ist */
  isLoginPage(): boolean {
    return this.router.url === '/login';
  }
}