import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Add this import
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field'; // Add this
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input'; // Add this
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service'; // Adjust the path as necessary
import { TranslatePipe } from '../pipes/translate.pipe'; // Add this
import { CourseService } from '../services/course.service'; // Adjust the path as necessary
import { LanguageService } from '../services/language.service'; // Add this

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, // Required for ngModel binding
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    TranslatePipe // Add this
  ]
})
export class AdminDashboardComponent {
  courses: any[] = [];
  isAdmin: boolean = false;
  showAddCourseModal: boolean = false;
  newCourseTitle: string = '';
  private destroy$: Subject<void> = new Subject<void>();

  constructor(
    private courseService: CourseService,
    private router: Router,
    private authService: AuthService,
    public languageService: LanguageService // Add this
  ) {}

  ngOnInit(): void {
    this.loadCourses();
    this.checkAdmin();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
    this.newCourseTitle = '';
  }

  // Kurs hinzufügen
  addCourse(): void {
    if (!this.newCourseTitle.trim()) {
      alert('Bitte geben Sie einen Kursnamen ein.');
      return;
    }

    const kursName = this.newCourseTitle; // Kursnamen für die Nachricht sichern
    const newCourse = { title: kursName };

    this.courseService.addCourse(newCourse).subscribe(
      (response) => {
        this.courses.push(response);
        alert(`Kurs "${kursName}" wurde erfolgreich hinzugefügt.`);
        this.closeAddCourseModal();
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
    this.router.navigate(['/user-kurs', encodeURIComponent(courseName)]);
  }

  navigateToAdminKurs(courseName: string): void {
    this.router.navigate(['/admin-kurs', encodeURIComponent(courseName)]);
  }

  // Methode zur Navigation zur User-Verwaltung
  navigateToUserVerwaltung(): void {
    this.router.navigate(['/user-verwaltung']);
  }

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
}
