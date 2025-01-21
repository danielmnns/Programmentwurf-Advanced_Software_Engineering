import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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
  participants: string[] = [];
  uploadedFiles = {
    documents: [] as { name: string; url: string }[],
    aufgaben: [] as { name: string; url: string }[],
    abgaben: [] as { name: string; url: string }[],
  };

  isAuthorized: boolean = false; // Sichtbarkeitsbedingung für das Icon
  private apiUrl = 'http://localhost:3000/api/courses'; // Backend-API-URL
  showConfirmationDialog: boolean = false;
  fileToDelete: { name: string; url: string } | null = null;
  fileToDeleteIndex: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const encodedCourseName = this.route.snapshot.paramMap.get('courseName')!;
    this.courseName = decodeURIComponent(encodedCourseName);

    this.checkAuthorization(); // Überprüfung der Rolle
    this.loadCourseData();
  }

  checkAuthorization(): void {
    const userRoles = ['admin', 'dozent', 'studiengangsleiter']; // Erlaubte Rollen
    this.http.get('http://localhost:3000/api/user/userdata').subscribe(
      (response: any) => {
        if (response.success && response.user) {
          this.isAuthorized = userRoles.includes(response.user.userType); // Benutzerrolle prüfen
          console.log('Benutzerrolle:', response.user.userType); // Debug
          console.log('isAuthorized:', this.isAuthorized); // Debug
        } else {
          console.error('Ungültige API-Antwort:', response);
        }
      },
      (error) => {
        console.error('Fehler beim Abrufen der Benutzerrolle:', error);
      }
    );
  }
  
  

  // Navigation zur Admin-Kursseite
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
            url: doc.url,
          }));
        }

        if (response.aufgaben) {
          this.uploadedFiles.aufgaben = response.aufgaben.map((task: any) => ({
            name: task.name,
            url: task.url,
          }));
        }

        if (response.abgaben) {
          this.uploadedFiles.abgaben = response.abgaben.map((submission: any) => ({
            name: submission.name,
            url: submission.url,
          }));
        }
      },
      (error) => {
        console.error('Fehler beim Abrufen der Kursdaten:', error);
      }
    );
  }

  handleFileUpload(event: Event, type: string): void {
    const input = event.target as HTMLInputElement;
  
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const fileUrl = URL.createObjectURL(file);
  
      if (type === 'abgaben') {
        this.uploadedFiles.abgaben.push({ name: file.name, url: fileUrl });
      } else {
        console.error('Ungültiger Dateityp:', type);
      }
    }
  }

  confirmDeletion(type: 'abgaben', index: number): void {
    this.fileToDelete = this.uploadedFiles[type][index];
    this.fileToDeleteIndex = index;
    this.showConfirmationDialog = true;
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


