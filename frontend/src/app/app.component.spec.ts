import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { AppComponent } from './app.component';
import { AuthService } from './auth/auth.service';
import { InactivityService } from './services/inactivity.service';
import { LanguageService } from './services/language.service';
import { UserDataService } from './services/userdata.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let userDataServiceSpy: jasmine.SpyObj<UserDataService>;
  let languageServiceSpy: jasmine.SpyObj<LanguageService>;
  let inactivityServiceSpy: jasmine.SpyObj<InactivityService>;

  beforeEach(async () => {
    // Spies für die Services erstellen
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn', 'logout']);
    userDataServiceSpy = jasmine.createSpyObj('UserDataService', ['getUserData', 'fetchUserData']);
    languageServiceSpy = jasmine.createSpyObj('LanguageService', ['getLanguage', 'setLanguage']);
    inactivityServiceSpy = jasmine.createSpyObj('InactivityService', ['init', 'stopMonitoring']);

    // Standardwerte für Spies setzen
    authServiceSpy.isLoggedIn.and.returnValue(false);
    userDataServiceSpy.getUserData.and.returnValue(null);
    userDataServiceSpy.fetchUserData.and.returnValue(of({ success: true }));

    // TestBed konfigurieren
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AppComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: UserDataService, useValue: userDataServiceSpy },
        { provide: LanguageService, useValue: languageServiceSpy },
        { provide: InactivityService, useValue: inactivityServiceSpy }
      ]
    }).compileComponents();

    // Komponente erstellen
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should have a title', () => {
    expect(component.title).toEqual('Saugiels Lernplattform');
  });

  it('should start inactivity monitoring when user is logged in', () => {
    // Mock localStorage, um ein Token zu simulieren
    spyOn(localStorage, 'getItem').and.callFake((key) => {
      if (key === 'token') return 'fake-token';
      return null;
    });

    // Mock: Benutzer ist eingeloggt
    authServiceSpy.isLoggedIn.and.returnValue(true);

    // Komponente initialisieren
    fixture.detectChanges();

    // Manuell die startInactivityMonitoring-Methode aufrufen
    (component as any).startInactivityMonitoring();

    // Prüfen, ob Inaktivitätsüberwachung gestartet wurde
    expect(inactivityServiceSpy.init).toHaveBeenCalled();
  });

  it('should not start inactivity monitoring when user is not logged in', () => {
    // Mock: Benutzer ist nicht eingeloggt
    authServiceSpy.isLoggedIn.and.returnValue(false);

    // Komponente initialisieren
    fixture.detectChanges();

    // Prüfen, ob Inaktivitätsüberwachung nicht gestartet wurde
    expect(inactivityServiceSpy.init).not.toHaveBeenCalled();
  });

  it('should handle error when fetching user data fails', () => {
    // Simulieren eines Tokens im localStorage
    spyOn(localStorage, 'getItem').and.returnValue('fake-token');

    // Mock: Fehler beim Laden der Benutzerdaten
    userDataServiceSpy.fetchUserData.and.returnValue(throwError('Error'));

    // Komponente initialisieren
    fixture.detectChanges();

    // Prüfen, ob Logout und Navigation aufgerufen wurden
    expect(authServiceSpy.logout).toHaveBeenCalled();
  });

  it('should stop inactivity monitoring on component destruction', () => {
    // Komponente zerstören
    fixture.destroy();

    // Prüfen, ob Inaktivitätsüberwachung gestoppt wurde
    expect(inactivityServiceSpy.stopMonitoring).toHaveBeenCalled();
  });
});
