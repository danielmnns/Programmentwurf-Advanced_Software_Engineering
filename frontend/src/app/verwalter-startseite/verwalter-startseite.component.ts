import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Kurs {
  id: number;
  name: string;
}

@Component({
  selector: 'app-verwalter-startseite',
  templateUrl: './verwalter-startseite.component.html',
  styleUrls: ['./verwalter-startseite.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
})
export class VerwalterStartseiteComponent implements OnInit {
  currentDate: string = '';
  currentTime: string = '';
  userName: string = '';
  kurse: Kurs[] = [];
  showDeletePopup: boolean = false;
  kursToDeleteId: number | null = null;

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.updateDateTime();
    setInterval(() => this.updateDateTime(), 1000);
    this.loadUserData();
    this.ladeKurse();
  }

  updateDateTime() {
    const now = new Date();
    this.currentDate = now.toLocaleDateString();
    this.currentTime = now.toLocaleTimeString();
  }

  loadUserData() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (userData.name) {
      this.userName = userData.name;
    }
  }

  navigateToAccount() {
    this.router.navigate(['/account']);
  }

  navigateToHome(): void {
    this.router.navigate(['/verwalter-startseite']);
  }

  ladeKurse() {
    this.kurse = [
      { id: 1, name: 'Mathematik' },
      { id: 2, name: 'Informatik' },
      { id: 3, name: 'Physik' },
    ];

    /*
    this.http.get<Kurs[]>('http://localhost:3000/kurse').subscribe(data => {
      this.kurse = data;
    });
    */
  }

  oeffneLoeschPopup(kursId: number) {
    this.kursToDeleteId = kursId;
    this.showDeletePopup = true;
  }

  abbrechenLoeschen() {
    this.showDeletePopup = false;
    this.kursToDeleteId = null;
  }

  kursLoeschen() {
    if (!this.kursToDeleteId) return;

    // Dummy-Logik (Backend-Aufruf ersetzen)
    this.kurse = this.kurse.filter(k => k.id !== this.kursToDeleteId);
    alert('Kurs wurde erfolgreich gelöscht.');

    this.showDeletePopup = false;
    this.kursToDeleteId = null;

    /*
    this.http.delete(`http://localhost:3000/kurse/${this.kursToDeleteId}`).subscribe(() => {
      this.kurse = this.kurse.filter(k => k.id !== this.kursToDeleteId);
      this.showDeletePopup = false;
      this.kursToDeleteId = null;
    });
    */
  }
}
