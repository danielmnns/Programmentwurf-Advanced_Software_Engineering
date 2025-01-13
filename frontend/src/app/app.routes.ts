import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AccountComponent } from './account/account.component';  // AccountComponent importieren
import { KursComponent } from './kurs/kurs.component';  // KursComponent importieren

export const routes: Routes = [
    { path: '', loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)},
    { path: 'account', component: AccountComponent }, // Konto-Seite
    { path: 'kurs', component: KursComponent },
  ];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
