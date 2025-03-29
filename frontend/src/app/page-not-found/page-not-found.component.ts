import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  template: `
    <div class="not-found">
      <h2>Seite nicht gefunden</h2>
      <button (click)="navigateHome()">Zurück zur Startseite</button>
    </div>
  `,
  styles: [`.not-found { text-align: center; margin-top: 100px; }`],
  standalone: true
})
export class PageNotFoundComponent {
  constructor(private router: Router) {}

  navigateHome() {
    this.router.navigate(['/']);
  }
}
