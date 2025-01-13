import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router'; // Router importieren

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  loginError: boolean = false;

  constructor(private router: Router) {}

  onSubmit(form: NgForm) {
    if (form.valid) {
      if (this.username === 'admin' && this.password === 'admin') {
        this.loginError = false;
        // Weiterleitung zur Startseite
        this.router.navigate(['/startseite']);
      } else {
        this.loginError = true;
      }
    }
  }
}
