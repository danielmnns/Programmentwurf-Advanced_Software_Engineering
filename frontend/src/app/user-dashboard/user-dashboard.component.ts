import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service'; // Adjust the path as necessary
import { TranslatePipe } from '../pipes/translate.pipe'; // Adjust the path as necessary
import { CourseService } from '../services/course.service'; // Adjust the path as necessary
import { LanguageService } from '../services/language.service'; // Adjust the path as necessary
import { EnrollmentDialogComponent } from './enrollment-dialog/enrollment-dialog.component'; // Adjust the path as necessary

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
    RouterModule,
    TranslatePipe
  ]
})
export class UserDashboardComponent {
  courses: any[] = [];

  constructor(
    private courseService: CourseService,
    private authService: AuthService,
    private dialog: MatDialog,
    private router: Router,
    public languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.courseService.getAllCourses().subscribe(
      (data) => this.courses = data,
      (error) => console.error('Fehler beim Abrufen der Kurse:', error)
    );
  }

  isUserEnrolled(course: any): boolean {
    return course.enrolledUsers?.includes(this.authService.getUserName());
  }

  openEnrollmentDialog(course: any): void {
    if (!course) {
      console.error('Kurs ist nicht verfügbar!');
      return;
    }

    const dialogRef = this.dialog.open(EnrollmentDialogComponent, {
      width: '400px',
      data: { course }  // Kurs wird hier korrekt weitergegeben
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.success) {
        this.loadCourses();  // Kurse neu laden, falls Einschreibung erfolgreich war
      }
    });
  }

  navigateToCourse(courseName: string): void {
    // Navigation zur Kursseite mit Kursnamen in der URL
    this.router.navigate(['/user-kurs', encodeURIComponent(courseName)]);
  }
}
