import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';  // RouterModule hier importieren

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],  // Importiere das RouterModule hier
  template: `<router-outlet></router-outlet>`,
  styleUrls: ['./app.component.css']
})
export class AppComponent {}
