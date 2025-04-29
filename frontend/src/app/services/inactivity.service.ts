import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class InactivityService {
  private inactivityTimer: any;
  private delayTimer: any;
  private readonly INACTIVITY_TIMEOUT = 15 * 60 * 1000; /* Automatische Abmeldung nach 15 Minuten Inaktivität */
  private readonly INACTIVITY_DELAY = 10 * 1000; /* 10 Sekunden Verzögerung vor Timerstart */
  private lastActivityTime: number = Date.now();
  private timerActive: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone
  ) { }

  /* Startet die Überwachung der Benutzeraktivität durch Registrierung von Event-Listenern */
  init(): void {
    const events = ['click', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, () => this.resetInactivityTimer());
    });

    this.resetInactivityTimer();
  }

  /* Setzt den Timer zurück, der die Benutzerinaktivität überwacht und ggf. automatisch abmeldet */
  resetInactivityTimer(): void {
    if (!this.authService.isLoggedIn()) {
      return;
    }

    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }

    if (this.delayTimer) {
      clearTimeout(this.delayTimer);
      this.delayTimer = null;
    }

    this.timerActive = false;
    
    this.delayTimer = setTimeout(() => {
      this.lastActivityTime = Date.now();
      this.timerActive = true;
      
      this.inactivityTimer = setTimeout(() => {
        this.ngZone.run(() => {
          console.log('Automatische Abmeldung nach Inaktivität');
          this.authService.logout();
          this.router.navigate(['/login'], { 
            queryParams: { reason: 'inactivity' } 
          });
        });
      }, this.INACTIVITY_TIMEOUT);
    }, this.INACTIVITY_DELAY);
  }

  /* Gibt zurück, ob der Inaktivitätstimer gerade aktiv ist */
  isTimerActive(): boolean {
    return this.timerActive;
  }

  /* Berechnet die verbleibende Zeit bis zur automatischen Abmeldung in Millisekunden */
  getTimeoutDuration(): number {
    if (!this.timerActive) {
      return this.INACTIVITY_TIMEOUT;
    }
    
    const elapsedSinceLastActivity = Date.now() - this.lastActivityTime;
    return Math.max(0, this.INACTIVITY_TIMEOUT - elapsedSinceLastActivity);
  }

  /* Stoppt die Überwachung der Benutzeraktivität und räumt alle Timer auf */
  stopMonitoring(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
    
    if (this.delayTimer) {
      clearTimeout(this.delayTimer);
      this.delayTimer = null;
    }
    
    this.timerActive = false;
  }
}