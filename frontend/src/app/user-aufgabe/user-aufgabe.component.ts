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
  taskDocuments: DocumentFile[] = []; /* Array für die Aufgabendateien */
  
  /* Daten für die Dateiupload-Funktionalität */
  selectedFile: { name: string, size: string } | null = null;
  uploadedFile: File | null = null; /* Speichert die tatsächliche Datei für den Upload */
  submissionComment: string = ''; /* Kommentar zur Aufgabenabgabe */
  isUploading: boolean = false;
  currentLang: 'de' | 'en' = 'de';

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

    /* Auf Sprachänderungen reagieren */
    this.languageService.currentLanguage$.subscribe(lang => {
      this.currentLang = lang;
    });
  }

  /* Lädt die Details einer Aufgabe inklusive vorhandener Abgaben und Feedback */
  loadTaskDetails() {
    const apiUrl = `http://localhost:3000/api/tasks/user-task`;
    const userName = this.authService.getUserName();

    this.http.get(`${apiUrl}?courseName=${this.courseName}&taskName=${this.taskName}&userName=${userName}`).subscribe({
      next: (response: any) => {
        console.log('Task details response:', response);
        this.taskDescription = response.description || '';

        /* Aufgabendateien laden */
        if (response.documents && response.documents.length > 0) {
          this.taskDocuments = response.documents.map((doc: any) => ({
            name: doc.name,
            url: this.fileUrlService.getFileUrl(doc.url),
            originalUrl: doc.url
          }));
        }

        /* Prüfen, ob bereits eine Abgabe existiert */
        if (response.submission?.file) {
          this.submissionFile = {
            name: response.submission.file.name,
            url: this.fileUrlService.getFileUrl(response.submission.file.url)
          };

          /* Kommentar der bestehenden Abgabe anzeigen */
          this.submissionComment = response.submission.comment || '';

          /* Feedback anzeigen, falls vorhanden */
          if (response.submission.feedback) {
            this.feedback = {
              text: response.submission.feedback.text || '',
              feedbackFrom: response.submission.feedback.feedbackFrom || 'Dozent'
            };
            console.log('Feedback loaded:', this.feedback);
          } else {
            this.feedback = null;
          }
        }
      },
      error: (error) => {
        console.error('Fehler beim Laden der Aufgabendetails:', error);
      }
    });
  }

  /* Verarbeitet die Dateiauswahl für die Aufgabenabgabe */
  handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      this.uploadedFile = file;
      
      this.selectedFile = {
        name: file.name,
        size: this.formatFileSize(file.size)
      };
    }
  }
  
  /* Sendet die Aufgabenabgabe mit Datei und optionalem Kommentar an den Server */
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
    
    if (this.submissionComment) {
      formData.append('comment', this.submissionComment);
    }
    
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

  /* Formatiert die Dateigröße in lesbare Einheiten (Bytes, KB, MB, GB) */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /* Navigation zurück zur Kursübersicht */
  navigateBack() {
    this.router.navigate(['/user-kurs', encodeURIComponent(this.courseName)]);
  }

  /* Öffnet den Bestätigungsdialog zum Löschen einer Abgabe */
  openDeletePopup() {
    this.showDeletePopup = true;
  }

  /* Bricht den Löschvorgang ab */
  cancelDelete() {
    this.showDeletePopup = false;
  }

  /* Bestätigt und führt das Löschen einer Abgabe durch */
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

  /* Schließt die Benachrichtigungsanzeige */
  closeNotification(): void {
    this.showNotification = false;
    this.notificationMessage = '';
  }

  /* Öffnet ein Dokument in einem neuen Tab */
  openDocument(url: SafeResourceUrl | string) {
    window.open(url.toString(), '_blank');
  }
}
