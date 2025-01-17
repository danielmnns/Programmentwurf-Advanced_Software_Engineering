import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CourseService } from '../../services/course.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-enrollment-dialog',
  templateUrl: './enrollment-dialog.component.html',
  styleUrls: ['./enrollment-dialog.component.css'],
})
export class EnrollmentDialogComponent {
  enrollmentKey: string = '';
  errorMessage: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<EnrollmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { course: any },
    private courseService: CourseService, // Ensure CourseService is correctly injected
    private authService: AuthService // AuthService also injected properly
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  enroll(): void {
    const username = this.authService.getUserName() || ''; // Ensure username is never null
    const payload = {
      username, // Guaranteed to be a string
      courseName: this.data.course.name,
      enrollmentKey: this.enrollmentKey,
    };

    this.courseService.enrollInCourse(payload).subscribe(
      (response) => {
        if (response.enrolled) {
          this.dialogRef.close({ success: true });
        } else {
          this.errorMessage = 'Falscher Einschreibeschlüssel.';
        }
      },
      () => {
        this.errorMessage = 'Ein Fehler ist aufgetreten.';
      }
    );
  }
}
