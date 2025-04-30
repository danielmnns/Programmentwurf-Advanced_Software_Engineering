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
import { MatListModule } from '@angular/material/list';
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
  url: string | SafeResourceUrl;
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
  
  /* Zustandsvariablen für verschiedene Dialoge und Benachrichtigungen */
  showDeleteMaterialConfirmation: boolean = false;
  materialToDelete: DocumentFile | null = null;
  showMaterialCreationConfirmation: boolean = false;
  createdMaterialName: string = '';
  showTaskMaterialConfirmation: boolean = false;
  createdTaskMaterialName: string = '';
  currentTaskForMaterial: Task | null = null;
  showMaterialRemovalSuccess: boolean = false;
  removedMaterialName: string = '';
  showExportSuccess: boolean = false; /* Für Export-Erfolgsmeldung */
  exportType: string = ''; /* Speichert den Typ des Exports (PDF/CSV) */
  showTaskDeleteConfirmation: boolean = false;
  taskToDelete: Task | null = null;
  showTaskDeleteSuccess: boolean = false;
  deletedTaskName: string = '';
  showRemoveMaterialSuccess: boolean = false;

  private readonly apiUrl = 'http://localhost:3000/api/courses';

  constructor(
    private readonly route: ActivatedRoute,
    public router: Router,
    private readonly http: HttpClient,
    private readonly dialog: MatDialog,
    public fileUrlService: FileUrlService,
    private readonly sanitizer: DomSanitizer,
    public languageService: LanguageService,
    private readonly statusService: StatusService,
    private readonly location: Location
  ) {}

  ngOnInit(): void {
    const encodedCourseName = this.route.snapshot.paramMap.get('courseName')!;
    this.courseName = decodeURIComponent(encodedCourseName);
    this.loadCourseData();
  }

  /* Öffnet den Bestätigungsdialog zum Löschen eines Kursmaterials */
  showDeleteMaterialConfirmationPopup(doc: DocumentFile): void {
    this.materialToDelete = doc;
    this.showDeleteMaterialConfirmation = true;
  }

  /* Bestätigt und führt das Löschen eines Kursmaterials durch */
  confirmDeleteMaterial(): void {
    if (this.materialToDelete) {
      this.removeDocument(this.materialToDelete);
      this.cancelDeleteMaterial();
    }
  }

  /* Bricht den Löschvorgang eines Kursmaterials ab */
  cancelDeleteMaterial(): void {
    this.showDeleteMaterialConfirmation = false;
    this.materialToDelete = null;
  }

  /* Zeigt eine Erfolgsmeldung nach dem Löschen eines Kursmaterials an */
  showMaterialRemovalSuccessPopup(fileName: string): void {
    this.removedMaterialName = fileName;
    this.showMaterialRemovalSuccess = true;
    
    /* Blendet die Erfolgsmeldung nach 3 Sekunden automatisch aus */
    setTimeout(() => {
      this.hideMaterialRemovalSuccessPopup();
    }, 3000);
  }

  /* Versteckt die Erfolgsmeldung nach dem Löschen eines Kursmaterials */
  hideMaterialRemovalSuccessPopup(): void {
    this.showMaterialRemovalSuccess = false;
    this.removedMaterialName = '';
  }
  
  /* Versteckt die Erfolgsmeldung für das Entfernen von Materialien */
  hideRemoveMaterialSuccessPopup(): void {
    this.showRemoveMaterialSuccess = false;
  }

  /* Entfernt ein Dokument aus dem Kurs */
  removeDocument(doc: DocumentFile): void {
    const payload = {
      courseName: this.courseName,
      documentName: doc.name
    };

    this.http.request('delete', `${this.apiUrl}/admin/removeDocument`, { body: payload }).subscribe({
      next: (response: any) => {
        this.uploadedDocuments = this.uploadedDocuments.filter(d => d.name !== doc.name);
        this.showMaterialRemovalSuccessPopup(doc.name)
      },
      error: (error) => {
        console.error('Fehler beim Löschen des Dokuments:', error);
        this.statusService.showError('removeMaterialError');
      }
    });
  }

  /* Lädt alle Kursdaten inklusive Materialien, Aufgaben und Teilnehmer */
  loadCourseData(): void {
    const url = `${this.apiUrl}/user-kurs?courseName=${encodeURIComponent(this.courseName)}`;
    this.http.get(url).subscribe({
      next: (response: any) => {
        console.log("Vollständige Backend-Antwort:", response);
        console.log("Aufgaben in der Antwort:", response.tasks);
        
        this.textContent = response.textContent ?? '';
        this.participants = response.participants ?? [];
        if (response.documents) {
          this.uploadedDocuments = response.documents.map((doc: any) => ({
            name: doc.name,
            url: doc.url
          }));
        }
        
        if (response.tasks && response.tasks.length > 0) {
          console.log("Aufgaben vorhanden. Anzahl:", response.tasks.length);
          
          this.tasks = response.tasks.map((task: any) => {
            console.log("Task verarbeiten:", task);
            const mappedTask = {
              taskId: task.taskId,
              name: task.name,
              description: task.description,
              documents: task.documents ? task.documents.map((doc: any) => ({
                name: doc.name,
                url: this.fileUrlService.getFileUrl(doc.url)
              })) : []
            };
            console.log("Gemappter Task:", mappedTask);
            return mappedTask;
          });
          
          console.log("Finale Tasks-Array:", this.tasks);
        } else {
          console.log("Keine Aufgaben in der Antwort gefunden oder leeres Array");
          this.tasks = [];
        }
      },
      error: (error) => {
        console.error('Fehler beim Laden der Kursdaten:', error);
      }
    });
  }

  /* Zeigt eine Erfolgsmeldung nach dem Erstellen eines neuen Kursmaterials an */
  showMaterialCreationPopup(fileName: string): void {
    this.createdMaterialName = fileName;
    this.showMaterialCreationConfirmation = true;
  }

  /* Versteckt die Erfolgsmeldung nach dem Erstellen eines neuen Kursmaterials */
  hideMaterialCreationPopup(): void {
    this.showMaterialCreationConfirmation = false;
    this.createdMaterialName = '';
  }
  
  /* Zeigt eine Erfolgsmeldung nach dem Hinzufügen eines Dokuments zu einer Aufgabe */
  showTaskMaterialCreationPopup(fileName: string, task: Task): void {
    this.createdTaskMaterialName = fileName;
    this.currentTaskForMaterial = task;
    this.showTaskMaterialConfirmation = true;
  }
  
  /* Versteckt die Erfolgsmeldung nach dem Hinzufügen eines Dokuments zu einer Aufgabe */
  hideTaskMaterialCreationPopup(): void {
    this.showTaskMaterialConfirmation = false;
    this.createdTaskMaterialName = '';
    this.currentTaskForMaterial = null;
  }

  /* Verarbeitet den Upload eines neuen Kursdokuments */
  handleDocumentUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('courseName', this.courseName);

      this.http.post(`${this.apiUrl}/admin/addDocument`, formData).subscribe({
        next: (response: any) => {
          this.showMaterialCreationPopup(file.name);
          
          /* Verzögertes Neuladen der Daten für konsistente Anzeige */
          setTimeout(() => {
            this.loadCourseData();
          }, 1000);
        },
        error: (error) => {
          console.error('Fehler beim Hinzufügen des Dokuments:', error);
          this.statusService.showError('addMaterialError');
        }
      });
    }
  }

  /* Aktualisiert eine Aufgabe mit geänderten Daten */
  updateTask(task: Task): void {
    const payload = { courseName: this.courseName, ...task };

    this.http.post('http://localhost:3000/api/tasks/admin/updateTask', payload).subscribe({
      next: (response: any) => {
        this.statusService.showSuccess('saveSuccess');
      },
      error: (error) => {
        console.error('Fehler beim Aktualisieren der Aufgabe:', error);
        this.statusService.showError('updateTaskError');
      }
    });
  }

currentPdfUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl('about:blank');
showPdfPreview = false;

/* Öffnet die PDF-Vorschau für ein Dokument */
openPdfPreview(url: string | SafeResourceUrl): void {
  if (typeof url === 'string') {
    const fileUrl = this.fileUrlService.getFileUrl(url);
    this.currentPdfUrl = fileUrl;
  } else {
    this.currentPdfUrl = url;
  }
  this.showPdfPreview = true;
}

/* Schließt die PDF-Vorschau */
closePdfPreview():void {
  this.showPdfPreview = false;
  this.currentPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl('about:blank');
}

/* Öffnet den Dialog zum Löschen einer Aufgabe */
deleteTask(task: Task): void {
  this.taskToDelete = task;
  this.showTaskDeleteConfirmation = true;
}

/* Bestätigt und führt das Löschen einer Aufgabe durch */
confirmTaskDeletion(): void {
  if (!this.taskToDelete) return;
  
  const task = this.taskToDelete;
  this.showTaskDeleteConfirmation = false;
  
  /* Sofort visuell aus der Liste entfernen für bessere Benutzererfahrung */
  this.tasks = this.tasks.filter(t => t.taskId !== task.taskId);
  
  const payload = { courseName: this.courseName, taskId: task.taskId };
  
  this.http.post('http://localhost:3000/api/tasks/admin/deleteTask', payload).subscribe({
    next: (response: any) => {
      console.log('Löschantwort vom Server:', response);
      this.deletedTaskName = task.name;
      this.showTaskDeleteSuccess = true;
      
      /* Benachrichtigung nach 2 Sekunden ausblenden */
      setTimeout(() => {
        this.showTaskDeleteSuccess = false;
        this.deletedTaskName = '';
      }, 2000);
      
      /* Komplette Liste nach kurzer Verzögerung neu laden */
      setTimeout(() => {
        this.loadCourseData();
      }, 500);
    },
    error: (error) => {
      console.error('Fehler beim Löschen der Aufgabe:', error);
      this.statusService.showError('deleteTaskError');
      
      /* Bei Fehler die Aufgabenliste neu laden */
      this.loadCourseData();
    }
  });
}

/* Bricht den Löschvorgang einer Aufgabe ab */
cancelTaskDeletion(): void {
  this.showTaskDeleteConfirmation = false;
  this.taskToDelete = null;
}

  /* Aktualisiert den Kurstext */
  updateText(): void {
    const payload = { courseName: this.courseName, textContent: this.textContent };
    this.http.post(`${this.apiUrl}/admin/updateText`, payload).subscribe({
      next: (response: any) => {
        this.statusService.showSuccess('saveSuccess');
      },
      error: (error) => {
        console.error('Fehler beim Aktualisieren des Textes:', error);
        this.statusService.showError('updateTextError');
      }
    });
  }


  /* Entfernt ein Dokument aus einer Aufgabe */
  removeTaskDocument(task: Task, index: number): void {
    task.documents.splice(index, 1);
  }

  /* Fügt einer Aufgabe ein neues Dokument hinzu */
  addTaskDocument(task: Task, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('courseName', this.courseName);
      formData.append('taskId', task.taskId ?? '');
  
      this.http.post('http://localhost:3000/api/tasks/admin/addTaskDocument', formData).subscribe({
        next: (response: any) => {
          console.log('Dokument-Antwort vom Server:', response);
          if (response.document) {
            if (!task.documents) {
              task.documents = [];
            }
            task.documents.push({
              name: response.document.name,
              url: this.fileUrlService.getFileUrl(response.document.url)
            });
            
            /* Erfolgsmeldung anzeigen */
            this.showTaskMaterialCreationPopup(file.name, task);
            
            /* Aufgabe auf dem Server aktualisieren */
            this.updateTask(task);
            
            /* Verzögertes Neuladen aller Kursdaten für konsistente Anzeige */
            setTimeout(() => {
              this.loadCourseData();
            }, 1500);
          } else {
            console.error('Unerwartetes Antwortformat vom Server:', response);
          }
        },
        error: (error) => {
          console.error('Fehler beim Hinzufügen des Dokuments zur Aufgabe:', error);
          this.statusService.showError('addTaskDocumentError');
        }
      });
    }
  }

  /* Öffnet den Dialog zum Erstellen einer neuen Aufgabe */
  openNewTaskDialog(): void {
    const dialogRef = this.dialog.open(NewTaskDialogComponent, {
      width: '400px',
      data: { courseName: this.courseName }
    });
    
    dialogRef.afterClosed().subscribe({
      next: (result) => {
        if (result) {
          /* Verzögertes Neuladen nach der Serververarbeitung */
          setTimeout(() => {
            this.loadCourseData();
          }, 1000);
        }
      }
    });
  }

  /* Navigation zurück zur vorherigen Seite */
  navigateBack(): void {
    this.router.navigate(['/user-kurs', this.courseName]);
  }

  /* Zeigt eine Erfolgsmeldung nach dem Export an */
  showExportSuccessPopup(exportType: string): void {
    this.exportType = exportType;
    this.showExportSuccess = true;
  }

  /* Versteckt die Export-Erfolgsmeldung */
  hideExportSuccessPopup(): void {
    this.showExportSuccess = false;
    this.exportType = '';
  }

  /* Exportiert die Teilnehmerliste als PDF-Datei */
  exportParticipantsToPDF(): void {
    /* Erstelle neues PDF-Dokument im A4-Format */
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    /* Kopfzeile mit Kurstitel und Datum */
    const titleText = `${this.courseName} - Teilnehmerliste`;
    doc.setFontSize(18);
    doc.text(titleText, pageWidth / 2, 20, { align: 'center' });
    
    const currentDate = new Date().toLocaleDateString();
    doc.setFontSize(12);
    doc.text(`Exportiert am: ${currentDate}`, pageWidth / 2, 30, { align: 'center' });
    
    /* Teilnehmerliste als formatierte Tabelle */
    const tableData = this.participants.map((participant, index) => [index + 1, participant]);
    
    autoTable(doc, {
      startY: 40,
      head: [['#', 'Name']],
      body: tableData,
      headStyles: { fillColor: [66, 133, 244], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });
    
    /* PDF speichern */
    const fileName = `${this.courseName.replace(/\s+/g, '_')}_Teilnehmerliste.pdf`;
    doc.save(fileName);
    
    /* Erfolgsmeldung anzeigen */
    this.showExportSuccessPopup('PDF');
  }

  /* Exportiert die Teilnehmerliste als CSV-Datei */
  exportParticipantsToCSV(): void {
    /* CSV-Header erstellen */
    let csvContent = 'Nr.,Name\n';
    
    /* Teilnehmerdaten als CSV-Zeilen hinzufügen */
    this.participants.forEach((participant, index) => {
      /* Kommas und Anführungszeichen im Namen escapen */
      const escapedName = participant.includes(',') ? `"${participant.replace(/"/g, '""')}"` : participant;
      csvContent += `${index + 1},${escapedName}\n`;
    });
    
    /* CSV-Datei zum Download erzeugen */
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const fileName = `${this.courseName.replace(/\s+/g, '_')}_Teilnehmerliste.csv`;
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    
    /* Aufräumen der temporären DOM-Elemente */
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
    
    /* Erfolgsmeldung anzeigen */
    this.showExportSuccessPopup('CSV');
  }

  /* Navigation zur Aufgabendetailseite */
  navigateToTask(task: Task): void {
    this.router.navigate(['/admin-aufgabe', this.courseName, task.name]).catch((error) => {
      console.error('Fehler beim Navigieren zur Aufgabenseite:', error);
    });
  }
}
