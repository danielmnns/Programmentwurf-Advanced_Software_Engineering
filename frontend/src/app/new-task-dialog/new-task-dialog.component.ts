import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-new-task-dialog',
  templateUrl: './new-task-dialog.component.html',
  styleUrls: ['./new-task-dialog.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ]
})
export class NewTaskDialogComponent {
  taskName: string = '';
  taskText: string = '';
  selectedFiles: File[] = [];

  private apiUrl = 'http://localhost:3000/api';

  constructor(
    private dialogRef: MatDialogRef<NewTaskDialogComponent>,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: { courseName: string }
  ) {}

  onFileSelected(event: any) {
  const fileInput = event.target as HTMLInputElement;
  if (fileInput.files && fileInput.files.length > 0) {
    const fileNameElement = document.getElementById("file-name");
    if (fileNameElement) {
      fileNameElement.textContent = fileInput.files[0].name;
    }
  } else {
    const fileNameElement = document.getElementById("file-name");
    if (fileNameElement) {
      fileNameElement.textContent = "Keine Datei ausgewählt";
    }
  }
}


  createTask(): void {
    if (!this.taskName || !this.taskText) {
      alert('Bitte Aufgabenname und Aufgabentext eingeben!');
      return;
    }
  
    // Payload für Backend erstellen
    const taskData = {
      courseName: this.data.courseName,
      taskName: this.taskName,
      description: this.taskText
    };
    
    
    this.http.post(`${this.apiUrl}/tasks/admin/addTask`, taskData).subscribe(
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
