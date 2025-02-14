import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
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
  
  /**
   * Diese Methode wird nun auch für die Kategorien "documents" und "aufgaben" verwendet,
   * um eine Datei mittels FormData an den entsprechenden Backend-Endpunkt zu senden.
   * Für "abgaben" bleibt die bisherige lokale Lösung erhalten.
   */
  handleFileUpload(event: Event, category: 'documents' | 'aufgaben' | 'abgaben'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (category === 'documents' || category === 'aufgaben') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('courseName', this.courseName);
        // Wähle den richtigen Endpunkt basierend auf der Kategorie
        let endpoint = '';
        if (category === 'documents') {
          endpoint = '/admin/addDocument';
        } else if (category === 'aufgaben') {
          endpoint = '/admin/addAufgabe';
        }
        this.http.post(`${this.apiUrl}${endpoint}`, formData).subscribe(
          (response: any) => {
            alert(`${category === 'documents' ? 'Dokument' : 'Aufgabe'} erfolgreich hinzugefügt!`);
            // Kursdaten neu laden, um die aktuell gespeicherten Einträge anzuzeigen
            this.loadCourseData();
          },
          (error) => {
            console.error(`Fehler beim Hinzufügen des ${category === 'documents' ? 'Dokuments' : 'Aufgabe'}`, error);
            alert(`Fehler beim Hinzufügen des ${category === 'documents' ? 'Dokuments' : 'Aufgabe'}`);
          }
        );
      } else if (category === 'abgaben') {
        // Für Abgaben wird aktuell nur ein URL.createObjectURL verwendet
        const fileUrl = URL.createObjectURL(file);
        this.uploadedFiles.abgaben.push({ name: file.name, url: fileUrl });
      }
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

  saveText(): void {
    const payload = { courseName: this.courseName, textContent: this.textContent };
    this.http.post(this.apiUrl, payload).subscribe(
      () => alert('Text wurde erfolgreich gespeichert!'),
      (error) => console.error('Fehler beim Speichern des Textes:', error)
    );
  }

  saveAufgabe(): void {
    const payload = { courseName: this.courseName, aufgabeContent: this.aufgabeContent };
    this.http.post(this.apiUrl, payload).subscribe(
      () => alert('Aufgabe wurde erfolgreich gespeichert!'),
      (error) => console.error('Fehler beim Speichern der Aufgabe:', error)
    );
  }

  saveFeedback(): void {
    const payload = { courseName: this.courseName, feedbackContent: this.feedbackContent };
    this.http.post(this.apiUrl, payload).subscribe(
      () => alert('Feedback wurde erfolgreich gespeichert!'),
      (error) => console.error('Fehler beim Speichern des Feedbacks:', error)
    );
  }
}
