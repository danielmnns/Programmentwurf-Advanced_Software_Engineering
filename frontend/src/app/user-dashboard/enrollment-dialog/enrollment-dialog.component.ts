import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../auth/auth.service';
import { CourseService } from '../../services/course.service';

@Component({
  selector: 'app-enrollment-dialog',
  templateUrl: './enrollment-dialog.component.html',
  styleUrls: ['./enrollment-dialog.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
export class EnrollmentDialogComponent {
  enrollmentKey: string = '';
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<EnrollmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private courseService: CourseService
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  enroll(): void {
    const username = this.authService.getUserName() || '';

    if (!this.enrollmentKey.trim()) {
      this.showSnackbar('Bitte geben Sie einen Einschreibeschlüssel ein.', 'error');
      return;
    }

    const payload = {
      username,
      courseName: this.data.course.name,
      enrollmentKey: this.enrollmentKey,
    };

    this.courseService.enrollInCourse(payload).subscribe(
      (response) => {
        if (response.enrolled) {
          this.successMessage = response.message || `${username} wurde erfolgreich in den Kurs ${this.data.course.name} eingeschrieben.`;
          this.showSnackbar(this.successMessage || '', 'success');
          this.dialogRef.close({ success: true });
        } else {
          this.errorMessage = 'Falscher Einschreibeschlüssel.';
          this.showSnackbar(this.errorMessage, 'error');
        }
      },
      () => {
        this.errorMessage = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
        this.showSnackbar(this.errorMessage, 'error');
      }
    );
  }

  private showSnackbar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'OK', {
      duration: 4000,
      panelClass: type === 'success' ? 'success-snackbar' : 'error-snackbar',
    });
  }
}
