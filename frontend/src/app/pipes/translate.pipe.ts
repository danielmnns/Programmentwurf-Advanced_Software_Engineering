import { OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LanguageService } from '../services/language.service';

@Pipe({
  name: 'translate',
  pure: false, // Wichtig für dynamische Sprachänderungen
  standalone: true
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private value: string = '';
  private lastKey: string = '';
  private destroy$ = new Subject<void>();
  private subscription: Subscription | null = null;

  constructor(private languageService: LanguageService) {
    // Abonnieren der Sprachänderungen
    this.subscription = this.languageService.currentLanguage$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // Bei Sprachänderungen den letzten Schlüssel neu übersetzen
        if (this.lastKey) {
          this.value = this.languageService.translate(this.lastKey);
        }
      });
  }

  transform(key: string): string {
    if (!key) return '';
    
    // Schlüssel speichern für spätere Re-Übersetzungen
    this.lastKey = key;
    
    // Aktuelle Übersetzung abrufen
    this.value = this.languageService.translate(key);
    
    return this.value;
  }

  ngOnDestroy(): void {
    // Aufräumen, um Speicherlecks zu vermeiden
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}