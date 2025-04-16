import { A11yModule } from '@angular/cdk/a11y';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Angular Material Module Imports
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

// Komponenten
import { CommonModule } from '@angular/common';
import { AccountComponent } from './account/account.component';
import { AdminAufgabeComponent } from './admin-aufgabe/admin-aufgabe.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminKursComponent } from './admin-kurs/admin-kurs.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TokenInterceptor } from './auth/token.interceptor';
import { FooterComponent } from './footer/footer.component';
import { HeadbarComponent } from './headbar/headbar.component';
import { LoginComponent } from './login/login.component';
import { NewTaskDialogComponent } from './new-task-dialog/new-task-dialog.component';
import { UserAufgabeComponent } from './user-aufgabe/user-aufgabe.component';
import { EnrollmentDialogComponent } from './user-dashboard/enrollment-dialog/enrollment-dialog.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { KursComponent } from './user-kurs/user-kurs.component';
import { UserVerwaltungComponent } from './user-verwaltung/user-verwaltung.component';






@NgModule({
  // AppComponent muss hier deklariert werden, damit sie als bootstrap-Komponente verwendet werden kann
  declarations: [
    AppComponent
  ],
  imports: [
    // Angular core modules
    BrowserModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    AppRoutingModule,

    // Material modules
    MatFormFieldModule,
    MatListModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule,
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
    A11yModule,
    CommonModule,

    // Import standalone components
    LoginComponent,
    AdminDashboardComponent,
    UserDashboardComponent,
    HeadbarComponent,
    FooterComponent,
    AccountComponent,
    AdminKursComponent,
    KursComponent,
    EnrollmentDialogComponent,
    UserVerwaltungComponent,
    AdminAufgabeComponent,
    NewTaskDialogComponent,
    UserAufgabeComponent
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
