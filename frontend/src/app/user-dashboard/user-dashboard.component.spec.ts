import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { CourseService } from '../services/course.service';
import { LanguageService } from '../services/language.service';
import { UserDashboardComponent } from './user-dashboard.component';

describe('UserDashboardComponent', () => {
  let component: UserDashboardComponent;
  let fixture: ComponentFixture<UserDashboardComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let courseServiceSpy: jasmine.SpyObj<CourseService>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let languageServiceSpy: jasmine.SpyObj<LanguageService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockCourses = [
    { _id: '1', title: 'Course 1', enrolledUsers: ['testuser'] },
    { _id: '2', title: 'Course 2', enrolledUsers: [] }
  ];

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['getUserName']);
    const courseSpy = jasmine.createSpyObj('CourseService', ['getAllCourses']);
    const dialogSpyObj = jasmine.createSpyObj('MatDialog', ['open']);
    const languageSpy = jasmine.createSpyObj('LanguageService', ['']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    // Mock LanguageService with translations
    languageSpy.dashboard = { 
      studentTitle: 'Student Dashboard',
      adminTitle: 'Admin Dashboard',
      availableCourses: 'Available Courses',
      courseEnrollment: 'Course Enrollment',
      noCourses: 'No courses available'
    };

    await TestBed.configureTestingModule({
      declarations: [UserDashboardComponent],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: CourseService, useValue: courseSpy },
        { provide: MatDialog, useValue: dialogSpyObj },
        { provide: LanguageService, useValue: languageSpy },
        { provide: Router, useValue: routerSpyObj }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserDashboardComponent);
    component = fixture.componentInstance;
    
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    courseServiceSpy = TestBed.inject(CourseService) as jasmine.SpyObj<CourseService>;
    dialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    languageServiceSpy = TestBed.inject(LanguageService) as jasmine.SpyObj<LanguageService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>();

    // Set up mock responses
    authServiceSpy.getUserName.and.returnValue('testuser');
    courseServiceSpy.getAllCourses.and.returnValue(of(mockCourses));
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load courses on init', () => {
    fixture.detectChanges();
    expect(courseServiceSpy.getAllCourses).toHaveBeenCalled();
    expect(component.courses).toEqual(mockCourses);
  });

  it('should check if user is enrolled in course', () => {
    fixture.detectChanges();
    expect(component.isUserEnrolled(mockCourses[0])).toBeTrue();
    expect(component.isUserEnrolled(mockCourses[1])).toBeFalse();
  });

  it('should navigate to course details when navigateToCourse is called', () => {
    fixture.detectChanges();
    component.navigateToCourse('Course 1');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/user-kurs', 'Course%201']);
  });
});