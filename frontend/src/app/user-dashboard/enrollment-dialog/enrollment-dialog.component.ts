import { Component, Inject } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
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
  successMessage: string | null = null;  // Definiert die successMessage-Variable

  constructor(
    public dialogRef: MatDialogRef<EnrollmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { course: any },
    private courseService: CourseService,
    private authService: AuthService,
    private snackBar: MatSnackBar
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
          // Sicherstellen, dass successMessage immer ein string ist
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
