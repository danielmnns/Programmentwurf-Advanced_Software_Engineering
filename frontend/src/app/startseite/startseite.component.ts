import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-startseite',
  imports: [],
  templateUrl: './startseite.component.html',
  styleUrl: './startseite.component.css'
})
export class StartseiteComponent {
  constructor(private router: Router) {}

  goToDashboard() {
    this.router.navigate(['/dashboard']); // Navigiert zum Dashboard
  }
}
