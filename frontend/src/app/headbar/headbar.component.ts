import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-headbar',
  templateUrl: './headbar.component.html',
  styleUrls: ['./headbar.component.css']
})
export class HeadbarComponent implements OnInit {
  currentDate: string = '';
  currentTime: string = '';
  userName: string = 'Max Mustermann'; // Beispiel-Name, dies sollte vom AuthService kommen

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Datum und Uhrzeit regelmäßig aktualisieren
    this.updateDateTime();
    setInterval(() => {
      this.updateDateTime();
    }, 60000); // jede Minute aktualisieren
  }

  updateDateTime(): void {
    const now = new Date();
    this.currentDate = now.toLocaleDateString();
    this.currentTime = now.toLocaleTimeString();
  }

  navigateToHome(): void {
    this.router.navigate(['/home']);  // Beispiel-URL für die Home-Seite
  }

  navigateToAccount(): void {
    this.router.navigate(['/account']);  // Beispiel-URL für das Benutzerkonto
  }
}
