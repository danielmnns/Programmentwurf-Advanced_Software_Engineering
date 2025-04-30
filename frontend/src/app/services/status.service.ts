import { Injectable } from '@angular/core';
import { LanguageService } from './language.service';

@Injectable({
  providedIn: 'root'
})
export class StatusService {
  
  constructor(private languageService: LanguageService) { }

  /* Zeigt eine Erfolgs-Meldung an */
  showSuccess(messageKey: string, params: Record<string, string> = {}): void {
    const translatedMessage = this.translateMessage(messageKey, params);
    alert(translatedMessage);
  }

  /* Zeigt eine Fehler-Meldung an */
  showError(messageKey: string, params: Record<string, string> = {}): void {
    const translatedMessage = this.translateMessage(messageKey, params);
    alert(`${this.languageService.translate('error')}: ${translatedMessage}`);
  }

  /* Zeigt einen Bestätigungsdialog an und gibt zurück, ob der Benutzer bestätigt hat */
  confirmAction(messageKey: string, params: Record<string, string> = {}): boolean {
    const translatedMessage = this.translateMessage(messageKey, params);
    return confirm(translatedMessage);
  }

  /* Übersetzt eine Nachricht mit Platzhaltern */
  private translateMessage(messageKey: string, params: Record<string, string> = {}): string {
    let message = this.languageService.translate(messageKey);
    
    /* Ersetze Parameter in der Form {{paramName}} */
    Object.keys(params).forEach(key => {
      message = message.replace(`{{${key}}}`, params[key]);
    });
    
    return message;
  }
}