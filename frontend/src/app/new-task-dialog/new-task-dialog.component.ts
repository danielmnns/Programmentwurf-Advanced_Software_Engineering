import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-new-task-dialog',
  templateUrl: './new-task-dialog.component.html',
  styleUrls: ['./new-task-dialog.component.css']
})
export class NewTaskDialogComponent {
  taskName: string = '';
  taskText: string = '';
  selectedFiles: File[] = [];

  private apiUrl = 'http://localhost:3000/api/courses';

  constructor(
    private dialogRef: MatDialogRef<NewTaskDialogComponent>,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: { courseName: string }
  ) {}

  onFileSelected(event: any): void {
    if (event.target.files) {
      this.selectedFiles = Array.from(event.target.files);
    }
  }

  createTask(): void {
    const formData = new FormData();
    formData.append('courseName', this.data.courseName);
    formData.append('taskName', this.taskName);
    formData.append('taskText', this.taskText);
    // Füge alle ausgewählten Dateien hinzu
    this.selectedFiles.forEach(file => {
      formData.append('files', file, file.name);
    });
    this.http.post(`${this.apiUrl}/admin/addAufgabe`, formData).subscribe(
      (response: any) => {
        alert('Aufgabe erfolgreich erstellt!');
        this.dialogRef.close(true);
      },
      (error) => {
        console.error('Fehler beim Erstellen der Aufgabe', error);
        alert('Fehler beim Erstellen der Aufgabe');
      }
    );
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
