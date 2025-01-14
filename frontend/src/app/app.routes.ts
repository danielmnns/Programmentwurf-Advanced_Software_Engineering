import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { StartseiteComponent } from './startseite/startseite.component';
import { AccountComponent } from './account/account.component';  // AccountComponent importieren
import { KursComponent } from './kurs/kurs.component';
import { provideRouter } from '@angular/router';
import { bootstrapApplication } from '@angular/platform-browser';
import { KursStudentComponent } from './kurs-student/kurs-student.component';

export const routes: Routes = [
    { path: '', loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)},
    { path: 'account', component: AccountComponent }, // Konto-Seite
    { path: 'kurs', component: KursComponent }, // Kurs-Erstellungsseite
    { path: 'kurs-student', component: KursStudentComponent },
   { path: 'startseite', component: StartseiteComponent }, 
   
    { path: '**', redirectTo: '', pathMatch: 'full' }
  ];

  bootstrapApplication(StartseiteComponent, {
    providers: [provideRouter(routes)],
  });

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
