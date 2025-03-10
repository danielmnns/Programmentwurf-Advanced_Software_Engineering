import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { NewTaskDialogComponent } from '../new-task-dialog/new-task-dialog.component';

@Component({
  selector: 'app-admin-kurs',
  templateUrl: './admin-kurs.component.html',
  styleUrls: ['./admin-kurs.component.css']
})
export class AdminKursComponent implements OnInit, OnDestroy {
  courseName: string = '';
  textContent: string = '';
  participants: string[] = [];

  // Hier werden nur Dokumente verwaltet – Aufgaben werden via Popup erstellt
  uploadedFiles = {
    documents: [] as { name: string; url: string }[]
  };

  private apiUrl = 'http://localhost:3000/api/courses';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const encodedCourseName = this.route.snapshot.paramMap.get('courseName')!;
    this.courseName = decodeURIComponent(encodedCourseName);
    this.loadCourseData();
  }

  navigateToUserCourse(courseName: string): void {
    const encodedName = encodeURIComponent(courseName);
    this.router.navigate(['/user-kurs', encodedName]).catch((error) => {
      console.error('Fehler beim Navigieren zur User-Kurs-Seite:', error);
    });
  }

  handleFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('courseName', this.courseName);
      const endpoint = '/admin/addDocument';
      this.http.post(`${this.apiUrl}${endpoint}`, formData).subscribe(
        (response: any) => {
          alert('Dokument erfolgreich hinzugefügt!');
          this.loadCourseData();
        },
        (error) => {
          console.error('Fehler beim Hinzufügen des Dokuments', error);
          alert('Fehler beim Hinzufügen des Dokuments');
        }
      );
    }
  }

  loadCourseData(): void {
    const url = `${this.apiUrl}/admin-kurs`;
    this.http.get(url).subscribe(
      (response: any) => {
        this.textContent = response.textContent || '';
        this.participants = response.participants || [];
        if (response.documents) {
          this.uploadedFiles.documents = response.documents.map((doc: any) => ({
            name: doc.name,
            url: doc.url,
          }));
        }
      },
      (error) => {
        console.error('Fehler beim Abrufen der Kursdaten:', error);
      }
    );
  }

  openNewTaskDialog(): void {
    const dialogRef = this.dialog.open(NewTaskDialogComponent, {
      width: '400px',
      data: { courseName: this.courseName }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Bei erfolgreicher Erstellung der Aufgabe kann hier z. B. die Kursdaten neu geladen werden.
        this.loadCourseData();
      }
    });
  }

  updateUrlWithCourseName(courseName: string): void {
    const encodedName = encodeURIComponent(courseName);
    this.router.navigate(['/admin-kurs', encodedName], { replaceUrl: true }).catch((error) => {
      console.error('Fehler beim Navigieren zur Kursseite:', error);
    });
  }

  ngOnDestroy(): void {
    localStorage.removeItem('currentCourseData');
  }

  saveText(): void {
    const payload = { courseName: this.courseName, textContent: this.textContent };
    this.http.post(this.apiUrl, payload).subscribe(
      () => alert('Text wurde erfolgreich gespeichert!'),
      (error) => console.error('Fehler beim Speichern des Textes:', error)
    );
  }
}
