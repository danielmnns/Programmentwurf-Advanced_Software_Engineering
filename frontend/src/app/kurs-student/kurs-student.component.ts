import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-kurs-student',
  standalone: true,
  templateUrl: './kurs-student.component.html',
  styleUrls: ['./kurs-student.component.css'],
  imports: [CommonModule, FormsModule],
})
export class KursStudentComponent implements OnInit {
  currentDate: string = '';
  currentTime: string = '';
  userName: string = '';
  courseName: string = '';
  textContent: string = 'Hier ist der bereitgestellte Kurs-Text.';
  aufgabeContent: string = 'Dies ist die Beschreibung der Aufgabe.';
  feedbackContent: string = 'Feedback von Lehrenden wird hier angezeigt.';

  uploadedFiles = {
    documents: [
      { name: 'Dokument1.pdf', url: '/assets/Dokument1.pdf' },
      { name: 'Dokument2.pdf', url: '/assets/Dokument2.pdf' },
    ],
    aufgaben: [
      { name: 'Aufgabe1.pdf', url: '/assets/Aufgabe1.pdf' },
    ],
    abgaben: [] as { name: string; url: string }[],
  };

  participants: string[] = ['Teilnehmer A', 'Teilnehmer B', 'Teilnehmer C'];

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

  handleFileUpload(event: Event, category: 'abgaben') {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      this.uploadedFiles[category].push({ name: file.name, url: fileUrl });
    }
  }
}
