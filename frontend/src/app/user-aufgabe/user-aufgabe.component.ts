import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FileUrlService } from '../services/file-url.service';

interface TaskDetails {
  courseName: string;
  taskName: string;
  taskDescription: string;
  submission?: {
    file?: {
      name: string;
      url: string;
    },
    feedback?: {
      text: string;
    },
    feedbackFrom?: string;
  };
}

@Component({
  selector: 'app-user-aufgabe',
  templateUrl: './user-aufgabe.component.html',
  styleUrls: ['./user-aufgabe.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    RouterModule
  ]
})
export class UserAufgabeComponent implements OnInit {
  courseName: string = '';
  taskName: string = '';
  taskDescription: string = '';
  description: string = ''; // Add description property
  submissionFile?: { name: string; url: SafeResourceUrl; originalUrl: string };
  task?: any; // Define the task property with an appropriate type
  feedback?: { text: string; feedbackFrom: string };
  submissionText: string = ''; // Add submissionText property
  dueDate?: Date | null; // Add dueDate property
  submissionDate?: Date | null; // Add submissionDate property
  grade?: number | null; // Add grade property
  taskId?: string; // Add taskId property
  uploadedDocuments: { name: string; url: string; originalUrl: string }[] = []; // Add uploadedDocuments property
  hasSubmission: boolean = false; // Add hasSubmission property

  // Zustände für Popups
  showDeletePopup: boolean = false;
  showNotification: boolean = false;
  notificationMessage: string = '';
  loading: boolean = false; // Lade-Indikator
  errorMessage: string = ''; // Fehlermeldung für den Benutzer

  private apiUrl = 'http://localhost:3000/api/tasks';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private fileUrlService: FileUrlService
  ) {}

  ngOnInit(): void {
    this.courseName = this.route.snapshot.paramMap.get('courseName')!;
    this.taskName = this.route.snapshot.paramMap.get('taskName')!;
    this.loadTaskData();
  }

  loadTaskData(): void {
    this.loading = true; // Lade-Indikator anzeigen
  
    const payload = {
      courseName: this.courseName,
      taskName: this.taskName
    };
  
    this.http.post(`${this.apiUrl}`, payload).subscribe(
      (data: any) => {
        console.log('Aufgabendaten erhalten:', data);
        
        // Grundlegende Aufgabeninformationen setzen
        this.task = data;
        this.taskDescription = data.description || '';
        
        // Aufgabendokumente verarbeiten
        if (data.documents && data.documents.length > 0) {
          this.uploadedDocuments = data.documents.map((doc: any) => ({
            name: doc.name,
            url: doc.url,  // Der originale URL-String vom Backend
            originalUrl: this.fileUrlService.getFileUrl(doc.url) // Die transformierte URL für die Anzeige
          }));
        } else {
          this.uploadedDocuments = [];
        }
  
        // Einreichungsdaten verarbeiten
        if (data.submission) {
          this.hasSubmission = true;
          
          if (data.submission.file) {
            this.submissionFile = {
              name: data.submission.file.name,
              url: this.fileUrlService.getFileUrl(data.submission.file.url),
              originalUrl: data.submission.file.url
            };
          }
          
          this.feedback = data.submission.feedback || '';
        } else {
          this.hasSubmission = false;
          this.submissionFile = undefined;
          this.feedback = { text: '', feedbackFrom: '' };
        }
        
        this.loading = false;
      },
      (error) => {
        console.error('Fehler beim Laden der Aufgabendaten:', error);
        this.loading = false;
        this.errorMessage = 'Die Aufgabendaten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.';
      }
    );
  }

  handleFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Prüfe Dateigröße (10 MB = 10 * 1024 * 1024 Bytes)
      if (file.size > 10 * 1024 * 1024) {
        this.showNotificationPopup("Die Datei ist zu groß. Maximale Größe: 10 MB.");
        return;
      }
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('courseName', this.courseName);
      formData.append('taskName', this.taskName);
  
      this.loading = true;
      this.http.post(`${this.apiUrl}/upload`, formData).subscribe(
        (response: any) => {
          console.log('Datei erfolgreich hochgeladen', response);
          this.showNotificationPopup("Datei erfolgreich hochgeladen.");
          
          // Direkt die Antwort nutzen, statt erneut zu laden
          if (response.submission && response.submission.file) {
            this.hasSubmission = true;
            this.submissionFile = {
              name: response.submission.file.name,
              url: this.fileUrlService.getFileUrl(response.submission.file.url),
              originalUrl: response.submission.file.url
            };
          }
          
          this.loading = false;
        },
        (error) => {
          console.error('Fehler beim Hochladen der Datei:', error);
          this.showNotificationPopup(error.error?.message || "Fehler beim Hochladen der Datei.");
          this.loading = false;
        }
      );
    }
  }

  // Öffnet das Lösch-Popup
  openDeletePopup(): void {
    this.showDeletePopup = true;
  }

  // Bestätigt die Löschung und führt deleteSubmission aus
  confirmDelete(): void {
    this.showDeletePopup = false;
    this.deleteSubmission();
  }

  // Bricht die Löschung ab
  cancelDelete(): void {
    this.showDeletePopup = false;
  }

  deleteSubmission(): void {
    const payload = {
      courseName: this.courseName,
      taskName: this.taskName
    };

    this.http.post(`${this.apiUrl}/tasks/delete`, payload).subscribe(
      (response) => {
        console.log('Abgabe erfolgreich gelöscht', response);
        this.showNotificationPopup("Abgabe erfolgreich gelöscht.");
        this.loadTaskData();
      },
      (error) => {
        console.error('Fehler beim Löschen der Abgabe:', error);
        this.showNotificationPopup("Fehler beim Löschen der Abgabe.");
      }
    );
  }

  // Zeigt das Benachrichtigungspopup an
  showNotificationPopup(message: string): void {
    this.notificationMessage = message;
    this.showNotification = true;
  }

  closeNotification(): void {
    this.showNotification = false;
    this.notificationMessage = '';
  }

  // Navigiert zurück zur ursprünglichen User-Kurs-Seite
  navigateBack(): void {
    this.router.navigate(['/user-kurs', this.courseName]);
  }
}
