import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

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
  submissionFile?: { name: string; url: SafeResourceUrl };
  feedback?: { text: string; feedbackFrom: string };

  // Zustände für Popups
  showDeletePopup: boolean = false;
  showNotification: boolean = false;
  notificationMessage: string = '';

  private apiUrl = 'http://localhost:3000/api/tasks';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.courseName = this.route.snapshot.paramMap.get('courseName')!;
    this.taskName = this.route.snapshot.paramMap.get('taskName')!;
    this.loadTaskData();
  }

  loadTaskData(): void {
    const payload = {
      courseName: this.courseName,
      taskName: this.taskName,
    };

    this.http.post<TaskDetails>(`${this.apiUrl}/user`, payload).subscribe(
      (data) => {
        this.taskDescription = data.taskDescription;
        if (data.submission) {
          if (data.submission.file) {
            this.submissionFile = {
              name: data.submission.file.name,
              url: this.sanitizer.bypassSecurityTrustResourceUrl(data.submission.file.url)
            };
          } else {
            this.submissionFile = undefined;
          }
          if (data.submission.feedback) {
            this.feedback = {
              text: data.submission.feedback.text,
              feedbackFrom: data.submission.feedbackFrom || ''
            };
          } else {
            this.feedback = undefined;
          }
        }
      },
      (error) => {
        console.error('Fehler beim Laden der Aufgabendaten:', error);
        this.showNotificationPopup("Fehler beim Laden der Aufgabendaten.");
      }
    );
  }

  handleFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('courseName', this.courseName);
      formData.append('taskName', this.taskName);

      this.http.post(`${this.apiUrl}/upload`, formData).subscribe(
        (response) => {
          console.log('Datei erfolgreich hochgeladen', response);
          this.showNotificationPopup("Datei erfolgreich hochgeladen.");
          this.loadTaskData();
        },
        (error) => {
          console.error('Fehler beim Hochladen der Datei:', error);
          this.showNotificationPopup("Fehler beim Hochladen der Datei.");
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
