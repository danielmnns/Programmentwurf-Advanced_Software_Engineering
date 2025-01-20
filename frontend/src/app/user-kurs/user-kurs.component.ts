import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../services/course.service';

@Component({
  selector: 'app-user-kurs',
  templateUrl: './user-kurs.component.html',
  styleUrls: ['./user-kurs.component.css']
})
export class KursComponent implements OnInit, OnDestroy {
  courseName: string = '';
  courseData: any = null; // Daten des Kurses vom Backend
  participants: string[] = ['Max Mustermann', 'Erika Musterfrau', 'Hans Schmidt'];
  
  uploadedFiles = {
    documents: [] as { name: string; url: string }[],
    aufgaben: [] as { name: string; url: string }[],
    abgaben: [] as { name: string; url: string }[]
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService // Für Backend-Abfragen
  ) {}

  ngOnInit(): void {
    // Immer bei einem Seitenrefresh wird eine neue Anfrage ans Backend gesendet
    this.loadCourseData();
  }

  loadCourseData(): void {
    this.courseService.getCourseData().subscribe(
      (response) => {
        console.log('Kursdaten vom Backend geladen:', response);
        this.courseData = response;
        // Speichern der Kursdaten im LocalStorage für die Dauer des Seitenaufrufs
        localStorage.setItem('currentCourseData', JSON.stringify(response));

        if (response.courseName) {
          this.courseName = response.courseName; // Kursname setzen
          this.updateUrlWithCourseName(this.courseName);
        } else {
          console.error('Kursname im Backend-Response nicht gefunden.');
        }
        this.participants = response.participants || [];
      },
      (error) => {
        console.error('Fehler beim Laden der Kursdaten:', error);
      }
    );
  }

  updateUrlWithCourseName(courseName: string): void {
    const encodedName = encodeURIComponent(courseName);
    this.router.navigate(['/user-kurs', encodedName], { replaceUrl: true });
  }

  ngOnDestroy(): void {
    // Löschen der Kursdaten aus dem LocalStorage, wenn die Seite verlassen wird
    localStorage.removeItem('currentCourseData');
  }

  handleFileUpload(event: Event, type: 'abgaben'): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const fileUrl = URL.createObjectURL(file); // Erstellen eines temporären URL-Links
      const newFile = { name: file.name, url: fileUrl };

      if (type === 'abgaben') {
        this.uploadedFiles.abgaben.push(newFile);
      }

      // Optional: Senden der Datei an das Backend (nur wenn erforderlich)
      // this.uploadFileToBackend(file, type);
    }
  }

  downloadFile(fileUrl: string): void {
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = fileUrl.split('/').pop()!;
    a.click();
  }
}
