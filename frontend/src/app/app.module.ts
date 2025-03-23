import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule, SafeResourceUrl } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // Pflicht für Angular Material
import { A11yModule } from '@angular/cdk/a11y';


// Angular Material Module Imports
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';



import { AccountComponent } from './account/account.component';
import { AdminAufgabeComponent } from './admin-aufgabe/admin-aufgabe.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminKursComponent } from './admin-kurs/admin-kurs.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TokenInterceptor } from './auth/token.interceptor';
import { HeadbarComponent } from './headbar/headbar.component';
import { LoginComponent } from './login/login.component';
import { NewTaskDialogComponent } from './new-task-dialog/new-task-dialog.component';
import { UserAufgabeComponent } from './user-aufgabe/user-aufgabe.component';
import { EnrollmentDialogComponent } from './user-dashboard/enrollment-dialog/enrollment-dialog.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { KursComponent } from './user-kurs/user-kurs.component';
import { UserVerwaltungComponent } from './user-verwaltung/user-verwaltung.component';


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
    MatDividerModule,
    MatTooltipModule,
    A11yModule
  ],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true }],
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
