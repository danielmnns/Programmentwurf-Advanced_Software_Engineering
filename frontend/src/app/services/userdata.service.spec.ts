import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { UserDataService } from './userdata.service';

describe('UserDataService', () => {
  let service: UserDataService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserDataService]
    });

    service = TestBed.inject(UserDataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.removeItem('userData');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('fetchUserData', () => {
    it('should fetch user data and update BehaviorSubject', () => {
      const mockUserData = {
        username: 'testuser',
        email: 'test@example.com',
        roles: ['student']
      };

      service.fetchUserData().subscribe((userData: any) => {
        expect(userData).toEqual(mockUserData);
      });

      const req = httpMock.expectOne('http://localhost:3000/api/user/userdata');
      expect(req.request.method).toBe('GET');
      req.flush(mockUserData);

      // Verify that the data was stored in the BehaviorSubject
      expect(service.getUserData()).toEqual(mockUserData);
      
      // Verify that the data was stored in sessionStorage
      expect(sessionStorage.getItem('userData')).toBe(JSON.stringify(mockUserData));
    });
  });

  describe('getUserData', () => {
    it('should return user data from BehaviorSubject', () => {
      const mockUserData = {
        username: 'testuser',
        email: 'test@example.com'
      };
      
      // Use private setter to set the value
      (service as any).userDataSubject.next(mockUserData);
      
      expect(service.getUserData()).toEqual(mockUserData);
    });
    
    it('should return null if no data is set', () => {
      (service as any).userDataSubject.next(null);
      expect(service.getUserData()).toBeNull();
    });
  });

  describe('clearUserData', () => {
    it('should clear user data from BehaviorSubject and sessionStorage', () => {
      const mockUserData = {
        username: 'testuser',
        email: 'test@example.com'
      };
      
      // Set up data that will be cleared
      (service as any).userDataSubject.next(mockUserData);
      sessionStorage.setItem('userData', JSON.stringify(mockUserData));
      
      service.clearUserData();
      
      expect(service.getUserData()).toBeNull();
      expect(sessionStorage.getItem('userData')).toBeNull();
    });
  });
});