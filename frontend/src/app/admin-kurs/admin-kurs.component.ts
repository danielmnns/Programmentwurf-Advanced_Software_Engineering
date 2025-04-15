import { CommonModule, Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list'; // Add this for mat-list
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { NewTaskDialogComponent } from '../new-task-dialog/new-task-dialog.component';
import { TranslatePipe } from '../pipes/translate.pipe';
import { FileUrlService } from '../services/file-url.service';
import { LanguageService } from '../services/language.service';
import { StatusService } from '../services/status.service';

export interface DocumentFile {
  name: string;
  url: string;
}

export interface Task {
  taskId?: string;
  name: string;
  description: string;
  documents: DocumentFile[];
}

@Component({
  selector: 'app-admin-kurs',
  templateUrl: './admin-kurs.component.html',
  styleUrls: ['./admin-kurs.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    TranslatePipe
  ]
})
export class AdminKursComponent implements OnInit {
  courseName: string = '';
  textContent: string = '';
  participants: string[] = [];
  uploadedDocuments: DocumentFile[] = [];
  tasks: Task[] = [];
  showDeleteMaterialConfirmation: boolean = false;
  materialToDelete: DocumentFile | null = null;
  showMaterialCreationConfirmation: boolean = false;
  createdMaterialName: string = '';
  showTaskMaterialConfirmation: boolean = false;
  createdTaskMaterialName: string = '';
  currentTaskForMaterial: Task | null = null;
  showMaterialRemovalSuccess: boolean = false;
  removedMaterialName: string = '';

  private apiUrl = 'http://localhost:3000/api/courses';

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private http: HttpClient,
    private dialog: MatDialog,
    public fileUrlService: FileUrlService,
    private sanitizer: DomSanitizer,
    public languageService: LanguageService,
    private statusService: StatusService,
    private location: Location // Add Location service
  ) {}

  ngOnInit(): void {
    const encodedCourseName = this.route.snapshot.paramMap.get('courseName')!;
    this.courseName = decodeURIComponent(encodedCourseName);
    this.loadCourseData();
  }

  // Show material deletion confirmation popup
  showDeleteMaterialConfirmationPopup(doc: DocumentFile): void {
    this.materialToDelete = doc;
    this.showDeleteMaterialConfirmation = true;
  }

  // Confirm material deletion
  confirmDeleteMaterial(): void {
    if (this.materialToDelete) {
      this.removeDocument(this.materialToDelete);
      this.cancelDeleteMaterial();
    }
  }

  // Cancel material deletion
  cancelDeleteMaterial(): void {
    this.showDeleteMaterialConfirmation = false;
    this.materialToDelete = null;
  }

  // Show material removal success popup
  showMaterialRemovalSuccessPopup(fileName: string): void {
    this.removedMaterialName = fileName;
    this.showMaterialRemovalSuccess = true;
    
    // Auto-hide the success message after 3 seconds
    setTimeout(() => {
      this.hideMaterialRemovalSuccessPopup();
    }, 3000);
  }

  // Hide material removal success popup
  hideMaterialRemovalSuccessPopup(): void {
    this.showMaterialRemovalSuccess = false;
    this.removedMaterialName = '';
  }

  // remove documents
  removeDocument(doc: DocumentFile): void {
    const payload = {
      courseName: this.courseName,
      documentName: doc.name
    };

    this.http.request('delete', `${this.apiUrl}/admin/removeDocument`, { body: payload }).subscribe(
      (response: any) => {
        this.uploadedDocuments = this.uploadedDocuments.filter(d => d.name !== doc.name);
        // Show the removal success popup
        this.showMaterialRemovalSuccessPopup(doc.name);
        this.statusService.showSuccess('removeMaterialSuccess', { name: doc.name });
      },
      (error) => {
        console.error('Fehler beim Löschen des Dokuments:', error);
        this.statusService.showError('removeMaterialError');
      }
    );
  }

  loadCourseData(): void {
    const url = `${this.apiUrl}/user-kurs?courseName=${encodeURIComponent(this.courseName)}`;
    this.http.get(url).subscribe(
      (response: any) => {
      this.textContent = response.textContent || '';
      this.participants = response.participants || [];
      if (response.documents) {
        this.uploadedDocuments = response.documents.map((doc: any) => ({
          name: doc.name,
          url: doc.url
        }));
      }
      if (response.tasks) {
        this.tasks = response.tasks.map((task: any) => {
          if (task.documents) {
            task.documents = task.documents.map((doc: any) => ({
              name: doc.name,
              url: this.fileUrlService.getFileUrl(doc.url)
            }));
          }
          return task as Task;
        });
      }
    },
    (error) => {
      console.error('Fehler beim Laden der Kursdaten:', error);
    }
  );
  }

  // Show material creation confirmation popup
  showMaterialCreationPopup(fileName: string): void {
    this.createdMaterialName = fileName;
    this.showMaterialCreationConfirmation = true;
  }

  // Hide material creation confirmation popup
  hideMaterialCreationPopup(): void {
    this.showMaterialCreationConfirmation = false;
    this.createdMaterialName = '';
  }
  
  // Show task material creation confirmation popup
  showTaskMaterialCreationPopup(fileName: string, task: Task): void {
    this.createdTaskMaterialName = fileName;
    this.currentTaskForMaterial = task;
    this.showTaskMaterialConfirmation = true;
  }
  
  // Hide task material creation confirmation popup
  hideTaskMaterialCreationPopup(): void {
    this.showTaskMaterialConfirmation = false;
    this.createdTaskMaterialName = '';
    this.currentTaskForMaterial = null;
  }

  // Methode zum Upload allgemeiner Kursdokumente
  handleDocumentUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('courseName', this.courseName);

      this.http.post(`${this.apiUrl}/admin/addDocument`, formData).subscribe(
        (response: any) => {
          // Show confirmation popup with file name
          this.showMaterialCreationPopup(file.name);
          this.loadCourseData();
        },
        (error) => {
          console.error('Fehler beim Hinzufügen des Dokuments:', error);
          this.statusService.showError('addMaterialError');
        }
      );
    }
  }

  // Speichert die Änderungen an einer Aufgabe
  updateTask(task: Task): void {
    const payload = { courseName: this.courseName, ...task };


    this.http.post('http://localhost:3000/api/tasks/admin/updateTask', payload).subscribe(
      (response: any) => {
        this.statusService.showSuccess('saveSuccess');
      },
      (error) => {
        console.error('Fehler beim Aktualisieren der Aufgabe:', error);
        this.statusService.showError('updateTaskError');
      }
    );
  }

currentPdfUrl: SafeResourceUrl | string = '';
showPdfPreview = false;

openPdfPreview(url: string): void {
  this.currentPdfUrl = this.fileUrlService.getFileUrl(url);
  this.showPdfPreview = true;
}

closePdfPreview():void {
  this.showPdfPreview = false;
  this.currentPdfUrl = '';
}

// Löscht eine Aufgabe
deleteTask(task: Task): void {
  if (this.statusService.confirmAction('deleteConfirm', { name: task.name })) {
    // Sofort visuell aus der Liste entfernen
    this.tasks = this.tasks.filter(t => t.taskId !== task.taskId);
    
    const payload = { courseName: this.courseName, taskId: task.taskId };
    
    this.http.post('http://localhost:3000/api/tasks/admin/deleteTask', payload).subscribe(
      (response: any) => {
        console.log('Löschantwort vom Server:', response);
        this.statusService.showSuccess('deleteTaskSuccess');
        
        // Komplette Liste nach kurzer Verzögerung neu laden
        setTimeout(() => {
          this.loadCourseData();
        }, 500);
      },
      (error) => {
        console.error('Fehler beim Löschen der Aufgabe:', error);
        this.statusService.showError('deleteTaskError');
        
        // Bei Fehler die Aufgabe wieder zur Liste hinzufügen
        this.loadCourseData();
      }
    );
  }
}

  updateText(): void {
    const payload = { courseName: this.courseName, textContent: this.textContent };
    this.http.post(`${this.apiUrl}/admin/updateText`, payload).subscribe(
      (response: any) => {
        this.statusService.showSuccess('saveSuccess');
      },
      (error) => {
        console.error('Fehler beim Aktualisieren des Textes:', error);
        this.statusService.showError('updateTextError');
      }
    );
  }


  // Entfernt ein Dokument aus einer Aufgabe
  removeTaskDocument(task: Task, index: number): void {
    task.documents.splice(index, 1);
  }

  // Fügt einer Aufgabe ein neues Dokument hinzu (über File-Upload)
  addTaskDocument(task: Task, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('courseName', this.courseName);
      formData.append('taskId', task.taskId || '');
  
      this.http.post('http://localhost:3000/api/tasks/admin/addTaskDocument', formData).subscribe(
        (response: any) => {
          console.log('Dokument-Antwort vom Server:', response);
          if (response.document) {
            if (!task.documents) {
              task.documents = [];
            }
            // Die URL transformieren, wie bei anderen Dokumenten auch
            task.documents.push({
              name: response.document.name,
              url: this.fileUrlService.getFileUrl(response.document.url) as string
            });
            
            // Show confirmation popup for task material creation
            this.showTaskMaterialCreationPopup(file.name, task);
            
            // Nach dem Hinzufügen die Aufgabe aktualisieren
            this.updateTask(task);
          } else {
            console.error('Unerwartetes Antwortformat vom Server:', response);
          }
        },
        (error) => {
          console.error('Fehler beim Hinzufügen des Dokuments zur Aufgabe:', error);
        }
      );
    }
  }

  // Öffnet den Dialog zum Hinzufügen einer neuen Aufgabe
  openNewTaskDialog(): void {
    const dialogRef = this.dialog.open(NewTaskDialogComponent, {
      width: '400px',
      data: { courseName: this.courseName }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Neue Aufgabe wurde erstellt, Kursdaten neu laden
        this.loadCourseData();
      }
    });
  }

  // Navigate back to previous page
  goBack(): void {
    this.location.back();
  }

  /**
   * Exportiert die Teilnehmerliste als PDF-Datei
   */
  exportParticipantsToPDF(): void {
    // Erstelle neues PDF-Dokument im A4-Format
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Füge Kopfzeile hinzu
    const titleText = `${this.courseName} - Teilnehmerliste`;
    doc.setFontSize(18);
    doc.text(titleText, pageWidth / 2, 20, { align: 'center' });
    
    // Datum hinzufügen
    const currentDate = new Date().toLocaleDateString();
    doc.setFontSize(12);
    doc.text(`Exportiert am: ${currentDate}`, pageWidth / 2, 30, { align: 'center' });
    
    // Teilnehmerliste als Tabelle einfügen
    const tableData = this.participants.map((participant, index) => [index + 1, participant]);
    
    autoTable(doc, {
      startY: 40,
      head: [['#', 'Name']],
      body: tableData,
      headStyles: { fillColor: [66, 133, 244], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });
    
    // Speichere PDF mit einem generierten Dateinamen
    const fileName = `${this.courseName.replace(/\s+/g, '_')}_Teilnehmerliste.pdf`;
    doc.save(fileName);
    
    // Erfolgsmeldung anzeigen
    this.statusService.showSuccess('exportSuccess', { type: 'PDF' });
  }

  /**
   * Exportiert die Teilnehmerliste als CSV-Datei
   */
  exportParticipantsToCSV(): void {
    // CSV-Header erstellen
    let csvContent = 'Nr.,Name\n';
    
    // Teilnehmerdaten als CSV-Zeilen hinzufügen
    this.participants.forEach((participant, index) => {
      // Escape Kommas und Anführungszeichen im Namen
      const escapedName = participant.includes(',') ? `"${participant.replace(/"/g, '""')}"` : participant;
      csvContent += `${index + 1},${escapedName}\n`;
    });
    
    // CSV-Datei zum Download erzeugen
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const fileName = `${this.courseName.replace(/\s+/g, '_')}_Teilnehmerliste.csv`;
    
    // Moderner Ansatz für alle Browser
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    
    // Aufräumen
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
    
    // Erfolgsmeldung anzeigen
    this.statusService.showSuccess('exportSuccess', { type: 'CSV' });
  }
}
