import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountComponent } from './account/account.component';
import { AdminAufgabeComponent } from './admin-aufgabe/admin-aufgabe.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminKursComponent } from './admin-kurs/admin-kurs.component';
import { authGuard } from './auth/auth.guard';
import { LoginComponent } from './login/login.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { UserAufgabeComponent } from './user-aufgabe/user-aufgabe.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { KursComponent } from './user-kurs/user-kurs.component';
import { UserVerwaltungComponent } from './user-verwaltung/user-verwaltung.component';


const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  // Admin Dashboard, nur zugänglich für 'admin' und 'studiengangsleiter'
  {
    path: 'admin-dashboard',
    component: AdminDashboardComponent,
    canActivate: [authGuard],
    data: { allowedRoles: ['admin', 'studiengangsleiter'] }
  },

  // User Dashboard, nur zugänglich für 'dozent' und 'user'
  {
    path: 'user-dashboard',
    component: UserDashboardComponent,
    canActivate: [authGuard],
    data: { allowedRoles: ['dozent', 'student'] }
  },

  // Account Seite, für alle Benutzer zugänglich
  { path: 'account', component: AccountComponent},

  // User Kurs, für alle Benutzer zugänglich
  {
    path: 'user-kurs/:courseName',
    component: KursComponent,
    canActivate: [authGuard],
    data: { allowedRoles: ['admin', 'studiengangsleiter', 'dozent', 'student'] }
  },

  // Admin Kurs, nur zugänglich für 'admin', 'studiengangsleiter' und 'dozent'
  {
    path: 'admin-kurs/:courseName',
    component: AdminKursComponent,
    canActivate: [authGuard],
    data: { allowedRoles: ['admin', 'studiengangsleiter', 'dozent'] }
  },

  // Route für Studierende: z.B. http://localhost:4200/kursname/aufgabenname
  { path: ':courseName/:taskName', component: UserAufgabeComponent,
    canActivate: [authGuard],
    data: { allowedRoles: ['student'] }
   },

  // Route für Admin/Dozenten: z.B. http://localhost:4200/admin-aufgabe/kursname/aufgabenname
  { path: 'admin-aufgabe/:courseName/:taskName', component: AdminAufgabeComponent,
    canActivate: [authGuard],
    data: { allowedRoles: ['admin', 'studiengangsleiter', 'dozent'] } },

  {
    path: 'user-verwaltung',
    component: UserVerwaltungComponent,
    canActivate: [authGuard],
    data: { allowedRoles: ['admin'] }
  },
  { path: '**', component: PageNotFoundComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
