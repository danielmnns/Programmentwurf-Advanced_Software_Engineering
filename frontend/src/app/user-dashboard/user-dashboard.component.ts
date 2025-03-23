import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CourseService } from '../services/course.service'; // Adjust the path as necessary
import { AuthService } from '../auth/auth.service'; // Adjust the path as necessary
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
    RouterModule
  ]
})
export class UserDashboardComponent {
  courses: any[] = [];

  constructor(
    private courseService: CourseService,
    private authService: AuthService,
    private dialog: MatDialog,
    private router: Router
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
