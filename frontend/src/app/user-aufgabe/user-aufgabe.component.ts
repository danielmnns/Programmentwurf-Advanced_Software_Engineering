import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { TranslatePipe } from '../pipes/translate.pipe';
import { FileUrlService } from '../services/file-url.service';
import { LanguageService } from '../services/language.service';

interface DocumentFile {
  name: string;
  url: SafeResourceUrl;
  originalUrl?: string;
}

interface Feedback {
  text: string;
  feedbackFrom: string;
}

@Component({
  selector: 'app-user-aufgabe',
  templateUrl: './user-aufgabe.component.html',
  styleUrls: ['./user-aufgabe.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe]
})
export class UserAufgabeComponent implements OnInit {
  courseName: string = '';
  taskName: string = '';
  taskDescription: string = '';
  submissionFile: { name: string, url: SafeResourceUrl } | null = null;
  feedback: Feedback | null = null;
  showDeletePopup: boolean = false;
  showNotification: boolean = false;
  notificationMessage: string = '';
  taskDocuments: DocumentFile[] = []; // Array für die Aufgabendateien
  
  // Neues Feld für die ausgewählte Datei vor dem Upload
  selectedFile: { name: string, size: string } | null = null;
  uploadedFile: File | null = null; // Speichert die tatsächliche Datei
  submissionComment: string = ''; // Kommentar zur Abgabe
  isUploading: boolean = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly http: HttpClient,
    private readonly sanitizer: DomSanitizer,
    private readonly authService: AuthService,
    private readonly fileUrlService: FileUrlService,
    public readonly languageService: LanguageService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.courseName = params['courseName'];
      this.taskName = params['taskName'];
      this.loadTaskDetails();
    });
  }

  loadTaskDetails() {
    const apiUrl = `http://localhost:3000/api/tasks/user-task`;
    const userName = this.authService.getUserName();

    this.http.get(`${apiUrl}?courseName=${this.courseName}&taskName=${this.taskName}&userName=${userName}`).subscribe({
      next: (response: any) => {
        this.taskDescription = response.description || '';

        // Laden der Aufgabendateien
        if (response.documents && response.documents.length > 0) {
          this.taskDocuments = response.documents.map((doc: any) => ({
            name: doc.name,
            url: this.fileUrlService.getFileUrl(doc.url),
            originalUrl: doc.url
          }));
        }

        // Prüfen, ob eine Abgabe vorhanden ist
        if (response.submission?.file) {
          this.submissionFile = {
            name: response.submission.file.name,
            url: this.fileUrlService.getFileUrl(response.submission.file.url)
          };

          // Prüfen, ob Feedback vorhanden ist
          if (response.submission.feedback) {
            this.feedback = response.submission.feedback;
          }
        }
      },
      error: (error) => {
        console.error('Fehler beim Laden der Aufgabendetails:', error);
      }
    });
  }

  handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Datei für späteres Hochladen speichern
      this.uploadedFile = file;
      
      // Anzeigen der ausgewählten Datei vor dem Upload
      this.selectedFile = {
        name: file.name,
        size: this.formatFileSize(file.size)
      };
    }
  }
  
  // Neue Methode zum Abgeben der Aufgabe mit Datei und Kommentar
  submitAssignment() {
    if (!this.uploadedFile) {
      this.showNotification = true;
      this.notificationMessage = 'Bitte wählen Sie eine Datei aus';
      return;
    }
    
    const formData = new FormData();
    formData.append('file', this.uploadedFile);
    formData.append('courseName', this.courseName);
    formData.append('taskName', this.taskName);
    
    // Füge den Kommentar hinzu, wenn vorhanden
    if (this.submissionComment) {
      formData.append('comment', this.submissionComment);
    }
    
    // Uploadstatus aktualisieren
    this.isUploading = true;
    
    this.http.post('http://localhost:3000/api/tasks/submit', formData).subscribe({
      next: (response: any) => {
        this.isUploading = false;
        if (response.submission?.file) {
          this.submissionFile = {
            name: response.submission.file.name,
            url: this.fileUrlService.getFileUrl(response.submission.file.url)
          };
          this.showNotification = true;
          this.notificationMessage = 'Abgabe erfolgreich hochgeladen';
          
          // Ausgewählte Datei und Kommentar zurücksetzen nach erfolgreichem Upload
          this.selectedFile = null;
          this.uploadedFile = null;
          this.submissionComment = '';
        }
      },
      error: (error) => {
        this.isUploading = false;
        console.error('Fehler beim Hochladen der Abgabe:', error);
        this.showNotification = true;
        this.notificationMessage = 'Fehler beim Hochladen der Abgabe';
      }
    });
  }

  // Hilfsfunktion zur Formatierung der Dateigröße
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  navigateBack() {
    // Navigate to the user-kurs route with the course name
    this.router.navigate(['/user-kurs', encodeURIComponent(this.courseName)]);
  }

  openDeletePopup() {
    this.showDeletePopup = true;
  }

  cancelDelete() {
    this.showDeletePopup = false;
  }

  confirmDelete() {
    const apiUrl = `http://localhost:3000/api/tasks/delete`;
    const payload = {
      courseName: this.courseName,
      taskName: this.taskName,
      userName: this.authService.getUserName() || ''
    };

    this.http.post(apiUrl, payload).subscribe({
      next: (response) => {
        this.submissionFile = null;
        this.feedback = null;
        this.showDeletePopup = false;
        this.showNotification = true;
        this.notificationMessage = 'Abgabe erfolgreich gelöscht';
      },
      error: (error) => {
        console.error('Fehler beim Löschen der Abgabe:', error);
        this.showNotification = true;
        this.notificationMessage = 'Fehler beim Löschen der Abgabe';
      }
    });
  }

  closeNotification(): void {
    this.showNotification = false;
    this.notificationMessage = '';
  }

  // Hilfsmethode zum Öffnen einer Datei in einem neuen Tab
  openDocument(url: SafeResourceUrl | string) {
    window.open(url.toString(), '_blank');
  }
}
