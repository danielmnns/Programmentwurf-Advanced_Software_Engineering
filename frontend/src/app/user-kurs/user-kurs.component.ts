import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-user-kurs',
  templateUrl: './user-kurs.component.html',
  styleUrls: ['./user-kurs.component.css'],
})
export class KursComponent implements OnInit, OnDestroy {
  courseName: string = '';
  courseData: any = null; // Kursdaten, die vom Backend geladen werden
  uploadedFiles = {
    documents: [] as { name: string; url: string }[],
    aufgaben: [] as { name: string; url: string }[],
    abgaben: [] as { name: string; url: string }[],
  };

  private apiUrl = 'http://localhost:3000/api/courses'; // Backend-API-URL

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.courseName = this.route.snapshot.paramMap.get('courseName')!;
    this.loadCourseData();
  }

  loadCourseData(): void {
    this.http.get(`${this.apiUrl}/user-kurs`).subscribe(
      (response: any) => {
        this.courseData = response;

        if (response.courseName) {
          //this.courseName = response.courseName; Wenn kursname aus Backend Angezeigt werden soll einkommentieren 
          this.updateUrlWithCourseName(this.courseName);
        }

        localStorage.setItem('currentCourseData', JSON.stringify(response));
      },
      (error) => console.error('Fehler beim Abrufen der Kursdaten:', error)
    );
  }

  updateUrlWithCourseName(courseName: string): void {
    const encodedName = encodeURIComponent(courseName);
    this.router.navigate(['/user-kurs', encodedName], { replaceUrl: true });
  }

  handleFileUpload(event: Event, type: 'abgaben'): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const fileUrl = URL.createObjectURL(file);
      this.uploadedFiles.abgaben.push({ name: file.name, url: fileUrl });
    }
  }

  ngOnDestroy(): void {
    localStorage.removeItem('currentCourseData');
  }
}
