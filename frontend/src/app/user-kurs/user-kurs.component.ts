import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../services/course.service';

@Component({
  selector: 'app-user-kurs',
  templateUrl: './user-kurs.component.html',
  styleUrls: ['./user-kurs.component.css']
})
export class KursComponent implements OnInit {
  currentDate: string = '';
  currentTime: string = '';
  userName: string = '';
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
    this.courseName = decodeURIComponent(this.route.snapshot.paramMap.get('name')!);
    this.loadCourseData(); // Kursdaten laden
  }


  loadCourseData() {
    this.courseService.getCourseByName(this.courseName).subscribe(
      (data) => {
        this.courseData = data; // Kursdaten vom Backend zuweisen
        this.participants = data.participants || []; // Teilnehmer aktualisieren
      },
      (error) => {
        console.error('Fehler beim Laden der Kursdaten:', error);
      }
    );
  }


  handleFileUpload(event: Event, category: 'abgaben') {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      this.uploadedFiles[category].push({ name: file.name, url: fileUrl });
    }
  }

  downloadFile(fileUrl: string): void {
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = fileUrl.split('/').pop()!;
    a.click();
  }
}
