import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Language = 'de' | 'en';
export interface Translations {
  [key: string]: string;
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  // Default language is German
  private currentLanguageSubject = new BehaviorSubject<Language>('de');
  public currentLanguage$ = this.currentLanguageSubject.asObservable();
  
  // Store translations for each language
  private translations: { [key in Language]: Translations } = {
    de: {},
    en: {}
  };

  constructor(private ngZone: NgZone) {
    // Zuerst Übersetzungen laden
    this.loadTranslations();
    
    // Dann Spracheinstellung laden oder festlegen
    const savedLang = localStorage.getItem('preferredLanguage') as Language;
    if (savedLang && (savedLang === 'de' || savedLang === 'en')) {
      this.setLanguage(savedLang);
    } else {
      // If no saved preference, detect browser language
      const browserLang = navigator.language.split('-')[0];
      if (browserLang === 'en') {
        this.setLanguage('en');
      }
      // Default is already 'de'
    }
  }

  private loadTranslations() {
    // German translations (default)
    this.translations.de = {
      // Common
      'yes': 'Ja',
      'no': 'Nein',
      'login': 'Anmeldung',
      'logout': 'Abmelden',
      'username': 'Benutzername',
      'password': 'Passwort',
      'submit': 'Bestätigen',
      'cancel': 'Abbrechen',
      'save': 'Speichern',
      'edit': 'Bearbeiten',
      'delete': 'Löschen',
      'confirm': 'Bestätigen',
      'back': 'Zurück',
      'close': 'Schließen',
      'from': 'von',
      'preview': 'Vorschau',
      'search': 'Suchen',
      'actions': 'Aktionen',
      'selectFile': 'Datei auswählen',
      'noFileSelected': 'Keine Datei ausgewählt',
      
      // Footer links
      'privacyPolicy': 'Datenschutzerklärung',
      'termsOfService': 'Nutzungsbedingungen',
      'contact': 'Kontakt',
      
      // Export functions
      'exportPDF': 'Als PDF exportieren',
      'exportCSV': 'Als CSV exportieren',
      'exportSuccess': '{{type}}-Export erfolgreich',
      
      // Navigation & Headers
      'dashboard': 'Dashboard',
      'courses': 'Kurse',
      'tasks': 'Aufgaben',
      'account': 'Konto',
      'viewCourse': 'Kurs anzeigen',
      'enrollInCourse': 'In Kurs einschreiben',
      'courseEnrollmentRequired': 'Einschreibung erforderlich',
      
      // User Types
      'admin': 'Administrator',
      'student': 'Student',
      'dozent': 'Dozent',
      'studiengangsleiter': 'Studiengangsleiter',
      'teacher': 'Dozent',
      'secretary': 'Sekretärin',
      'courseLeader': 'Kursleiter',
      'defaultUserType': 'Benutzer',
      
      // Course related
      'courseManagement': 'Kursverwaltung',
      'addCourse': 'Kurs hinzufügen',
      'courseDetails': 'Kursdetails',
      'courseName': 'Kursname',
      'courseDescription': 'Kursbeschreibung',
      'participants': 'Teilnehmer',
      'addParticipant': 'Teilnehmer hinzufügen',
      'removeParticipant': 'Teilnehmer entfernen',
      'materials': 'Materialien',
      'addMaterial': 'Material hinzufügen',
      'removeMaterial': 'Material entfernen',
      'confirmDeleteCourse': 'Möchten Sie diesen Kurs wirklich löschen?',
      'courseCreatedSuccess': 'Kurs wurde erfolgreich erstellt!',
      'courseCreationError': 'Fehler beim Erstellen des Kurses.',
      'enterCourseName': 'Bitte geben Sie einen Kursnamen ein.',
      
      // Task related
      'taskName': 'Aufgabenname',
      'taskDescription': 'Aufgabenbeschreibung',
      'addTask': 'Aufgabe hinzufügen',
      'editTask': 'Aufgabe bearbeiten',
      'deleteTask': 'Aufgabe löschen',
      'submissions': 'Abgaben',
      'submission': 'Abgabe',
      'feedback': 'Feedback',
      'grade': 'Note',
      'submitWork': 'Arbeit einreichen',
      
      // User management
      'userManagement': 'Benutzerverwaltung',
      'addUser': 'Benutzer hinzufügen',
      'editUser': 'Benutzer bearbeiten',
      'deleteUser': 'Benutzer löschen',
      'changePassword': 'Passwort ändern',
      'oldPassword': 'Altes Passwort',
      'newPassword': 'Neues Passwort',
      
      // Messages
      'loginSuccess': 'Erfolgreich angemeldet',
      'loginError': 'Anmeldungsfehler',
      'logoutSuccess': 'Erfolgreich abgemeldet',
      'saveSuccess': 'Erfolgreich gespeichert',
      'deleteConfirm': 'Sind Sie sicher, dass Sie dies löschen möchten?',
      'error': 'Fehler',
      'success': 'Erfolg',
      
      // Status messages
      'addMaterialSuccess': 'Material wurde erfolgreich hinzugefügt',
      'addMaterialError': 'Fehler beim Hinzufügen des Materials',
      'removeMaterialSuccess': 'Material "{{name}}" wurde erfolgreich entfernt',
      'removeMaterialError': 'Fehler beim Entfernen des Materials',
      'updateTaskSuccess': 'Aufgabe wurde erfolgreich aktualisiert',
      'updateTaskError': 'Fehler beim Aktualisieren der Aufgabe',
      'deleteTaskSuccess': 'Aufgabe wurde erfolgreich gelöscht',
      'deleteTaskError': 'Fehler beim Löschen der Aufgabe',
      'updateTextError': 'Fehler beim Aktualisieren des Textes',
      'courseCreatedError': 'Fehler beim Erstellen des Kurses',
      'courseDeletedSuccess': 'Kurs erfolgreich gelöscht',
      
      // Language
      'language': 'Sprache',
      'german': 'Deutsch',
      'english': 'Englisch',
      
      // Session
      'sessionTimeout': 'Sitzungszeit verbleibend'
    };
    
    // English translations
    this.translations.en = {
      // Common
      'yes': 'Yes',
      'no': 'No',
      'login': 'Login',
      'logout': 'Logout',
      'username': 'Username',
      'password': 'Password',
      'submit': 'Submit',
      'cancel': 'Cancel',
      'save': 'Save',
      'edit': 'Edit',
      'delete': 'Delete',
      'confirm': 'Confirm',
      'back': 'Back',
      'close': 'Close',
      'from': 'from',
      'preview': 'Preview',
      'search': 'Search',
      'actions': 'Actions',
      'selectFile': 'Select File',
      'noFileSelected': 'No file selected',
      
      // Footer links
      'privacyPolicy': 'Privacy Policy',
      'termsOfService': 'Terms of Service',
      'contact': 'Contact',
      
      // Export functions
      'exportPDF': 'Export as PDF',
      'exportCSV': 'Export as CSV',
      'exportSuccess': '{{type}} export successful',
      
      // Navigation & Headers
      'dashboard': 'Dashboard',
      'courses': 'Courses',
      'tasks': 'Tasks',
      'account': 'Account',
      'viewCourse': 'View course',
      'enrollInCourse': 'Enroll in course',
      'courseEnrollmentRequired': 'Enrollment required',
      
      // User Types
      'admin': 'Administrator',
      'student': 'Student',
      'dozent': 'Teacher',
      'studiengangsleiter': 'Program Director',
      'teacher': 'Teacher',
      'secretary': 'Secretary',
      'courseLeader': 'Course Leader',
      'defaultUserType': 'User',
      
      // Course related
      'courseManagement': 'Course Management',
      'addCourse': 'Add Course',
      'courseDetails': 'Course Details',
      'courseName': 'Course Name',
      'courseDescription': 'Course Description',
      'participants': 'Participants',
      'addParticipant': 'Add Participant',
      'removeParticipant': 'Remove Participant',
      'materials': 'Materials',
      'addMaterial': 'Add Material',
      'removeMaterial': 'Remove Material',
      'confirmDeleteCourse': 'Do you really want to delete this course?',
      'courseCreatedSuccess': 'Course was successfully created!',
      'courseCreationError': 'Error creating the course.',
      'enterCourseName': 'Please enter a course name.',
      
      // Task related
      'taskName': 'Task Name',
      'taskDescription': 'Task Description',
      'addTask': 'Add Task',
      'editTask': 'Edit Task',
      'deleteTask': 'Delete Task',
      'submissions': 'Submissions',
      'submission': 'Submission',
      'feedback': 'Feedback',
      'grade': 'Grade',
      'submitWork': 'Submit Work',
      
      // User management
      'userManagement': 'User Management',
      'addUser': 'Add User',
      'editUser': 'Edit User',
      'deleteUser': 'Delete User',
      'changePassword': 'Change Password',
      'oldPassword': 'Old Password',
      'newPassword': 'New Password',
      
      // Messages
      'loginSuccess': 'Successfully logged in',
      'loginError': 'Login error',
      'logoutSuccess': 'Successfully logged out',
      'saveSuccess': 'Successfully saved',
      'deleteConfirm': 'Are you sure you want to delete this?',
      'error': 'Error',
      'success': 'Success',
      
      // Status messages
      'addMaterialSuccess': 'Material has been successfully added',
      'addMaterialError': 'Error adding material',
      'removeMaterialSuccess': 'Material "{{name}}" has been successfully removed',
      'removeMaterialError': 'Error removing material',
      'updateTaskSuccess': 'Task has been successfully updated',
      'updateTaskError': 'Error updating task',
      'deleteTaskSuccess': 'Task has been successfully deleted',
      'deleteTaskError': 'Error deleting task',
      'updateTextError': 'Error updating text',
      
      // Language
      'language': 'Language',
      'german': 'German',
      'english': 'English',
      
      // Session
      'sessionTimeout': 'Session time remaining'
    };
  }

  public setLanguage(lang: Language): void {
    if (this.currentLanguageSubject.value !== lang) {
      // Nur aktualisieren, wenn sich die Sprache ändert
      this.ngZone.run(() => {
        this.currentLanguageSubject.next(lang);
        localStorage.setItem('preferredLanguage', lang);
        console.log(`Sprache geändert auf: ${lang}`);
      });
    }
  }

  public getCurrentLanguage(): Language {
    return this.currentLanguageSubject.value;
  }

  public translate(key: string): string {
    const lang = this.getCurrentLanguage();
    const translation = this.translations[lang][key];
    
    // Fallback auf Originaltext, wenn keine Übersetzung gefunden
    if (!translation) {
      console.warn(`Keine Übersetzung gefunden für "${key}" in Sprache "${lang}"`);
      return key;
    }
    
    return translation;
  }
}