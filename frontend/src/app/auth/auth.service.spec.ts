import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { UserDataService } from '../services/userdata.service';
import { LoginResponse } from '../models/login-response.model';
import { of } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;
  let userDataServiceSpy: jasmine.SpyObj<UserDataService>;

  beforeEach(() => {
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
    const userDataServiceSpyObj = jasmine.createSpyObj('UserDataService', ['fetchUserData', 'clearUserData']);
    
    // Mock fetchUserData to return an observable
    userDataServiceSpyObj.fetchUserData.and.returnValue(of({}));

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpyObj },
        { provide: UserDataService, useValue: userDataServiceSpyObj }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    userDataServiceSpy = TestBed.inject(UserDataService) as jasmine.SpyObj<UserDataService>;
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userName');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should login and store user data in localStorage', () => {
      const mockResponse: LoginResponse = {
        success: true,
        user: {
          username: 'testuser',
          userType: 'student',
          token: 'test-token'
        },
        token: 'test-token'
      };

      service.login('testuser', 'password').subscribe((res: LoginResponse) => {
        expect(res).toEqual(mockResponse);
        expect(localStorage.getItem('token')).toBe('test-token');
        expect(localStorage.getItem('userType')).toBe('student');
        expect(localStorage.getItem('userName')).toBe('testuser');
      });

      const req = httpMock.expectOne('http://localhost:3000/api/auth/login');
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });

    it('should handle login error', () => {
      service.login('testuser', 'wrongpassword').subscribe(
        () => fail('should have failed with 401 error'),
        (error) => {
          expect(error.status).toBe(401);
        }
      );

      const req = httpMock.expectOne('http://localhost:3000/api/auth/login');
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('logout', () => {
    it('should clear localStorage and user data', () => {
      // Setup localStorage with test data
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('userType', 'student');
      localStorage.setItem('userName', 'testuser');

      service.logout();

      // Verify localStorage is cleared
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('userType')).toBeNull();
      expect(localStorage.getItem('userName')).toBeNull();
      expect(userDataServiceSpy.clearUserData).toHaveBeenCalled();
    });
  });

  describe('isLoggedIn', () => {
    it('should return true when logged in', () => {
      // Set the private property using a workaround
      (service as any).loggedIn = true;
      expect(service.isLoggedIn()).toBe(true);
    });

    it('should return false when not logged in', () => {
      (service as any).loggedIn = false;
      expect(service.isLoggedIn()).toBe(false);
    });
  });

  describe('getUserType and getUserName', () => {
    it('should return userType', () => {
      (service as any).userType = 'student';
      expect(service.getUserType()).toBe('student');
    });

    it('should return userName', () => {
      (service as any).userName = 'testuser';
      expect(service.getUserName()).toBe('testuser');
    });
  });

  describe('changePassword', () => {
    it('should send password change request', () => {
      const payload = {
        userName: 'testuser',
        password: 'oldpassword',
        newPassword: 'newpassword'
      };
      const mockResponse = { 
        passwordChangeSuccess: true
      };

      service.changePassword(payload).subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('http://localhost:3000/api/auth/Schange-password');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(mockResponse);
    });
  });
});