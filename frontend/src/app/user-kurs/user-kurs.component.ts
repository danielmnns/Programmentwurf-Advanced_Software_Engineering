import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-user-kurs',
  templateUrl: './user-kurs.component.html',
  styleUrls: ['./user-kurs.component.css'],
})
export class KursComponent implements OnInit, OnDestroy {
  userName: string = '';
  courseName: string = '';
  textContent: string = '';
  aufgabeContent: string = '';
  feedbackContent: string = '';
  showPdfPreview: boolean = false;
  currentPdfUrl: SafeResourceUrl = '';
  participants: string[] = [];
  uploadedFiles = {
    documents: [] as { name: string; url: SafeResourceUrl }[],
    aufgaben: [] as { name: string; url: SafeResourceUrl }[],
    abgaben: [] as { name: string; url: SafeResourceUrl }[],
  };

  isAuthorized: boolean = false;
  private apiUrl = 'http://localhost:3000/api/courses';
  showConfirmationDialog: boolean = false;
  fileToDelete: { name: string; url: SafeResourceUrl } | null = null;
  fileToDeleteIndex: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private sanitizer: DomSanitizer
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
        } else {
          console.error('Ungültige API-Antwort:', response);
        }
      },
      (error) => {
        console.error('Fehler beim Abrufen der Benutzerrolle:', error);
      }
    );
  }

  navigateToAdminCourse(courseName: string): void {
    const encodedName = encodeURIComponent(courseName);
    this.router.navigate(['/admin-kurs', encodedName]).catch((error) => {
      console.error('Fehler beim Navigieren zur Admin-Kursseite:', error);
    });
  }

  loadCourseData(): void {
    const url = `${this.apiUrl}/user-kurs`;
    this.http.get(url).subscribe(
      (response: any) => {
        this.textContent = response.textContent || '';
        this.aufgabeContent = response.aufgabeContent || '';
        this.feedbackContent = response.feedbackContent || '';
        this.participants = response.participants || [];

        if (response.documents) {
          this.uploadedFiles.documents = response.documents.map((doc: any) => ({
            name: doc.name,
            url: this.sanitizer.bypassSecurityTrustResourceUrl(doc.url),
          }));
        }

        if (response.aufgaben) {
          this.uploadedFiles.aufgaben = response.aufgaben.map((task: any) => ({
            name: task.name,
            url: this.sanitizer.bypassSecurityTrustResourceUrl(task.url),
          }));
        }

        if (response.abgaben) {
          this.uploadedFiles.abgaben = response.abgaben.map((submission: any) => ({
            name: submission.name,
            url: this.sanitizer.bypassSecurityTrustResourceUrl(submission.url),
          }));
        }
      },
      (error) => {
        console.error('Fehler beim Abrufen der Kursdaten:', error);
      }
    );
  }

  openPdfPreview(url: SafeResourceUrl): void {
    this.currentPdfUrl = url;
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

  confirmDeletion(type: 'abgaben', index: number): void {
    // Sicherstellen, dass der Index und die Datei korrekt gesetzt werden
    const fileToDelete = this.uploadedFiles[type][index];
  
    if (fileToDelete) {
      // Datei und Index setzen, um die Löschbestätigung zu ermöglichen
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
          // Erfolgreich gelöscht
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
  
    // Bestätigung und Index zurücksetzen, nachdem die Löschung abgeschlossen ist
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
