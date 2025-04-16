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
  showDeleteMaterialConfirmation: boolean = false;
  materialToDelete: DocumentFile | null = null;
  showMaterialCreationConfirmation: boolean = false;
  createdMaterialName: string = '';
  showTaskMaterialConfirmation: boolean = false;
  createdTaskMaterialName: string = '';
  currentTaskForMaterial: Task | null = null;
  showMaterialRemovalSuccess: boolean = false;
  removedMaterialName: string = '';
  showExportSuccess: boolean = false; // Neue Variable für Export-Erfolgsmeldung
  exportType: string = ''; // Speichert den Typ des Exports (PDF/CSV)

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
    private readonly location: Location // Add Location service
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

    this.http.request('delete', `${this.apiUrl}/admin/removeDocument`, { body: payload }).subscribe({
      next: (response: any) => {
        this.uploadedDocuments = this.uploadedDocuments.filter(d => d.name !== doc.name);
        // Show the removal success popup
        this.showMaterialRemovalSuccessPopup(doc.name);
        this.statusService.showSuccess('removeMaterialSuccess', { name: doc.name });
      },
      error: (error) => {
        console.error('Fehler beim Löschen des Dokuments:', error);
        this.statusService.showError('removeMaterialError');
      }
    });
  }

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

      this.http.post(`${this.apiUrl}/admin/addDocument`, formData).subscribe({
        next: (response: any) => {
          // Show confirmation popup with file name
          this.showMaterialCreationPopup(file.name);
          
          // Verzögertes Neuladen der Daten, um sicherzustellen, 
          // dass die Änderungen auf dem Server verarbeitet wurden
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

  // Speichert die Änderungen an einer Aufgabe
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

openPdfPreview(url: string | SafeResourceUrl): void {
  // Wenn die URL bereits als SafeResourceUrl vorliegt, direkt verwenden
  if (typeof url === 'string') {
    // Erst URL vom Service holen und dann durch DomSanitizer als sichere URL markieren
    const fileUrl = this.fileUrlService.getFileUrl(url);
    this.currentPdfUrl = fileUrl;
  } else {
    // Wenn es bereits ein SafeResourceUrl ist, direkt verwenden
    this.currentPdfUrl = url;
  }
  this.showPdfPreview = true;
}

closePdfPreview():void {
  this.showPdfPreview = false;
  this.currentPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl('about:blank');
}

// Löscht eine Aufgabe
deleteTask(task: Task): void {
  if (this.statusService.confirmAction('deleteConfirm', { name: task.name })) {
    // Sofort visuell aus der Liste entfernen
    this.tasks = this.tasks.filter(t => t.taskId !== task.taskId);
    
    const payload = { courseName: this.courseName, taskId: task.taskId };
    
    this.http.post('http://localhost:3000/api/tasks/admin/deleteTask', payload).subscribe({
      next: (response: any) => {
        console.log('Löschantwort vom Server:', response);
        this.statusService.showSuccess('deleteTaskSuccess');
        
        // Komplette Liste nach kurzer Verzögerung neu laden
        setTimeout(() => {
          this.loadCourseData();
        }, 500);
      },
      error: (error) => {
        console.error('Fehler beim Löschen der Aufgabe:', error);
        this.statusService.showError('deleteTaskError');
        
        // Bei Fehler die Aufgabe wieder zur Liste hinzufügen
        this.loadCourseData();
      }
    });
  }
}

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
      formData.append('taskId', task.taskId ?? '');
  
      this.http.post('http://localhost:3000/api/tasks/admin/addTaskDocument', formData).subscribe({
        next: (response: any) => {
          console.log('Dokument-Antwort vom Server:', response);
          if (response.document) {
            if (!task.documents) {
              task.documents = [];
            }
            // Die URL transformieren, wie bei anderen Dokumenten auch
            task.documents.push({
              name: response.document.name,
              url: this.fileUrlService.getFileUrl(response.document.url)
            });
            
            // Show confirmation popup for task material creation
            this.showTaskMaterialCreationPopup(file.name, task);
            
            // Nach dem Hinzufügen die Aufgabe aktualisieren
            this.updateTask(task);
            
            // Verzögertes Neuladen aller Kursdaten für konsistente Anzeige
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

  // Öffnet den Dialog zum Hinzufügen einer neuen Aufgabe
  openNewTaskDialog(): void {
    const dialogRef = this.dialog.open(NewTaskDialogComponent, {
      width: '400px',
      data: { courseName: this.courseName }
    });
    
    dialogRef.afterClosed().subscribe({
      next: (result) => {
        if (result) {
          // Kurze Verzögerung vor dem Neuladen der Daten, um sicherzustellen, 
          // dass die Serververarbeitung abgeschlossen ist
          setTimeout(() => {
            this.loadCourseData();
          }, 1000);
        }
      }
    });
  }

  // Navigate back to previous page
  navigateBack(): void {
    this.router.navigate(['/user-kurs', this.courseName]);
  }

  /**
   * Zeigt das Export-Erfolgspopup an
   */
  showExportSuccessPopup(exportType: string): void {
    this.exportType = exportType;
    this.showExportSuccess = true;
    
    // Auto-hide wurde entfernt, damit das Popup bestehen bleibt, bis der Benutzer auf "OK" klickt
  }

  /**
   * Verberge das Export-Erfolgspopup
   */
  hideExportSuccessPopup(): void {
    this.showExportSuccess = false;
    this.exportType = '';
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
    this.showExportSuccessPopup('PDF');
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
    this.showExportSuccessPopup('CSV');
  }

  /**
   * Navigiert zur Aufgabendetailseite
   */
  navigateToTask(task: Task): void {
    this.router.navigate(['/admin-aufgabe', this.courseName, task.name]).catch((error) => {
      console.error('Fehler beim Navigieren zur Aufgabenseite:', error);
    });
  }
}
