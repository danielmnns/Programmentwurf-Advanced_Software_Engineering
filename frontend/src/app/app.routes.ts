import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth/auth.guard';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';


export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard/admin',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['admin', 'studiengangsleiter'] }
  },
  {
    path: 'dashboard/user',
    component: UserDashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['student', 'dozent'] }
  },
  { path: '**', redirectTo: 'login' }
];
