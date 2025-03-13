import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { AuthGuard } from './auth/auth.guard';
import { AccountComponent } from './account/account.component';
import { KursComponent } from './user-kurs/user-kurs.component';
import { AdminKursComponent } from './admin-kurs/admin-kurs.component';
import { UserVerwaltungComponent } from './user-verwaltung/user-verwaltung.component';
import { UserAufgabeComponent } from './user-aufgabe/user-aufgabe.component';
import { AdminAufgabeComponent } from './admin-aufgabe/admin-aufgabe.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },


  // Admin Dashboard, nur zugänglich für 'admin' und 'studiengangsleiter'
  { 
    path: 'admin-dashboard', 
    component: AdminDashboardComponent, 
    canActivate: [AuthGuard], 
    data: { allowedRoles: ['admin', 'studiengangsleiter'] }
  },

  // User Dashboard, nur zugänglich für 'dozent' und 'user'
  { 
    path: 'user-dashboard', 
    component: UserDashboardComponent, 
    canActivate: [AuthGuard], 
    data: { allowedRoles: ['dozent', 'student'] }
  },

  // Account Seite, für alle Benutzer zugänglich
  { path: 'account', component: AccountComponent},

  // User Kurs, für alle Benutzer zugänglich
  { 
    path: 'user-kurs/:courseName', 
    component: KursComponent, 
    canActivate: [AuthGuard], 
    data: { allowedRoles: ['admin', 'studiengangsleiter', 'dozent', 'student'] }
  },

  // Admin Kurs, nur zugänglich für 'admin', 'studiengangsleiter' und 'dozent'
  { 
    path: 'admin-kurs/:courseName', 
    component: AdminKursComponent, 
    canActivate: [AuthGuard], 
    data: { allowedRoles: ['admin', 'studiengangsleiter', 'dozent'] }
  },

  // Route für Studierende: z.B. http://localhost:4200/kursname/aufgabenname
  { path: ':courseName/:taskName', component: UserAufgabeComponent, 
    canActivate: [AuthGuard], 
    data: { allowedRoles: ['student'] }
   },

  // Route für Admin/Dozenten: z.B. http://localhost:4200/admin-aufgabe/kursname/aufgabenname
  { path: 'admin-aufgabe/:courseName/:taskName', component: AdminAufgabeComponent, 
    canActivate: [AuthGuard], 
    data: { allowedRoles: ['admin', 'studiengangsleiter', 'dozent'] } },

  { 
    path: 'user-verwaltung', 
    component: UserVerwaltungComponent, 
    canActivate: [AuthGuard], 
    data: { allowedRoles: ['admin'] } 
  },
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
