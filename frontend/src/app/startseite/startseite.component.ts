import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Kurs {
  id: number;
  name: string;
  eingeschrieben: boolean;
}

@Component({
  selector: 'app-startseite',
  templateUrl: './startseite.component.html',
  styleUrls: ['./startseite.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule] // ✅ HttpClientModule hinzugefügt
})
export class StartseiteComponent implements OnInit {
  currentDate: string = '';
  currentTime: string = '';
  userName: string = '';
  kurse: Kurs[] = [];
  showPopup: boolean = false;
  selectedKursId: number | null = null;
  einschreibeschluessel: string = '';

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

  ladeKurse() {
    // ✅ **DUMMY-DATEN**
    this.kurse = [
      { id: 1, name: 'Mathematik', eingeschrieben: false },
      { id: 2, name: 'Informatik', eingeschrieben: true },
      { id: 3, name: 'Physik', eingeschrieben: false },
    ];

    /*
    // 🔴 **BACKEND-ANBINDUNG (auskommentiert, bis Backend läuft)**
    this.http.get<Kurs[]>('http://localhost:3000/kurse').subscribe(data => {
      this.kurse = data;
    });
    */
  }

  oeffnePopup(kursId: number) {
    this.selectedKursId = kursId;
    this.showPopup = true;
  }

  einschreiben() {
    if (!this.selectedKursId) return;

    // ✅ **DUMMY-LOGIK für Einschreibung**
    const kurs = this.kurse.find(k => k.id === this.selectedKursId);
    if (kurs) {
      kurs.eingeschrieben = true;
      alert(`Erfolgreich in den Kurs "${kurs.name}" eingeschrieben!`);
    }
    this.showPopup = false;
    this.einschreibeschluessel = '';

    /*
    // 🔴 **BACKEND-ANBINDUNG (auskommentiert, bis Backend läuft)**
    this.http.post('http://localhost:3000/einschreiben', {
      kursId: this.selectedKursId,
      schluessel: this.einschreibeschluessel
    }).subscribe((response: any) => {
      if (response.erfolg) {
        alert('Einschreibung erfolgreich!');
        this.kurse.find(kurs => kurs.id === this.selectedKursId)!.eingeschrieben = true;
      } else {
        alert('Einschreibung fehlgeschlagen: Falscher Schlüssel.');
      }
      this.showPopup = false;
      this.einschreibeschluessel = '';
    });
    */
  }
}
