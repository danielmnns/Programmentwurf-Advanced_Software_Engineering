import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '../pipes/translate.pipe';
import { FileUrlService } from '../services/file-url.service';
import { LanguageService } from '../services/language.service';

export interface DocumentFile {
  name: string;
  url: SafeResourceUrl;
}

export interface Submission {
  file?: { name: string; url: SafeResourceUrl };
  feedback?: { text: string };
}

export interface Task {
  name: string;
  description: string;
  documents: DocumentFile[];
  submissions?: { [key: string]: Submission };
}

@Component({
  selector: 'app-user-kurs',
  templateUrl: './user-kurs.component.html',
  styleUrls: ['./user-kurs.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    RouterModule,
    TranslatePipe
  ]
})
export class KursComponent implements OnInit, OnDestroy {
  userName: string = '';
  courseName: string = '';
  textContent: string = '';
  feedbackContent: string = '';
  showPdfPreview: boolean = false;
  currentPdfUrl: SafeResourceUrl = '';
  participants: string[] = [];

  uploadedFiles = {
    documents: [] as DocumentFile[],
    abgaben: [] as DocumentFile[],
  };

  tasks: Task[] = [];

  isAuthorized: boolean = false;
  private apiUrl = 'http://localhost:3000/api/courses';
  showConfirmationDialog: boolean = false;
  fileToDelete: DocumentFile | null = null;
  fileToDeleteIndex: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    public fileUrlService: FileUrlService,
    public languageService: LanguageService
  ) {}

  ngOnInit(): void {
    const encodedCourseName = this.route.snapshot.paramMap.get('courseName')!;
    this.courseName = decodeURIComponent(encodedCourseName);

    this.checkAuthorization();
    this.loadCourseData();
  }

  checkAuthorization(): void {
    const userRoles = ['admin', 'dozent', 'studiengangsleiter'];
    this.http.get('http://localhost:3000/api/user/userdata').subscribe(
      (response: any) => {
        if (response.success && response.user) {
          this.isAuthorized = userRoles.includes(response.user.userType);
          this.userName = response.user.userName; // Setze den aktuellen Benutzernamen
        } else {
          console.error('Ungültige API-Antwort:', response);
        }
      },
      (error) => {
        console.error('Fehler beim Abrufen der Benutzerrolle:', error);
      }
    );
  }

  // Navigiert zur Admin-Kursseite
  navigateToAdminCourse(courseName: string): void {
    const encodedName = encodeURIComponent(courseName);
    this.router.navigate(['/admin-kurs', encodedName]).catch((error) => {
      console.error('Fehler beim Navigieren zur Admin-Kursseite:', error);
    });
  }

  loadCourseData(): void {
    const url = `${this.apiUrl}/user-kurs?courseName=${encodeURIComponent(this.courseName)}`;
    this.http.get(url).subscribe(
      (response: any) => {
        // Kursinformationen
        this.textContent = response.textContent || '';
        this.feedbackContent = response.feedbackContent || '';
        this.participants = response.participants || [];

        // Kursdokumente mit absoluten URLs
        if (response.documents) {
          this.uploadedFiles.documents = response.documents.map((doc: any) => ({
            name: doc.name,
            originalUrl: doc.url,
            url: this.fileUrlService.getFileUrl(doc.url),
          }));
        }

        // Allgemeine Abgaben des Kurses
        if (response.abgaben) {
          this.uploadedFiles.abgaben = response.abgaben.map((sub: any) => ({
            name: sub.name,
            url: this.sanitizer.bypassSecurityTrustResourceUrl(sub.url),
          }));
        }

        // Aufgaben inkl. Dokumente und submissions
        if (response.tasks) {
          this.tasks = response.tasks.map((task: any) => {
            if (task.documents) {
              task.documents = task.documents.map((doc: any) => ({
                name: doc.name,
                // Absolute URL verwenden
                url: this.sanitizer.bypassSecurityTrustResourceUrl(`http://localhost:3000${doc.url}`),
              }));
            }
            return task as Task;
          });
        }
      },
      (error) => {
        console.error('Fehler beim Abrufen der Kursdaten:', error);
      }
    );
  }

  // Öffnet die PDF-Vorschau
  openPdfPreview(url: SafeResourceUrl | string) {
    if (typeof url === 'string') {
      this.currentPdfUrl = this.fileUrlService.getFileUrl(url);
    } else {
      this.currentPdfUrl = url;
    }
    this.showPdfPreview = true;
  }

  closePdfPreview(): void {
    this.showPdfPreview = false;
    this.currentPdfUrl = '';
  }

  handleFileUpload(event: Event, type: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const fileUrl = URL.createObjectURL(file);
      if (type === 'abgaben') {
        this.uploadedFiles.abgaben.push({
          name: file.name,
          url: this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl),
        });
      } else {
        console.error('Ungültiger Dateityp:', type);
      }
    }
  }

  handleTaskSubmission(event: Event, task: Task): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const fileUrl = URL.createObjectURL(file);
      if (!task.submissions) {
        task.submissions = {};
      }
      task.submissions[this.userName] = {
        file: {
          name: file.name,
          url: this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl),
        },
        feedback: undefined,
      };
      console.log(`Abgabe für Aufgabe "${task.name}" von ${this.userName} hochgeladen.`);
    }
  }

  // Neuer Code: Öffnet die Aufgabe abhängig von der Benutzerrolle
  openTask(task: Task): void {
    if (this.isAuthorized) {
      // Für Admin, Dozent, Studiengangsleiter: Weiterleitung zur admin-aufgabe
      this.router.navigate(['/admin-aufgabe', this.courseName, task.name]).catch((error) => {
        console.error('Fehler beim Navigieren zur Admin-Aufgabenseite:', error);
      });
    } else {
      // Für Studierende: Weiterleitung zur user-aufgabe
      this.router.navigate(['/', this.courseName, task.name]).catch((error) => {
        console.error('Fehler beim Navigieren zur User-Aufgabenseite:', error);
      });
    }
  }

  confirmDeletion(type: 'abgaben', index: number): void {
    const fileToDelete = this.uploadedFiles.abgaben[index];
    if (fileToDelete) {
      this.fileToDelete = fileToDelete;
      this.fileToDeleteIndex = index;
      this.showConfirmationDialog = true;
    } else {
      console.error('Fehler: Datei konnte nicht gefunden werden');
    }
  }

  deleteFile(): void {
    if (this.fileToDelete && this.fileToDeleteIndex !== null) {
      const payload = {
        name: this.fileToDelete.name,
        url: this.fileToDelete.url,
        userName: this.userName,
        courseName: this.courseName,
      };
      this.http.delete(`${this.apiUrl}/abgaben`, { body: payload }).subscribe(
        () => {
          this.uploadedFiles.abgaben.splice(this.fileToDeleteIndex!, 1);
          alert(`Datei "${this.fileToDelete?.name}" wurde erfolgreich entfernt.`);
        },
        (error) => {
          console.error(`Fehler beim Löschen der Datei "${this.fileToDelete?.name}":`, error);
          alert(`Fehler beim Löschen der Datei "${this.fileToDelete?.name}".`);
        }
      );
    } else {
      console.error('Datei oder Index zum Löschen nicht gesetzt.');
    }
    this.cancelDeletion();
  }

  cancelDeletion(): void {
    this.showConfirmationDialog = false;
    this.fileToDelete = null;
    this.fileToDeleteIndex = null;
  }

  ngOnDestroy(): void {
    localStorage.removeItem('currentCourseData');
  }
}
