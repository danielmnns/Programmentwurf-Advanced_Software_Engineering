import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-kurs',
  templateUrl: './kurs.component.html',
  styleUrl: './kurs.component.css'
})
export class KursComponent {
  constructor(private router: Router) {}

  navigateToAccount(): void {
    this.router.navigate(['/account']);
  }
}
