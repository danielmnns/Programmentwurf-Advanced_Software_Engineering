import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { TranslatePipe } from '../pipes/translate.pipe';
import { LanguageService } from '../services/language.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let languageServiceSpy: jasmine.SpyObj<LanguageService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login', 'isLoggedIn']);
    const languageSpy = jasmine.createSpyObj('LanguageService', ['getCurrentLanguage']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    // Mock LanguageService
    languageSpy.login = {
      title: 'Login',
      username: 'Username',
      password: 'Password',
      loginBtn: 'Login',
      errorMessage: 'Login failed'
    };

    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        BrowserAnimationsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule
      ],
      declarations: [LoginComponent, TranslatePipe],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: LanguageService, useValue: languageSpy },
        { provide: Router, useValue: routerSpyObj }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    languageServiceSpy = TestBed.inject(LanguageService) as jasmine.SpyObj<LanguageService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty fields', () => {
    fixture.detectChanges();
    expect(component.username).toBe('');
    expect(component.password).toBe('');
    expect(component.loginFailed).toBeFalse();
  });

  it('should call login service on form submission', () => {
    const mockLoginResponse = {
      success: true,
      user: {
        username: 'testuser',
        userType: 'student',
        token: 'test-token'
      },
      token: 'test-token'
    };
    authServiceSpy.login.and.returnValue(of(mockLoginResponse));
    
    fixture.detectChanges();
    component.username = 'testuser';
    component.password = 'password';
    
    component.onSubmit();
    
    expect(authServiceSpy.login).toHaveBeenCalledWith('testuser', 'password');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/user-dashboard']);
    expect(component.loginFailed).toBeFalse();
    expect(component.isLoading).toBeFalse();
  });

  it('should handle login failure with error message', () => {
    const mockErrorResponse = {
      success: false,
      message: 'Invalid credentials'
    };
    authServiceSpy.login.and.returnValue(of(mockErrorResponse));
    
    fixture.detectChanges();
    component.username = 'testuser';
    component.password = 'wrongpassword';
    
    component.onSubmit();
    
    expect(authServiceSpy.login).toHaveBeenCalledWith('testuser', 'wrongpassword');
    expect(component.loginFailed).toBeTrue();
    expect(component.errorMessage).toBe('Invalid credentials');
  });

  it('should handle http error during login', () => {
    authServiceSpy.login.and.returnValue(throwError({ status: 401, error: 'Unauthorized' }));
    
    fixture.detectChanges();
    component.username = 'testuser';
    component.password = 'password';
    
    component.onSubmit();
    
    expect(authServiceSpy.login).toHaveBeenCalledWith('testuser', 'password');
    expect(component.loginFailed).toBeTrue();
  });

  it('should navigate admin to admin dashboard', () => {
    const mockLoginResponse = {
      success: true,
      user: {
        username: 'admin',
        userType: 'admin',
        token: 'admin-token'
      },
      token: 'admin-token'
    };
    authServiceSpy.login.and.returnValue(of(mockLoginResponse));
    
    fixture.detectChanges();
    component.username = 'admin';
    component.password = 'adminpass';
    
    component.onSubmit();
    
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin-dashboard']);
  });
});