import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '../pipes/translate.pipe';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    RouterModule
  ]
})
export class FooterComponent implements OnInit {
  currentYear: number = new Date().getFullYear();

  constructor(public languageService: LanguageService) {}

  ngOnInit(): void {
    // Any initialization logic if needed
  }
}
