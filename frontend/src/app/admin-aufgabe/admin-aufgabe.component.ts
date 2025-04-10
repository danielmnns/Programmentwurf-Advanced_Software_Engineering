import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

interface Submission {
  userName: string;
  file: { name: string; url: string };
  feedback?: { text: string };
  feedbackText?: string;
}

interface AdminTaskDetails {
  courseName: string;
  taskName: string;
  taskDescription: string;
  submissions: Submission[];
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
    RouterModule
  ]
})
export class AdminAufgabeComponent implements OnInit {
  courseName: string = '';
  taskName: string = '';
  taskDescription: string = '';
  submissions: Submission[] = [];

  // Hier den Benutzernamen des Dozenten (Feedbackgeber) angeben
  adminUsername: string = 'DozentAdmin';

  // Zustände für das Benachrichtigungs-Popup
  showNotification: boolean = false;
  notificationMessage: string = '';

  // Basis-URL für API-Aufrufe
  private apiUrl = 'http://localhost:3000/api';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.courseName = this.route.snapshot.paramMap.get('courseName')!;
    this.taskName = this.route.snapshot.paramMap.get('taskName')!;
    this.loadAdminTaskData();
  }

  // Lädt die Daten der Aufgabe inklusive aller Benutzerabgaben
  loadAdminTaskData(): void {
    const payload = {
      courseName: this.courseName,
      taskName: this.taskName
    };

    this.http.post<AdminTaskDetails>(`${this.apiUrl}/tasks/admin/submissions`, payload).subscribe(
      data => {
        this.taskDescription = data.taskDescription;  
        // Initialisiere das Feedback-Eingabefeld mit vorhandenem Feedback oder als leerer String
        this.submissions = data.submissions.map(sub => ({
          ...sub,
          feedbackText: sub.feedback ? sub.feedback.text : ''
        }));
      },
      error => {
        console.error('Fehler beim Laden der Abgabendaten:', error);
        this.showNotificationPopup('Fehler beim Laden der Abgabendaten.');
      }
    );
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
      submissionName: submission.file.name,
      studentName: submission.userName,
      feedbackText: submission.feedbackText,
      feedbackBy: this.adminUsername
    };

    this.http.post(`${this.apiUrl}/tasks/admin/feedback`, payload).subscribe(
      response => {
        console.log('Feedback erfolgreich gespeichert', response);
        this.showNotificationPopup('Feedback erfolgreich gespeichert.');
        // Nach erfolgreichem Speichern können die Daten neu geladen werden
        this.loadAdminTaskData();
      },
      error => {
        console.error('Fehler beim Speichern des Feedbacks:', error);
        this.showNotificationPopup('Fehler beim Speichern des Feedbacks.');
      }
    );
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

  // Navigiert zurück zur Kursverwaltungs-Seite (Pfad ggf. anpassen)
  navigateBack(): void {
    this.router.navigate(['/admin-kurs', this.courseName]);
  }
}
