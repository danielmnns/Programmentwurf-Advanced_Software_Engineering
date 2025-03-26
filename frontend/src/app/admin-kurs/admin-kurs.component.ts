import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list'; // Add this for mat-list
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NewTaskDialogComponent } from '../new-task-dialog/new-task-dialog.component';

export interface DocumentFile {
  name: string;
  url: string;
}

export interface Task {
  taskId?: string;
  name: string;
  description: string;
  documents: DocumentFile[];
}

@Component({
  selector: 'app-admin-kurs',
  templateUrl: './admin-kurs.component.html',
  styleUrls: ['./admin-kurs.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule 
  ]
})
export class AdminKursComponent implements OnInit {
  courseName: string = '';
  textContent: string = '';
  participants: string[] = [];
  uploadedDocuments: DocumentFile[] = [];
  tasks: Task[] = [];

  private apiUrl = 'http://localhost:3000/api/courses';

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private http: HttpClient,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const encodedCourseName = this.route.snapshot.paramMap.get('courseName')!;
    this.courseName = decodeURIComponent(encodedCourseName);
    this.loadCourseData();
  }


  loadCourseData(): void {
    const url = `${this.apiUrl}/user-kurs?courseName=${encodeURIComponent(this.courseName)}`;
    this.http.get(url).subscribe(
      (response: any) => {
      this.textContent = response.textContent || '';
      this.participants = response.participants || [];
      if (response.documents) {
        this.uploadedDocuments = response.documents.map((doc: any) => ({
          name: doc.name,
          url: doc.url
        }));
      }
      if (response.tasks) {
        this.tasks = response.tasks.map((task: any) => ({
          taskId: task.taskId || '',
          name: task.name,
          description: task.description,
          documents: task.documents || []
        }));
      }
    },
    (error) => {
      console.error('Fehler beim Laden der Kursdaten:', error);
    }
  );
  }

  // Methode zum Upload allgemeiner Kursdokumente
  handleDocumentUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('courseName', this.courseName);
      const endpoint = '/courses/admin/addDocument';
      this.http.post(`${this.apiUrl}${endpoint}`, formData).subscribe(
        (response: any) => {
          alert('Dokument erfolgreich hinzugefügt!');
          this.loadCourseData();
        },
        (error) => {
          console.error('Fehler beim Hinzufügen des Dokuments:', error);
          alert('Fehler beim Hinzufügen des Dokuments');
        }
      );
    }
  }

  // Speichert die Änderungen an einer Aufgabe
  updateTask(task: Task): void {
    const payload = { courseName: this.courseName, ...task };
    this.http.post(`${this.apiUrl}/admin/updateTask`, payload).subscribe(
      (response: any) => {
        alert(response.message || 'Aufgabe wurde erfolgreich aktualisiert!');
      },
      (error) => {
        console.error('Fehler beim Aktualisieren der Aufgabe:', error);
      }
    );
  }

  // Löscht eine Aufgabe
  deleteTask(task: Task): void {
    const payload = { courseName: this.courseName, taskId: task.taskId };
    this.http.request('delete', `${this.apiUrl}/admin/deleteTask`, { body: payload }).subscribe(
      (response: any) => {
        alert(response.message || 'Aufgabe wurde gelöscht!');
        this.tasks = this.tasks.filter(t => t.taskId !== task.taskId);
      },
      (error) => {
        console.error('Fehler beim Löschen der Aufgabe:', error);
      }
    );
  }

  updateText(): void {
    const payload = { courseName: this.courseName, textContent: this.textContent };
    this.http.post(`${this.apiUrl}/admin/updateText`, payload).subscribe(
      (response: any) => {
        alert(response.message || 'Text wurde erfolgreich aktualisiert!');
      },
      (error) => {
        console.error('Fehler beim Aktualisieren des Textes:', error);
      }
    );
  }


  // Entfernt ein Dokument aus einer Aufgabe
  removeTaskDocument(task: Task, index: number): void {
    task.documents.splice(index, 1);
  }

  // Fügt einer Aufgabe ein neues Dokument hinzu (über File-Upload)
  addTaskDocument(task: Task, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('courseName', this.courseName);
      formData.append('taskId', task.taskId || '');
      this.http.post(`${this.apiUrl}/admin/addTaskDocument`, formData).subscribe(
        (response: any) => {
          // Backend liefert das Dokument (Name und URL) zurück
          task.documents.push({ name: response.name, url: response.url });
        },
        (error) => {
          console.error('Fehler beim Hinzufügen des Dokuments zur Aufgabe:', error);
        }
      );
    }
  }

  // Öffnet den Dialog zum Hinzufügen einer neuen Aufgabe
  openNewTaskDialog(): void {
    const dialogRef = this.dialog.open(NewTaskDialogComponent, {
      width: '400px',
      data: { courseName: this.courseName }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Neue Aufgabe wurde erstellt, Kursdaten neu laden
        this.loadCourseData();
      }
    });
  }

}
