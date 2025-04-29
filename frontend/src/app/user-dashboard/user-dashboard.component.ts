import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { TranslatePipe } from '../pipes/translate.pipe';
import { CourseService } from '../services/course.service';
import { LanguageService } from '../services/language.service';

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
    private router: Router,
    public languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  /* Lädt alle verfügbaren Kurse für den eingeloggten Benutzer */
  loadCourses(): void {
    this.courseService.getAllCourses().subscribe(
      (data) => this.courses = data,
      (error) => console.error('Fehler beim Abrufen der Kurse:', error)
    );
  }

  /* Prüft, ob der aktuelle Benutzer in einem Kurs eingeschrieben ist */
  isUserEnrolled(course: any): boolean {
    return course.enrolled;
  }

  /* Navigiert zur Detailansicht eines Kurses */
  navigateToCourse(courseName: string): void {
    /* Navigation zur Kursseite mit Kursnamen in der URL */
    this.router.navigate(['/user-kurs', encodeURIComponent(courseName)]);
  }
}
