import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface User {
  id: number;
  username: string;
  type: string;
}

@Component({
  selector: 'app-user-verwaltung',
  templateUrl: './user-verwaltung.component.html',
  styleUrls: ['./user-verwaltung.component.css'],
})
export class UserVerwaltungComponent implements OnInit {
  users: User[] = [];
  userTypes: string[] = ['Admin', 'Dozent', 'Student'];
  newUser = { username: '', password: '' };
  displayedColumns: string[] = ['username', 'type', 'actions'];
  private apiUrl = '/api/user-verwaltung';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.http.get<User[]>(this.apiUrl).subscribe(
      (data) => (this.users = data),
      (error) => console.error('Fehler beim Laden der Benutzer:', error)
    );
  }

  addUser(): void {
    this.http.post(this.apiUrl, this.newUser).subscribe(
      () => {
        this.loadUsers(); // Refresh the list
        this.newUser = { username: '', password: '' };
      },
      (error) => console.error('Fehler beim Hinzufügen eines Benutzers:', error)
    );
  }

  deleteUser(userId: number): void {
    this.http.delete(`${this.apiUrl}/${userId}`).subscribe(
      () => this.loadUsers(), // Refresh the list
      (error) => console.error('Fehler beim Löschen eines Benutzers:', error)
    );
  }

  updateUserType(user: User): void {
    this.http.patch(`${this.apiUrl}/${user.id}`, { type: user.type }).subscribe(
      () => console.log('Benutzertyp aktualisiert'),
      (error) => console.error('Fehler beim Aktualisieren des Benutzertyps:', error)
    );
  }
}
