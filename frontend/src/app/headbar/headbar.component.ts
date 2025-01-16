import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service'; // AuthService importieren
import { Router } from '@angular/router';

@Component({
  selector: 'app-headbar',
  templateUrl: './headbar.component.html',
  styleUrls: ['./headbar.component.css']
})
export class HeadbarComponent implements OnInit {
  currentDate: string = '';
  currentTime: string = '';
  userName: string | null = '';
  userType: string | null = '';

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.updateDateTime();
    setInterval(() => {
      this.updateDateTime();
    }, 60000); // Jede Minute aktualisieren

    // Benutzername und Nutzertyp aus dem AuthService holen
    this.userName = this.authService.getUserName();
    this.userType = this.authService.getUserType();
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
}
