import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-kurs',
  templateUrl: './admin-kurs.component.html',
  styleUrls: ['./admin-kurs.component.css']
})
export class AdminKursComponent implements OnInit, OnDestroy {
  userName: string = '';
  courseName: string = '';
  textContent: string = '';
  aufgabeContent: string = '';
  feedbackContent: string = '';
  participants: string[] = [];

  uploadedFiles = {
    documents: [] as { name: string; url: string }[],
    aufgaben: [] as { name: string; url: string }[],
    abgaben: [] as { name: string; url: string }[]
  };

  private apiUrl = 'http://localhost:3000/api/courses';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Kursname aus der URL dekodieren
    const encodedCourseName = this.route.snapshot.paramMap.get('courseName')!;
    this.courseName = decodeURIComponent(encodedCourseName);

    // Kursdaten laden
    this.loadCourseData();
  }

  navigateToUserCourse(courseName: string): void {
    const encodedName = encodeURIComponent(courseName);
    this.router.navigate(['/user-kurs', encodedName]).catch((error) => {
      console.error('Fehler beim Navigieren zur User-Kurs-Seite:', error);
    });
  }
  
  handleFileUpload(event: Event, category: 'documents' | 'aufgaben' | 'abgaben') {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      this.uploadedFiles[category].push({ name: file.name, url: fileUrl });
    }
  }

  loadCourseData(): void {
    // API-Endpunkt für Kursdaten
    const url = `${this.apiUrl}/admin-kurs`;
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
  
        // Backend-Aufgaben hinzufügen
        if (response.aufgaben) {
          this.uploadedFiles.aufgaben = response.aufgaben.map((task: any) => ({
            name: task.name,
            url: task.url,
          }));
        }
  
        // Backend-Abgaben hinzufügen
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

  updateUrlWithCourseName(courseName: string): void {
    const encodedName = encodeURIComponent(courseName);
    this.router.navigate(['/admin-kurs', encodedName], { replaceUrl: true }).catch((error) => {
      console.error('Fehler beim Navigieren zur Kursseite:', error);
    });
  }

  ngOnDestroy(): void {
    // Löschen der Kursdaten aus dem LocalStorage, wenn die Seite verlassen wird
    localStorage.removeItem('currentCourseData');
  }

  saveText() {
    const payload = { courseName: this.courseName, textContent: this.textContent };
    this.http.post(this.apiUrl, payload).subscribe(
      () => alert('Text wurde erfolgreich gespeichert!'),
      (error) => console.error('Fehler beim Speichern des Textes:', error)
    );
  }

  saveAufgabe() {
    const payload = { courseName: this.courseName, aufgabeContent: this.aufgabeContent };
    this.http.post(this.apiUrl, payload).subscribe(
      () => alert('Aufgabe wurde erfolgreich gespeichert!'),
      (error) => console.error('Fehler beim Speichern der Aufgabe:', error)
    );
  }

  saveFeedback() {
    const payload = { courseName: this.courseName, feedbackContent: this.feedbackContent };
    this.http.post(this.apiUrl, payload).subscribe(
      () => alert('Feedback wurde erfolgreich gespeichert!'),
      (error) => console.error('Fehler beim Speichern des Feedbacks:', error)
    );
  }

  
}

