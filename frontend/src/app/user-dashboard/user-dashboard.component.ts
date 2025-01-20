import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CourseService } from '../services/course.service';
import { AuthService } from '../auth/auth.service';
import { EnrollmentDialogComponent } from './enrollment-dialog/enrollment-dialog.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {
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
    const dialogRef = this.dialog.open(EnrollmentDialogComponent, {
      width: '400px',
      data: { course }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.success) {
        this.loadCourses();
      }
    });
  }
  navigateToCourse(courseName: string): void {
    // Navigation zur Kursseite mit Kursnamen in der URL
    this.router.navigate(['/user-kurs', encodeURIComponent(courseName)]);
  }
  
}
