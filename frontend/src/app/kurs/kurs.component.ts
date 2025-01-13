import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-kurs',
  standalone: true,
  templateUrl: './kurs.component.html',
  styleUrls: ['./kurs.component.css'],
  imports: [CommonModule, FormsModule],
})
export class KursComponent {
  courseName: string = '';
  textContent: string = '';
  aufgabeContent: string = '';
  feedbackContent: string = '';

  uploadedFiles = {
    documents: [] as { name: string; url: string }[],
    aufgaben: [] as { name: string; url: string }[],
    abgaben: [] as { name: string; url: string }[],
  };

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    // Dynamischen Kursnamen aus der URL extrahieren
    this.courseName = this.route.snapshot.paramMap.get('courseName')!;
  }

  navigateToAccount() {
    this.router.navigate(['/account']);
  }

  handleFileUpload(event: Event, category: 'documents' | 'aufgaben' | 'abgaben') {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file); // Temporäre URL erstellen
      this.uploadedFiles[category].push({ name: file.name, url: fileUrl });
    }
  }

  saveText() {
    console.log('Text gespeichert:', this.textContent);
    alert('Text wurde gespeichert!');
  }

  saveAufgabe() {
    console.log('Aufgabe gespeichert:', this.aufgabeContent);
    alert('Aufgabe wurde gespeichert!');
  }

  saveFeedback() {
    console.log('Feedback gespeichert:', this.feedbackContent);
    alert('Feedback wurde gespeichert!');
  }
}
