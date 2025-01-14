import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { StartseiteComponent } from './startseite/startseite.component';
import { VerwalterStartseiteComponent } from './verwalter-startseite/verwalter-startseite.component';
import { AccountComponent } from './account/account.component';
import { KursComponent } from './kurs/kurs.component';
import { FormsModule } from '@angular/forms';
import { AuthGuard } from './auth-guard/auth.guard';

export const routes: Routes = [
  { path: '', component: LoginComponent }, // Login-Seite als Standard
  { path: 'account', component: AccountComponent }, 
  { path: 'kurs', component: KursComponent },
  
  // ✅ Normale Startseite für Studenten & Dozenten (mit AuthGuard)
  { path: 'startseite', component: StartseiteComponent, canActivate: [AuthGuard] }, 
  
  // ✅ Verwalter-Startseite für Admins & Kursleiter (mit AuthGuard)
  { path: 'verwalter-startseite', component: VerwalterStartseiteComponent, canActivate: [AuthGuard] }, 
  
  // ✅ Fallback-Weiterleitungen
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [FormsModule, RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
