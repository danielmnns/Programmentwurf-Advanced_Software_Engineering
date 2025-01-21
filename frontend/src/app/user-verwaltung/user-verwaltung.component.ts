import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';

interface User {
  id: number;
  username: string;
  userType: string;
  token: string;
}

interface Course {
  id: number;
  courseName: string;
  participants: string[];
}

@Component({
  selector: 'app-user-verwaltung',
  templateUrl: './user-verwaltung.component.html',
  styleUrls: ['./user-verwaltung.component.css'],
})
export class UserVerwaltungComponent implements OnInit {
  users: User[] = [];
  userTypes: string[] = ['Admin', 'Dozent', 'Student', 'Studiengangsleiter'];
  newUser = { username: '', password: '', userType: 'Student' };
  displayedColumns: string[] = ['username', 'userType', 'actions'];
  dataSource = new MatTableDataSource<User>([]);

  courses: Course[] = [];
  newCourse = { name: '', user: '' };
  courseDisplayedColumns: string[] = ['courseName', 'participants', 'actions'];
  courseDataSource = new MatTableDataSource<Course>([]);

  private apiUrl = 'http://localhost:3000/api/admin/user-verwaltung';
  private courseApiUrl = 'http://localhost:3000/api/courses/user-verwaltung'; 

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadCourses();
  }

  // Benutzer laden
  loadUsers(): void {
    this.http.get<{ user: { username: string; userType: string; token: string } }[]>(this.apiUrl).subscribe(
      (data) => {
        this.users = data.map((userData, index) => ({
          id: index + 1,
          username: userData.user.username,
          userType: userData.user.userType,
          token: userData.user.token
        }));
        this.dataSource.data = this.users;
      },
      () => this.showError('Fehler beim Laden der Benutzer.')
    );
  }

  // Kurse laden
  loadCourses(): void {
    this.http.get<{ id: number, courseName: string, participants: string[] }[]>(this.courseApiUrl).subscribe(
      (data) => {
        this.courses = data;
        this.courseDataSource.data = this.courses;
      },
      () => this.showError('Fehler beim Laden der Kurse.')
    );
  }

  // Benutzer hinzufügen
  addUser(): void {
    if (!this.newUser.username || !this.newUser.password || !this.newUser.userType) {
      this.showError('Bitte alle Felder ausfüllen!');
      return;
    }
    this.http.post<{ user: { username: string; userType: string; token: string } }>(this.apiUrl, this.newUser).subscribe(
      () => {
        this.loadUsers();
        this.newUser = { username: '', password: '', userType: 'Student' };
        this.showSuccess('Benutzer erfolgreich hinzugefügt!');
      },
      () => this.showError('Fehler beim Hinzufügen eines Benutzers.')
    );
  }

  // Benutzer löschen
  deleteUser(username: string): void {
    this.http.delete(`${this.apiUrl}/${username}`).subscribe(
      () => {
        this.loadUsers();
        this.showSuccess('Benutzer erfolgreich gelöscht!');
      },
      () => this.showError('Fehler beim Löschen eines Benutzers.')
    );
  }

  // Benutzer-Typ aktualisieren
  updateUserType(user: User): void {
    const newType = prompt('Neuer Benutzertyp für ' + user.username, user.userType);
    if (newType && this.userTypes.includes(newType)) {
      this.http.patch(`${this.apiUrl}/${user.id}`, { userType: newType }).subscribe(
        () => {
          this.loadUsers();
          this.showSuccess('Benutzertyp erfolgreich aktualisiert!');
        },
        () => this.showError('Fehler beim Aktualisieren des Benutzertyps.')
      );
    }
  }

  // Kurs hinzufügen
  addCourse(): void {
    if (!this.newCourse.name || !this.newCourse.user) {
      this.showError('Bitte alle Felder ausfüllen!');
      return;
    }
    this.http.post<{ id: number; courseName: string; participants: string[] }>(this.courseApiUrl, this.newCourse).subscribe(
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
