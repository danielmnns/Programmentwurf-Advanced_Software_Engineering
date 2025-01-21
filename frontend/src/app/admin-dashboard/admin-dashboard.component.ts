import { Component, OnInit } from '@angular/core';
import { CourseService } from '../services/course.service';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';  // Importiere den AuthService

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  courses: any[] = [];
  isAdmin: boolean = false; // Variable für die Admin-Prüfung
  showAddCourseModal: boolean = false; // Flag für das Hinzufügen-Fenster
  newCourseTitle: string = ''; // Eingabe für den neuen Kursnamen

  constructor(
    private courseService: CourseService,
    private router: Router,
    private authService: AuthService  // AuthService zur Benutzertyp-Prüfung
  ) {}

  ngOnInit(): void {
    this.loadCourses();
    this.checkAdmin();  // Überprüfe, ob der Benutzer Admin ist
  }

  loadCourses(): void {
    this.courseService.getAllCourses().subscribe(
      (data) => this.courses = data,
      (error) => console.error('Fehler beim Abrufen der Kurse:', error)
    );
  }

  // Modal zum Hinzufügen eines Kurses öffnen
  openAddCourseModal(): void {
    this.showAddCourseModal = true;
  }

  // Modal schließen
  closeAddCourseModal(): void {
    this.showAddCourseModal = false;
    this.newCourseTitle = ''; // Eingabe zurücksetzen
  }

  // Kurs hinzufügen
  addCourse(): void {
    if (!this.newCourseTitle.trim()) {
      alert('Bitte geben Sie einen Kursnamen ein.');
      return;
    }
  
    const newCourse = { title: this.newCourseTitle }; // Kursdaten
    this.courseService.addCourse(newCourse).subscribe(
      (response) => {
        // Backend gibt den neuen Kurs zurück
        this.courses.push(response); // Füge den Kurs zur Liste hinzu
        this.closeAddCourseModal(); // Modal schließen
        alert(`Kurs "${this.newCourseTitle}" wurde erfolgreich hinzugefügt.`);
      },
      (error) => {
        console.error('Fehler beim Hinzufügen des Kurses:', error);
        alert('Fehler beim Hinzufügen des Kurses.');
      }
    );
  }
  

  // Methode zur Admin-Prüfung
  checkAdmin(): void {
    this.isAdmin = this.authService.getUserType() === 'admin';
  }

  navigateToCourse(courseName: string): void {
    // Navigation zur Kursseite mit Kursnamen in der URL
    this.router.navigate(['/user-kurs', encodeURIComponent(courseName)]);
  }

  navigateToAdminKurs(courseName: string): void {
    // Navigation zur Admin-Kurs-Seite
    this.router.navigate(['/admin-kurs', encodeURIComponent(courseName)]);
  }

  // Methode zur Navigation zur User-Verwaltung
  navigateToUserVerwaltung(): void {
    this.router.navigate(['/user-verwaltung']);  // Hier zur User-Verwaltung navigieren
  }

  deleteCourse(courseTitle: string): void {
    if (confirm(`Möchten Sie den Kurs "${courseTitle}" wirklich löschen?`)) {
      this.courseService.deleteCourse(courseTitle).subscribe(
        (response) => {
          // Kurs erfolgreich gelöscht, die Liste aktualisieren
          this.courses = this.courses.filter(course => course.title !== courseTitle);
          alert(`Kurs "${courseTitle}" wurde erfolgreich gelöscht.`);
        },
        (error) => {
          console.error('Fehler beim Löschen des Kurses:', error);
          alert(`Fehler beim Löschen des Kurses "${courseTitle}".`);
        }
      );
    }
  }
}
