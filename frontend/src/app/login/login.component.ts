import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.login(this.username, this.password).subscribe(response => {
      if (response.success) {
        this.authService.storeUserData(response.username, response.userType);
        if (response.userType === 'admin' || response.userType === 'studiengangsleiter') {
          this.router.navigate(['/dashboard/admin']);
        } else {
          this.router.navigate(['/dashboard/user']);
        }
      } else {
        alert('Login fehlgeschlagen');
      }
    });
  }
}
