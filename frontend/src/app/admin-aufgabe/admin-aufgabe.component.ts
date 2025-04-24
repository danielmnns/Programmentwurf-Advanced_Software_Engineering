import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '../pipes/translate.pipe';
import { LanguageService } from '../services/language.service';

interface DocumentFile {
  name: string;
  url: SafeResourceUrl;
  date?: Date;
}

interface Submission {
  userName: string;
  file?: { name: string; url: string }; // Optional gemacht
  feedback?: { text: string };
  feedbackText?: string;
  date?: Date;
  fileName?: string;
  fileUrl?: SafeResourceUrl;
  comment?: string; // Added student comment field
}

interface AdminTaskDetails {
  name: string;
  description?: string;
  courseName: string;
  taskName: string;
  taskDescription: string;
  submissions?: Array<{
    userName: string;
    file?: { name: string; url: string };
    feedback?: { text: string };
    date?: string;
  }>;
  documents?: Array<{
    name: string;
    url: string;
    date?: string;
  }>;
}

@Component({
  selector: 'app-admin-aufgabe',
  templateUrl: './admin-aufgabe.component.html',
  styleUrls: ['./admin-aufgabe.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    RouterModule,
    TranslatePipe
  ]
})
export class AdminAufgabeComponent implements OnInit {
  courseName: string = '';
  taskName: string = '';
  taskDescription: string = '';
  uploadedDocuments: DocumentFile[] = [];
  submissions: Submission[] = [];
  showSubmissionPopup: boolean = false;
  currentSubmission: any = null;
  feedbackText: string = '';
  showFeedbackPopup: boolean = false;
  submissionForFeedback: any = null;
  showConfirmationDialog: boolean = false;
  submissionToDelete: Submission | null = null;
  submissionToDeleteIndex: number | null = null;
  showDeletionSuccess: boolean = false;
  deletedSubmissionName: string = '';
  adminUsername: string = 'admin';
  showNotification: boolean = false;
  notificationMessage: string = '';

  private readonly apiUrl = 'http://localhost:3000/api';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly http: HttpClient,
    private readonly sanitizer: DomSanitizer,
    public readonly languageService: LanguageService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe({
      next: (params) => {
        this.courseName = params.get('courseName') ?? '';
        this.taskName = params.get('taskName') ?? '';

        if (this.courseName && this.taskName) {
          this.loadTaskDetails();
        }
      }
    });
  }

  loadTaskDetails(): void {
    // URL für Admin-Ansicht korrigiert, um den richtigen Endpunkt zu verwenden
    const payload = {
      courseName: this.courseName,
      taskName: this.taskName
    };

    // Nutze den korrekten Endpunkt für die Abfrage der Aufgabendetails mit den Abgaben
    this.http.post(`${this.apiUrl}/tasks/admin/submissions`, payload).subscribe({
      next: (data: any) => {
        this.taskName = data.taskName;
        this.taskDescription = data.taskDescription ?? '';

        // Abgaben verarbeiten
        if (data.submissions && data.submissions.length > 0) {
          this.submissions = data.submissions.map((sub: any) => {
            const submission: Submission = {
              userName: sub.userName,
              feedbackText: sub.feedback?.text || '',
              date: sub.date ? new Date(sub.date) : new Date(),
              comment: sub.comment || '' // Added to capture student comment
            };

            if (sub.file) {
              submission.fileName = sub.file.name;
              submission.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(sub.file.url);
              submission.file = sub.file;
            }

            return submission;
          });
        } else {
          this.submissions = [];
        }

        // Aufgabendokumente laden
        this.loadTaskDocuments();

        console.log("Geladene Aufgabendetails:", {
          taskName: this.taskName,
          taskDescription: this.taskDescription,
          submissions: this.submissions
        });
      },
      error: (error) => {
        console.error('Fehler beim Laden der Aufgabendetails:', error);
        this.showNotificationPopup('Fehler beim Laden der Aufgabendetails');
      }
    });
  }

  // Separate Methode zum Laden der Aufgabendokumente
  loadTaskDocuments(): void {
    const userName = 'admin'; // Verwende einen Admin-Benutzer für die Abfrage
    const apiUrl = `${this.apiUrl}/tasks/user-task`;

    this.http.get(`${apiUrl}?courseName=${encodeURIComponent(this.courseName)}&taskName=${encodeURIComponent(this.taskName)}&userName=${userName}`).subscribe({
      next: (response: any) => {
        // Aufgabendokumente verarbeiten
        if (response.documents && response.documents.length > 0) {
          this.uploadedDocuments = response.documents.map((doc: any) => ({
            name: doc.name,
            url: this.sanitizer.bypassSecurityTrustResourceUrl(doc.url),
            date: doc.date ? new Date(doc.date) : new Date()
          }));
        } else {
          this.uploadedDocuments = [];
        }
      },
      error: (error) => {
        console.error('Fehler beim Laden der Aufgabendokumente:', error);
      }
    });
  }

  // Speichert das Feedback für eine bestimmte Abgabe
  saveFeedback(submission: Submission): void {
    if (!submission.feedbackText || submission.feedbackText.trim() === '') {
      this.showNotificationPopup('Bitte geben Sie ein Feedback ein.');
      return;
    }

    const payload = {
      courseName: this.courseName,
      taskName: this.taskName,
      submissionName: submission.fileName ?? '',
      studentName: submission.userName,
      feedbackText: submission.feedbackText,
      feedbackBy: this.adminUsername
    };

    this.http.post(`${this.apiUrl}/tasks/admin/feedback`, payload).subscribe({
      next: (response) => {
        console.log('Feedback erfolgreich gespeichert', response);
        this.showNotificationPopup('Feedback erfolgreich gespeichert.');
        // Nach erfolgreichem Speichern können die Daten neu geladen werden
        this.loadAdminTaskData();
      },
      error: (error) => {
        console.error('Fehler beim Speichern des Feedbacks:', error);
        this.showNotificationPopup('Fehler beim Speichern des Feedbacks.');
      }
    });
  }

  // Lädt Aufgabendaten neu
  loadAdminTaskData(): void {
    // Einfach die bestehende loadTaskDetails-Methode aufrufen
    this.loadTaskDetails();
  }

  // Zeigt das Benachrichtigungs-Popup an
  showNotificationPopup(message: string): void {
    this.notificationMessage = message;
    this.showNotification = true;
  }

  closeNotification(): void {
    this.showNotification = false;
    this.notificationMessage = '';
  }

  // Navigiert zurück zur Kursverwaltungs-Seite
  navigateBack(): void {
    this.router.navigate(['/user-kurs', this.courseName]);
  }
}
