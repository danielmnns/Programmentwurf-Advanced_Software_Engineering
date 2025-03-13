import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // Pflicht für Angular Material
import { SafeResourceUrl } from '@angular/platform-browser';

// Angular Material Module Imports
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { HeadbarComponent } from './headbar/headbar.component';
import { AccountComponent } from './account/account.component';
import { EnrollmentDialogComponent } from './user-dashboard/enrollment-dialog/enrollment-dialog.component';
import { AdminKursComponent } from './admin-kurs/admin-kurs.component';
import { KursComponent } from './user-kurs/user-kurs.component';
import { UserVerwaltungComponent } from './user-verwaltung/user-verwaltung.component';
import { UserAufgabeComponent } from './user-aufgabe/user-aufgabe.component';
import { AdminAufgabeComponent } from './admin-aufgabe/admin-aufgabe.component';
import { NewTaskDialogComponent } from './new-task-dialog/new-task-dialog.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AdminDashboardComponent,
    UserDashboardComponent,
    HeadbarComponent,
    AccountComponent,
    AdminKursComponent,
    KursComponent,
    EnrollmentDialogComponent,
    UserVerwaltungComponent,
    UserAufgabeComponent,
    AdminAufgabeComponent,
    NewTaskDialogComponent

  ],
  imports: [
    BrowserModule,
    FormsModule,
    MatFormFieldModule,
    MatListModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule,
    AppRoutingModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatToolbarModule,
    MatCheckboxModule,
    MatDividerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}

export interface DocumentFile {
  name: string;
  url: SafeResourceUrl;
}

export interface Submission {
  file: DocumentFile;
  feedback?: DocumentFile | null;
}

export interface Task {
  name: string;
  description: string;
  documents?: DocumentFile[];
  submissions?: { [username: string]: Submission };
}