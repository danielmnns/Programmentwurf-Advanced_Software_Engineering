import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { HeadbarComponent } from './headbar/headbar.component';
import { AccountComponent } from './account/account.component';
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
    AdminKursComponent
  ],
  imports: [
    BrowserModule,
    KursComponent,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule, // Pflicht für Angular Material
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule,
    KursComponent,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
