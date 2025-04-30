import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { TranslatePipe } from '../pipes/translate.pipe';
import { CourseService } from '../services/course.service';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    TranslatePipe
  ]
})
export class AdminDashboardComponent {
  courses: any[] = [];
  isAdmin: boolean = false;
  showAddCourseModal: boolean = false;
  newCourseTitle: string = '';
  showSuccessPopup: boolean = false;
  showErrorPopup: boolean = false; /* Eigenschaft für Fehler-Popup */
  errorMessage: string = ''; /* Eigenschaft zur Speicherung von Fehlermeldungen */
  showDeleteConfirmation: boolean = false;
  courseToDelete: any = null;
  private destroy$: Subject<void> = new Subject<void>();

  constructor(
    private courseService: CourseService,
    private router: Router,
    private authService: AuthService,
    public languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.loadCourses();
    this.checkAdmin();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /* Lädt alle verfügbaren Kurse vom Server */
  loadCourses(): void {
    this.courseService.getAllCourses().subscribe(
      (data) => this.courses = data,
      (error) => console.error('Fehler beim Abrufen der Kurse:', error)
    );
  }

  /* Öffnet das Modal zum Hinzufügen eines neuen Kurses */
  openAddCourseModal(): void {
    this.showAddCourseModal = true;
  }

  /* Schließt das Modal zum Hinzufügen eines Kurses und setzt die Eingaben zurück */
  closeAddCourseModal(): void {
    this.showAddCourseModal = false;
    this.newCourseTitle = '';
  }

  /* Fügt einen neuen Kurs hinzu, nachdem Eingaben validiert wurden */
  addCourse(): void {
    if (!this.newCourseTitle.trim()) {
      this.errorMessage = 'Bitte geben Sie einen Kursnamen ein.';
      this.showErrorPopup = true;
      setTimeout(() => {
        this.showErrorPopup = false;
      }, 3000);
      return;
    }

    const kursName = this.newCourseTitle;
    const newCourse = { title: kursName };

    this.courseService.addCourse(newCourse).subscribe(
      (response) => {
        this.courses.push(response);
        this.closeAddCourseModal();

        /* Erfolgs-Popup anzeigen */
        this.showSuccessPopup = true;
        setTimeout(() => {
          this.showSuccessPopup = false;
        }, 3000);
      },
      (error) => {
        console.error('Fehler beim Hinzufügen des Kurses:', error);
        this.errorMessage = 'Fehler beim Hinzufügen des Kurses.';
        this.showErrorPopup = true;
        setTimeout(() => {
          this.showErrorPopup = false;
        }, 3000);
      }
    );
  }

  /* Prüft, ob der aktuelle Benutzer Admin-Rechte hat */
  checkAdmin(): void {
    this.isAdmin = this.authService.getUserType() === 'admin';
  }

  /* Navigiert zur Benutzeransicht eines Kurses */
  navigateToCourse(courseName: string): void {
    this.router.navigate(['/user-kurs', encodeURIComponent(courseName)]);
  }

  /* Navigiert zur Admin-Ansicht eines Kurses */
  navigateToAdminKurs(courseName: string): void {
    this.router.navigate(['/admin-kurs', encodeURIComponent(courseName)]);
  }

  /* Navigiert zur Benutzerverwaltung */
  navigateToUserVerwaltung(): void {
    this.router.navigate(['/user-verwaltung']);
  }

  /* Löscht einen Kurs nach Bestätigung */
  deleteCourse(course: any): void {
    if (!course._id) {
      console.error('Kurs hat keine ID');
      return;
    }

    this.courseService.deleteCourse(course._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log(`Kurs mit ID ${course._id} erfolgreich gelöscht`);
          this.loadCourses();
        },
        error: (error) => {
          console.error('Fehler beim Löschen des Kurses:', error);
        }
      });
  }

  /* Zeigt den Bestätigungsdialog zum Löschen eines Kurses an */
  showDeleteConfirmationPopup(course: any): void {
    this.showDeleteConfirmation = true;
    this.courseToDelete = course;
  }

  /* Bestätigt das Löschen eines Kurses */
  confirmDeleteCourse(): void {
    if (this.courseToDelete) {
      this.deleteCourse(this.courseToDelete);
      this.cancelDeleteCourse();
    }
  }

  /* Bricht den Löschvorgang eines Kurses ab */
  cancelDeleteCourse(): void {
    this.showDeleteConfirmation = false;
    this.courseToDelete = null;
  }
}
