import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';

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
    MatIconModule
  ]
})
export class HeadbarComponent {
  currentDate: string = '';
  currentTime: string = '';
  userName: string | null = '';
  userType: string | null = '';

  constructor(private router: Router, private authService: AuthService, private http: HttpClient) {}

  ngOnInit(): void {
    this.updateDateTime();
    setInterval(() => {
      this.updateDateTime();
    }, 1000); // Jede Minute aktualisieren

    this.loadUserData();
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
}
