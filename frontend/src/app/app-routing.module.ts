import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { AuthGuard } from './auth/auth.guard';
import { AccountComponent } from './account/account.component';
import { KursComponent } from './user-kurs/user-kurs.component';
import { AdminKursComponent } from './admin-kurs/admin-kurs.component';

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
    data: { allowedRoles: ['dozent', 'user'] }
  },

  // Account Seite, für alle Benutzer zugänglich
  { path: 'account', component: AccountComponent, canActivate: [AuthGuard] },

  // User Kurs, für alle Benutzer zugänglich
  { 
    path: 'user-kurs/:courseName', 
    component: KursComponent, 
    canActivate: [AuthGuard], 
    data: { allowedRoles: ['admin', 'studiengangsleiter', 'dozent', 'user'] }
  },

  // Admin Kurs, nur zugänglich für 'admin', 'studiengangsleiter' und 'dozent'
  { 
    path: 'admin-kurs/:courseName', 
    component: AdminKursComponent, 
    canActivate: [AuthGuard], 
    data: { allowedRoles: ['admin', 'studiengangsleiter', 'dozent'] }
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
