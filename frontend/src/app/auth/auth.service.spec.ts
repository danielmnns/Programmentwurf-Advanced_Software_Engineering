import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { UserDataService } from '../services/userdata.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let userDataServiceSpy: jasmine.SpyObj<UserDataService>;

  beforeEach(() => {
    // Spy für UserDataService erstellen
    userDataServiceSpy = jasmine.createSpyObj('UserDataService', ['fetchUserData', 'clearUserData']);
    userDataServiceSpy.fetchUserData.and.returnValue(of({ success: true }));

    // Storage-Methoden mocken
    spyOn(localStorage, 'getItem').and.callFake((key) => {
      return null; // Standardmäßig null zurückgeben
    });
    spyOn(localStorage, 'setItem');
    spyOn(localStorage, 'removeItem');

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: UserDataService, useValue: userDataServiceSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Stellen Sie sicher, dass keine ausstehenden Anfragen bestehen
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set logged in state after successful login', () => {
    // Mock-Daten für die Antwort
    const mockResponse = {
      success: true,
      token: 'test-token',
      user: {
        username: 'testuser',
        userType: 'admin',
        token: 'test-token' // Token-Feld hinzugefügt
      }
    };

    // Login-Methode aufrufen
    service.login('testuser', 'password').subscribe((response) => {
      expect(response).toEqual(mockResponse);
      expect(service.isLoggedIn()).toBeTrue();
      expect(service.getUserType()).toBe('admin');
      expect(service.getUserName()).toBe('testuser');
    });

    // HTTP-Anfrage abfangen und beantworten
    const req = httpMock.expectOne('http://localhost:3000/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);

    // Prüfen, ob localStorage-Werte gesetzt wurden
    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'test-token');
    expect(localStorage.setItem).toHaveBeenCalledWith('userType', 'admin');
    expect(localStorage.setItem).toHaveBeenCalledWith('userName', 'testuser');

    // Prüfen, ob Benutzerdaten abgerufen wurden
    expect(userDataServiceSpy.fetchUserData).toHaveBeenCalled();
  });

  it('should not set logged in state after failed login', () => {
    // Mock-Daten für die Antwort bei fehlgeschlagenem Login
    const mockResponse = {
      success: false,
      message: 'Invalid credentials'
    };

    // Login-Methode aufrufen
    service.login('testuser', 'wrongpassword').subscribe((response) => {
      expect(response.success).toBeFalse();
      expect(service.isLoggedIn()).toBeFalse();
    });

    // HTTP-Anfrage abfangen und beantworten
    const req = httpMock.expectOne('http://localhost:3000/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should clear user data on logout', () => {
    // Spy direkt auf getUserName und getUserType, um die Rückgabewerte zu kontrollieren
    spyOn(service, 'getUserName').and.returnValue(null);
    spyOn(service, 'getUserType').and.returnValue(null);

    // Login-Status manuell setzen
    (service as any).loggedIn = true;
    (service as any).userType = 'admin';
    (service as any).userName = 'testuser';
    (service as any).token = 'test-token';

    // Logout ausführen
    service.logout();

    // Status prüfen
    expect(service.isLoggedIn()).toBeFalse();

    // localStorage-Aufrufe prüfen
    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(localStorage.removeItem).toHaveBeenCalledWith('userType');
    expect(localStorage.removeItem).toHaveBeenCalledWith('userName');

    // UserDataService-Aufrufe prüfen
    expect(userDataServiceSpy.clearUserData).toHaveBeenCalled();
  });

  it('should restore session from localStorage', () => {
    // Einrichten des localStorage-Spys mit korrekten Werten
    (localStorage.getItem as jasmine.Spy).and.callFake((key) => {
      if (key === 'token') return 'stored-token';
      if (key === 'userType') return 'student';
      if (key === 'userName') return 'studentuser';
      return null;
    });

    // Den Service manuell neu erstellen, um restoreSession zu triggern
    service = new AuthService(TestBed.inject(HttpClient), userDataServiceSpy);

    // Prüfen, ob die Werte korrekt wiederhergestellt wurden
    expect(service.isLoggedIn()).toBeTrue();
    expect(service.getUserType()).toBe('student');
    expect(service.getUserName()).toBe('studentuser');
  });

  it('should send correct data when changing password', () => {
    const payload = {
      userName: 'testuser',
      password: 'oldpassword',
      newPassword: 'newpassword'
    };

    const mockResponse = {
      passwordChangeSuccess: true
    };

    // Passwortänderung durchführen
    service.changePassword(payload).subscribe(response => {
      expect(response.passwordChangeSuccess).toBeTrue();
    });

    // HTTP-Anfrage prüfen
    const req = httpMock.expectOne('http://localhost:3000/api/auth/change-password');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockResponse);
  });
});
