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

  loadCourses(): void {
    this.courseService.getAllCourses().subscribe(
      (data) => this.courses = data,
      (error) => console.error('Fehler beim Abrufen der Kurse:', error)
    );
  }

  openAddCourseModal(): void {
    this.showAddCourseModal = true;
  }

  closeAddCourseModal(): void {
    this.showAddCourseModal = false;
    this.newCourseTitle = '';
  }

  addCourse(): void {
    if (!this.newCourseTitle.trim()) {
      alert('Bitte geben Sie einen Kursnamen ein.');
      return;
    }

    const kursName = this.newCourseTitle;
    const newCourse = { title: kursName };

    this.courseService.addCourse(newCourse).subscribe(
      (response) => {
        this.courses.push(response);
        this.closeAddCourseModal();

        // Popup anzeigen
        this.showSuccessPopup = true;
        setTimeout(() => {
          this.showSuccessPopup = false;
        }, 3000);
      },
      (error) => {
        console.error('Fehler beim Hinzufügen des Kurses:', error);
        alert('Fehler beim Hinzufügen des Kurses.');
      }
    );
  }

  checkAdmin(): void {
    this.isAdmin = this.authService.getUserType() === 'admin';
  }

  navigateToCourse(courseName: string): void {
    this.router.navigate(['/user-kurs', encodeURIComponent(courseName)]);
  }

  navigateToAdminKurs(courseName: string): void {
    this.router.navigate(['/admin-kurs', encodeURIComponent(courseName)]);
  }

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

  showDeleteConfirmationPopup(course: any): void {
    this.showDeleteConfirmation = true;
    this.courseToDelete = course;
  }

  confirmDeleteCourse(): void {
    if (this.courseToDelete) {
      this.deleteCourse(this.courseToDelete);
      this.cancelDeleteCourse();
    }
  }

  cancelDeleteCourse(): void {
    this.showDeleteConfirmation = false;
    this.courseToDelete = null;
  }
}
