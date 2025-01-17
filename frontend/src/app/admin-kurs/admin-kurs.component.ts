import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-user-kurs',
  templateUrl: './admin-kurs.component.html',
  styleUrls: ['./admin-kurs.component.css']
})
export class AdminKursComponent implements OnInit {
  currentDate: string = '';
  currentTime: string = '';
  userName: string = '';
  courseName: string = '';
  textContent: string = '';
  aufgabeContent: string = '';
  feedbackContent: string = '';
  participants: string[] = ['Max Mustermann', 'Erika Musterfrau', 'Hans Schmidt'];

  uploadedFiles = {
    documents: [] as { name: string; url: string }[],
    aufgaben: [] as { name: string; url: string }[],
    abgaben: [] as { name: string; url: string }[]
  };

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.initializeHeaderFunctions();
    this.courseName = this.route.snapshot.paramMap.get('courseName')!;
  }

  initializeHeaderFunctions() {
    this.updateDateTime();
    setInterval(() => this.updateDateTime(), 1000);
    this.loadUserData();
  }

  updateDateTime() {
    const now = new Date();
    this.currentDate = now.toLocaleDateString();
    this.currentTime = now.toLocaleTimeString();
  }

  loadUserData() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (userData.name) {
      this.userName = userData.name;
    }
  }

  navigateToAccount() {
    this.router.navigate(['/account']);
  }

  navigateToHome(): void {
    this.router.navigate(['/startseite']);
  }

  handleFileUpload(event: Event, category: 'documents' | 'aufgaben' | 'abgaben') {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      this.uploadedFiles[category].push({ name: file.name, url: fileUrl });
    }
  }

  saveText() {
    alert('Text wurde gespeichert!');
  }

  saveAufgabe() {
    alert('Aufgabe wurde gespeichert!');
  }

  saveFeedback() {
    alert('Feedback wurde gespeichert!');
  }
}
