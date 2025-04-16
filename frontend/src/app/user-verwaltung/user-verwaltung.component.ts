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

  // Korrigierte Benutzertypen als Objekte mit value/label
  userTypes: UserType[] = [
    { value: 'admin', label: 'Administrator' },
    { value: 'dozent', label: 'Dozent' },
    { value: 'student', label: 'Student' },
    { value: 'studiengangsleiter', label: 'Studiengangsleiter' }
  ];

  // Initiale Werte mit kleingeschriebenem userType
  newUser = { username: '', password: '', userType: 'student' };
  displayedColumns: string[] = ['username', 'userType', 'actions'];
  dataSource = new MatTableDataSource<User>([]);

  courses: Course[] = [];
  newCourse = { name: '', user: '' };
  courseDisplayedColumns: string[] = ['courseName', 'participants', 'actions'];
  courseDataSource = new MatTableDataSource<Course>([]);

  // API-URLs
  private apiUrl = 'http://localhost:3000/api/admin/user-verwaltung'; // Korrigierte URL
  private courseApiUrl = 'http://localhost:3000/api/courses/user-verwaltung';

  // Dialog-Referenzen
  @ViewChild('participantDialogTemplate') participantDialogTemplate!: TemplateRef<any>;
  @ViewChild('editUserDialogTemplate') editUserDialogTemplate!: TemplateRef<any>;
  @ViewChild('dialogTrigger') dialogTrigger!: ElementRef;
  participantDialogRef: MatDialogRef<any> | null = null;
  editUserDialogRef: MatDialogRef<any> | null = null;

  // Ausgewählte Objekte für Dialoge
  selectedCourse: Course | null = null;
  selectedUser: User | null = null;
  selectedUserType: string = '';

  // Suchbegriffe
  participantSearchTerm: string = '';
  userSearchTerm: string = '';

  // Gefilterte Listen
  get filteredParticipants(): string[] {
    if (!this.selectedCourse) return [];

    return this.selectedCourse.participants.filter(
      p => p.toLowerCase().includes(this.participantSearchTerm.toLowerCase())
    );
  }

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
    // Überwache den Dialog-Trigger für korrektes Fokusmanagement
    if (this.dialogTrigger) {
      this.focusMonitor.monitor(this.dialogTrigger);
    }
  }

  ngOnDestroy(): void {
    if (this.dialogTrigger) {
      this.focusMonitor.stopMonitoring(this.dialogTrigger);
    }
  }

  openParticipantDialog(course: Course) {
    // Speichere aktiven Element vor Dialog-Öffnung
    const previouslyFocused = document.activeElement as HTMLElement;

    this.selectedCourse = { ...course };
    this.participantDialogRef = this.dialog.open(this.participantDialogTemplate, {
      width: '800px',
      maxHeight: '80vh',
      data: { course: this.selectedCourse },
      autoFocus: 'dialog', // Fokus auf den Dialog selbst setzen
      restoreFocus: true,  // Fokus nach Schließen wiederherstellen
      ariaDescribedBy: null,
      hasBackdrop: true
    });

    // Verwende afterClosed für Fokus-Wiederherstellung
    this.participantDialogRef.afterClosed().subscribe(() => {
      // Manuelles Fokussetzen um sicherzustellen, dass ein Element fokussiert ist
      if (previouslyFocused && 'focus' in previouslyFocused) {
        previouslyFocused.focus();
      }
    });
  }
  
  openEditUserDialog(user: User) {
    // Speichere aktiven Element vor Dialog-Öffnung
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

    this.editUserDialogRef.afterClosed().subscribe(result => {
      if (result && result.userType) {
        this.updateUserType(this.selectedUser!, result.userType);
      }
      
      if (previouslyFocused && 'focus' in previouslyFocused) {
        previouslyFocused.focus();
      }
    });
  }

  // Fügt ausgewählte Benutzer zum Kurs hinzu
  addParticipants(selectedOptions: MatListOption[]): void {
    if (!this.selectedCourse) return;

    const usernames = selectedOptions.map(option => option.value);
    const updatedParticipants = [...this.selectedCourse.participants, ...usernames];

    const payload = {
      courseName: this.selectedCourse.courseName,
      participants: updatedParticipants
    };

    this.http.post<any>(this.courseApiUrl, payload).subscribe(
      () => {
        this.selectedCourse!.participants = updatedParticipants;
        this.loadCourses();
        this.showSuccess(`${usernames.length} Teilnehmer erfolgreich hinzugefügt!`);
      },
      () => this.showError('Fehler beim Hinzufügen der Teilnehmer.')
    );
  }

  // Entfernt ausgewählte Teilnehmer aus dem Kurs
  removeParticipants(selectedOptions: MatListOption[]): void {
    if (!this.selectedCourse) return;

    const usernamesToRemove = selectedOptions.map(option => option.value);
    const updatedParticipants = this.selectedCourse.participants.filter(
      p => !usernamesToRemove.includes(p)
    );

    const payload = {
      courseName: this.selectedCourse.courseName,
      participants: updatedParticipants
    };

    this.http.post<any>(this.courseApiUrl, payload).subscribe(
      () => {
        this.selectedCourse!.participants = updatedParticipants;
        this.loadCourses();
        this.showSuccess(`${usernamesToRemove.length} Teilnehmer erfolgreich entfernt!`);
      },
      () => this.showError('Fehler beim Entfernen der Teilnehmer.')
    );
  }

  // Benutzer laden
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

  // Kurse laden - unverändert
  loadCourses(): void {
    this.http.get<{ id: number, courseName: string, participants: string[] }[]>(this.courseApiUrl).subscribe(
      (data) => {
        this.courses = data;
        this.courseDataSource.data = this.courses;
      },
      () => this.showError('Fehler beim Laden der Kurse.')
    );
  }

  // Benutzer hinzufügen - angepasst mit operation
  addUser(): void {
    if (!this.newUser.username || !this.newUser.password || !this.newUser.userType) {
      this.showError('Bitte alle Felder ausfüllen!');
      return;
    }

    // Payload mit operation erweitern
    const payload = {
      ...this.newUser,
      operation: 'createUser'
    };

    this.http.post<any>(this.apiUrl, payload).subscribe(
      (response: { success: boolean; message?: string }) => {
        if (response.success) {
          this.loadUsers();
          this.newUser = { username: '', password: '', userType: 'student' }; // Zurücksetzen mit kleingeschriebenen Werten
          this.showSuccess('Benutzer erfolgreich hinzugefügt!');
        } else {
          this.showError(response.message || 'Fehler beim Hinzufügen eines Benutzers.');
        }
      },
      (error) => this.showError('Fehler beim Hinzufügen eines Benutzers: ' + (error.message || ''))
    );
  }

  // Benutzer löschen (über ID)
  deleteUser(user: User): void {
    if (confirm(`Wirklich den Benutzer ${user.username} löschen?`)) {
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
  }

  // Benutzer-Typ aktualisieren - aktualisierte Version
  updateUserType(user: User, newUserTypeValue?: string): void {
    // Wenn kein expliziter neuer Typ übergeben wurde, verwende den aus dem Dialog
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

  // Kurs hinzufügen
  addCourse(): void {
    if (!this.newCourse.name || !this.newCourse.user) {
      this.showError('Bitte alle Felder ausfüllen!');
      return;
    }

    // Payload an das richtige Format anpassen
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

  // Teilnehmer hinzufügen
  addParticipant(course: Course): void {
    this.http.patch(`${this.courseApiUrl}/${course.id}`, { participants: [...course.participants, this.newCourse.user] }).subscribe(
      () => {
        this.loadCourses();
        this.showSuccess('Teilnehmer erfolgreich hinzugefügt!');
      },
      () => this.showError('Fehler beim Hinzufügen eines Teilnehmers.')
    );
  }

  // Teilnehmer entfernen
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

  // Erfolgsnachricht
  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Schließen', { duration: 3000, panelClass: ['success-snack'] });
  }

  // Fehlermeldung
  private showError(message: string): void {
    this.snackBar.open(message, 'Schließen', { duration: 3000, panelClass: ['error-snack'] });
  }
}
