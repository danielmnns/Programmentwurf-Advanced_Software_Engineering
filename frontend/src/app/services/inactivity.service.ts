import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class InactivityService {
  private inactivityTimer: any;
  private delayTimer: any;
  private readonly INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 Minuten in Millisekunden
  private readonly INACTIVITY_DELAY = 10 * 1000; // 10 Sekunden Verzögerung bevor der Timer startet
  private lastActivityTime: number = Date.now();
  private timerActive: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone
  ) { }

  /**
   * Initialisiert die Überwachung der Benutzeraktivität
   */
  init(): void {
    // Event-Listener für Benutzeraktivitäten
    const events = ['click', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, () => this.resetInactivityTimer());
    });

    // Timer beim Start initialisieren
    this.resetInactivityTimer();
  }

  /**
   * Setzt den Inaktivitätstimer zurück
   */
  resetInactivityTimer(): void {
    // Nur ausführen, wenn der Benutzer angemeldet ist
    if (!this.authService.isLoggedIn()) {
      return;
    }

    // Bestehenden Timer löschen
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }

    // Verzögerungstimer löschen, falls vorhanden
    if (this.delayTimer) {
      clearTimeout(this.delayTimer);
      this.delayTimer = null;
    }

    // Timer-Status aktualisieren
    this.timerActive = false;
    
    // Verzögerungstimer starten, der nach 10 Sekunden Inaktivität den eigentlichen Timer startet
    this.delayTimer = setTimeout(() => {
      // Aktuelle Zeit als letzte Aktivität speichern
      this.lastActivityTime = Date.now();
      this.timerActive = true;
      
      // Den eigentlichen Inaktivitätstimer starten
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

  /**
   * Prüft, ob der Inaktivitätstimer aktuell aktiv ist
   * @returns true wenn der Timer läuft, sonst false
   */
  isTimerActive(): boolean {
    return this.timerActive;
  }

  /**
   * Liefert die Zeitspanne in Millisekunden bis zur automatischen Abmeldung
   * basierend auf der letzten Benutzeraktivität
   * @returns Verbleibende Zeit in Millisekunden oder 0, wenn Timer noch nicht aktiv
   */
  getTimeoutDuration(): number {
    // Wenn der Timer noch nicht aktiv ist, 0 zurückgeben
    if (!this.timerActive) {
      return this.INACTIVITY_TIMEOUT;
    }
    
    // Zeit berechnen: TIMEOUT abzüglich der Zeit seit der letzten Aktivität
    const elapsedSinceLastActivity = Date.now() - this.lastActivityTime;
    return Math.max(0, this.INACTIVITY_TIMEOUT - elapsedSinceLastActivity);
  }

  /**
   * Beendet die Überwachung der Benutzeraktivität
   */
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