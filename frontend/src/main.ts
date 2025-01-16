import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppConfig } from '..src/app/appconfig';

platformBrowserDynamic()
  .bootstrapModule(AppConfig)
  .catch(err => console.error(err));
