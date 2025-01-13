import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component'; // Richtiger Pfad zu app.component
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes'; // Richtiger Pfad zu app.routes

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes)],
}).catch(err => console.error(err));
