import { FocusMonitor } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule, MatListOption } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TranslatePipe } from '../pipes/translate.pipe';
import { LanguageService } from '../services/language.service';

interface User {
  _id: number;
  username: string;
  userType: string;
  token: string | null;
}

interface Course {
  id: number;
  courseName: string;
  participants: string[];
}

interface UserType {
  value: string;
  label: string;
}

@Component({
  selector: 'app-user-verwaltung',
  templateUrl: './user-verwaltung.component.html',
  styleUrls: ['./user-verwaltung.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatSortModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDialogModule,
    MatListModule,
    MatIconModule,
    MatCheckboxModule,
    MatSnackBarModule,
    TranslatePipe
  ]
})
export class UserVerwaltungComponent implements OnInit, OnDestroy {
  users: User[] = [];
  
  /* Eigenschaften für Benutzer-Löschbestätigung */
  showDeleteUserConfirmation: boolean = false;
  userToDelete: User | null = null;

  /* Benutzertypen als Objekte mit Wert und Anzeigetext */
  userTypes: UserType[] = [
    { value: 'admin', label: 'Administrator' },
    { value: 'dozent', label: 'Dozent' },
    { value: 'student', label: 'Student' },
    { value: 'studiengangsleiter', label: 'Studiengangsleiter' }
  ];

  /* Initiale Werte für Formulare */
  newUser = { username: '', password: '', userType: 'student' };
  displayedColumns: string[] = ['username', 'userType', 'actions'];
  dataSource = new MatTableDataSource<User>([]);

  courses: Course[] = [];
  newCourse = { name: '', user: '' };
  courseDisplayedColumns: string[] = ['courseName', 'participants', 'actions'];
  courseDataSource = new MatTableDataSource<Course>([]);

  /* API-Endpunkte */
  private apiUrl = 'http://localhost:3000/api/admin/user-verwaltung';
  private courseApiUrl = 'http://localhost:3000/api/courses/user-verwaltung';

  /* Referenzen für Dialog-Templates */
  @ViewChild('participantDialogTemplate') participantDialogTemplate!: TemplateRef<any>;
  @ViewChild('editUserDialogTemplate') editUserDialogTemplate!: TemplateRef<any>;
  @ViewChild('dialogTrigger') dialogTrigger!: ElementRef;
  participantDialogRef: MatDialogRef<any> | null = null;
  editUserDialogRef: MatDialogRef<any> | null = null;

  /* Ausgewählte Objekte für Dialogfenster */
  selectedCourse: Course | null = null;
  selectedUser: User | null = null;
  selectedUserType: string = '';

  /* Suchbegriffe für Filterfunktionen */
  participantSearchTerm: string = '';
  userSearchTerm: string = '';

  /* Gefilterte Teilnehmerliste basierend auf Suchbegriff */
  get filteredParticipants(): string[] {
    if (!this.selectedCourse) return [];

    return this.selectedCourse.participants.filter(
      p => p.toLowerCase().includes(this.participantSearchTerm.toLowerCase())
    );
  }

  /* Gefilterte Benutzerliste ohne bereits zugewiesene Teilnehmer */
  get filteredAvailableUsers(): User[] {
    if (!this.selectedCourse) return [];

    return this.users
      .filter(user => !this.selectedCourse!.participants.includes(user.username))
      .filter(user => user.username.toLowerCase().includes(this.userSearchTerm.toLowerCase()) ||
                      user.userType.toLowerCase().includes(this.userSearchTerm.toLowerCase()));
  }

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private focusMonitor: FocusMonitor,
    public languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadCourses();
  }

  ngAfterViewInit() {
    /* Überwache Dialog-Trigger für korrektes Fokusmanagement */
    if (this.dialogTrigger) {
      this.focusMonitor.monitor(this.dialogTrigger);
    }
  }

  ngOnDestroy(): void {
    /* Bereinige Fokusüberwachung beim Zerstören der Komponente */
    if (this.dialogTrigger) {
      this.focusMonitor.stopMonitoring(this.dialogTrigger);
    }
  }

  /* Öffnet das Dialog für die Teilnehmerverwaltung eines Kurses */
  openParticipantDialog(course: Course) {
    /* Speichere aktives Element vor Dialog-Öffnung für spätere Fokuswiederherstellung */
    const previouslyFocused = document.activeElement as HTMLElement;

    this.selectedCourse = { ...course };
    this.participantDialogRef = this.dialog.open(this.participantDialogTemplate, {
      width: '800px',
      maxHeight: '80vh',
      data: { course: this.selectedCourse },
      autoFocus: 'dialog', /* Fokus auf den Dialog selbst setzen */
      restoreFocus: true,  /* Fokus nach Schließen wiederherstellen */
      ariaDescribedBy: null,
      hasBackdrop: true
    });

    /* Wiederherstellung des Fokus nach Schließen des Dialogs */
    this.participantDialogRef.afterClosed().subscribe(() => {
      /* Manuelles Fokussetzen um sicherzustellen, dass ein Element fokussiert ist */
      if (previouslyFocused && 'focus' in previouslyFocused) {
        previouslyFocused.focus();
      }
    });
  }
  
  /* Öffnet das Dialog zur Bearbeitung eines Benutzertyps */
  openEditUserDialog(user: User) {
    /* Speichere aktives Element vor Dialog-Öffnung für spätere Fokuswiederherstellung */
    const previouslyFocused = document.activeElement as HTMLElement;

    this.selectedUser = { ...user };
    this.selectedUserType = user.userType;
    
    this.editUserDialogRef = this.dialog.open(this.editUserDialogTemplate, {
      width: '400px',
      data: { 
        user: this.selectedUser,
        userTypes: this.userTypes
      },
      autoFocus: 'dialog',
      restoreFocus: true,
      hasBackdrop: true
    });

    /* Verarbeite Ergebnis nach Schließen des Dialogs */
    this.editUserDialogRef.afterClosed().subscribe(result => {
      if (result && result.userType) {
        this.updateUserType(this.selectedUser!, result.userType);
      }
      
      /* Stelle Fokus wieder her */
      if (previouslyFocused && 'focus' in previouslyFocused) {
        previouslyFocused.focus();
      }
    });
  }

  /* Fügt ausgewählte Benutzer zum Kurs hinzu */
  addParticipants(selectedOptions: MatListOption[]): void {
    if (!this.selectedCourse) return;

    const usernames = selectedOptions.map(option => option.value);
    
    /* Einzelne Anfragen für jeden Benutzer senden, da das Backend
       nur einen Benutzer pro Anfrage unterstützt */
    const requests = usernames.map(username => {
      const payload = {
        courseId: this.selectedCourse!.courseName,
        username: username,
        action: 'add'
      };
      
      return this.http.post<any>(this.courseApiUrl, payload);
    });
    
    /* Alle Anfragen ausführen */
    Promise.all(requests.map(request => request.toPromise()))
      .then(() => {
        /* Lokale Daten aktualisieren */
        this.selectedCourse!.participants = [
          ...this.selectedCourse!.participants,
          ...usernames
        ];
        this.loadCourses();
        this.showSuccess(`${usernames.length} Teilnehmer erfolgreich hinzugefügt!`);
      })
      .catch(() => {
        this.showError('Fehler beim Hinzufügen der Teilnehmer.');
      });
  }

  /* Entfernt ausgewählte Teilnehmer aus dem Kurs */
  removeParticipants(selectedOptions: MatListOption[]): void {
    if (!this.selectedCourse) return;

    const usernamesToRemove = selectedOptions.map(option => option.value);
    
    /* Einzelne Anfragen für jeden Benutzer senden, da das Backend
       nur einen Benutzer pro Anfrage unterstützt */
    const requests = usernamesToRemove.map(username => {
      const payload = {
        courseId: this.selectedCourse!.courseName,
        username: username,
        action: 'remove'
      };
      
      return this.http.post<any>(this.courseApiUrl, payload);
    });
    
    /* Alle Anfragen ausführen */
    Promise.all(requests.map(request => request.toPromise()))
      .then(() => {
        /* Lokale Daten aktualisieren */
        this.selectedCourse!.participants = this.selectedCourse!.participants.filter(
          p => !usernamesToRemove.includes(p)
        );
        this.loadCourses();
        this.showSuccess(`${usernamesToRemove.length} Teilnehmer erfolgreich entfernt!`);
      })
      .catch(() => {
        this.showError('Fehler beim Entfernen der Teilnehmer.');
      });
  }

  /* Lädt alle Benutzer vom Server */
  loadUsers(): void {
    this.http.get<any>('http://localhost:3000/api/users').subscribe(
      (data) => {
        this.users = data.map((userData: any) => ({
          _id: userData.user._id,
          username: userData.user.username,
          userType: userData.user.userType,
          token: userData.user.token || null
        }));
        this.dataSource.data = this.users;
      },
      () => this.showError('Fehler beim Laden der Benutzer.')
    );
  }

  /* Lädt alle Kurse vom Server */
  loadCourses(): void {
    this.http.get<{ id: number, courseName: string, participants: string[] }[]>(this.courseApiUrl).subscribe(
      (data) => {
        this.courses = data;
        this.courseDataSource.data = this.courses;
      },
      () => this.showError('Fehler beim Laden der Kurse.')
    );
  }

  /* Erstellt einen neuen Benutzer */
  addUser(): void {
    if (!this.newUser.username || !this.newUser.password || !this.newUser.userType) {
      this.showError('Bitte alle Felder ausfüllen!');
      return;
    }

    /* Payload mit operation-Parameter für Backend */
    const payload = {
      ...this.newUser,
      operation: 'createUser'
    };

    this.http.post<any>(this.apiUrl, payload).subscribe(
      (response: { success: boolean; message?: string }) => {
        if (response.success) {
          this.loadUsers();
          this.newUser = { username: '', password: '', userType: 'student' }; /* Formular zurücksetzen */
          this.showSuccess('Benutzer erfolgreich hinzugefügt!');
        } else {
          this.showError(response.message || 'Fehler beim Hinzufügen eines Benutzers.');
        }
      },
      (error) => this.showError('Fehler beim Hinzufügen eines Benutzers: ' + (error.message || ''))
    );
  }

  /* Zeigt den Bestätigungsdialog zum Löschen eines Benutzers an */
  showDeleteUserConfirmationPopup(user: User): void {
    this.userToDelete = user;
    this.showDeleteUserConfirmation = true;
  }

  /* Bestätigt und führt das Löschen eines Benutzers durch */
  confirmDeleteUser(): void {
    if (!this.userToDelete) return;
    
    const user = this.userToDelete;
    this.showDeleteUserConfirmation = false;
    
    const payload = {
      userId: user._id,
      operation: 'deleteUserById'
    };

    this.http.post(this.apiUrl, payload).subscribe(
      (response: any) => {
        if (response.success) {
          this.loadUsers();
          this.showSuccess('Benutzer erfolgreich gelöscht!');
        } else {
          this.showError(response.message || 'Fehler beim Löschen des Benutzers.');
        }
      },
      (error) => this.showError('Fehler beim Löschen des Benutzers: ' + (error.error?.message || error.message || ''))
    );
  }

  /* Bricht den Löschvorgang eines Benutzers ab */
  cancelDeleteUser(): void {
    this.showDeleteUserConfirmation = false;
    this.userToDelete = null;
  }

  /* Initiiert den Löschvorgang für einen Benutzer */
  deleteUser(user: User): void {
    this.showDeleteUserConfirmationPopup(user);
  }

  /* Aktualisiert den Benutzertyp eines Benutzers */
  updateUserType(user: User, newUserTypeValue?: string): void {
    /* Wenn kein expliziter neuer Typ übergeben wurde, verwende den aus dem Dialog */
    const newTypeValue = newUserTypeValue || this.selectedUserType;
    
    if (!newTypeValue) {
      this.showError('Kein Benutzertyp ausgewählt!');
      return;
    }

    const payload = {
      username: user.username,
      newUserType: newTypeValue,
      operation: 'updateUserType'
    };

    this.http.post(this.apiUrl, payload).subscribe(
      () => {
        this.loadUsers();
        this.showSuccess('Benutzertyp erfolgreich aktualisiert!');
      },
      () => this.showError('Fehler beim Aktualisieren des Benutzertyps.')
    );
  }

  /* Erstellt einen neuen Kurs mit einem initialen Teilnehmer */
  addCourse(): void {
    if (!this.newCourse.name || !this.newCourse.user) {
      this.showError('Bitte alle Felder ausfüllen!');
      return;
    }

    /* Payload an das richtige Format anpassen */
    const payload = {
      courseName: this.newCourse.name,
      participants: [this.newCourse.user]
    };

    this.http.post<{ id: number; courseName: string; participants: string[] }>(this.courseApiUrl, payload).subscribe(
      () => {
        this.loadCourses();
        this.newCourse = { name: '', user: '' };
        this.showSuccess('Kurs erfolgreich hinzugefügt!');
      },
      () => this.showError('Fehler beim Hinzufügen eines Kurses.')
    );
  }

  /* Fügt einen einzelnen Teilnehmer zu einem Kurs hinzu */
  addParticipant(course: Course): void {
    this.http.patch(`${this.courseApiUrl}/${course.id}`, { participants: [...course.participants, this.newCourse.user] }).subscribe(
      () => {
        this.loadCourses();
        this.showSuccess('Teilnehmer erfolgreich hinzugefügt!');
      },
      () => this.showError('Fehler beim Hinzufügen eines Teilnehmers.')
    );
  }

  /* Entfernt einen einzelnen Teilnehmer aus einem Kurs */
  removeParticipant(course: Course): void {
    const updatedParticipants = course.participants.slice(0, -1);
    this.http.patch(`${this.courseApiUrl}/${course.id}`, { participants: updatedParticipants }).subscribe(
      () => {
        this.loadCourses();
        this.showSuccess('Teilnehmer erfolgreich entfernt!');
      },
      () => this.showError('Fehler beim Entfernen eines Teilnehmers.')
    );
  }

  /* Zeigt eine Erfolgsmeldung als Snackbar an */
  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Schließen', { duration: 3000, panelClass: ['success-snack'] });
  }

  /* Zeigt eine Fehlermeldung als Snackbar an */
  private showError(message: string): void {
    this.snackBar.open(message, 'Schließen', { duration: 3000, panelClass: ['error-snack'] });
  }

  /* Gibt den übersetzten Benutzertyp für die Anzeige zurück */
  showTranslatedUserType(userType: string): string {
    return this.languageService.translate(userType);
  }
}
