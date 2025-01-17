import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // Pflicht für Angular Material

// Angular Material Module Imports
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';

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
    EnrollmentDialogComponent

  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
      MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule,
    AppRoutingModule,
    MatDialogModule,// Pflicht für Angular Material

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
