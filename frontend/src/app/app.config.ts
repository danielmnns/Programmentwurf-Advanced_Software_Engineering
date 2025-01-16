import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { routes } from './app.routes';

@NgModule({
  imports: [BrowserModule, RouterModule.forRoot(routes), FormsModule, AppComponent, LoginComponent],
})
export class AppConfig {}
