import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { StartseiteComponent } from './startseite/startseite.component';
import { AccountComponent } from './account/account.component'; // AccountComponent importieren
import { KursComponent } from './kurs/kurs.component';
import { KursStudentComponent } from './kurs-student/kurs-student.component';

export const routes: Routes = [
  { path: '', component: LoginComponent }, // Standardroute: Login-Seite
  { path: 'account', component: AccountComponent }, // Konto-Seite
  { path: 'kurs', component: KursComponent }, // Kurs-Erstellungsseite
  { path: 'kurs-student', component: KursStudentComponent }, // Kurs-Ansicht für Studenten
  { path: 'startseite', component: StartseiteComponent }, // Startseite
  { path: '**', redirectTo: '', pathMatch: 'full' } // Wildcard: Redirect auf Login
];

@NgModule({
  imports: [RouterModule.forRoot(routes)], // Routen-Konfiguration in Angular registrieren
  exports: [RouterModule] // RouterModule exportieren
})
export class AppRoutingModule { }
