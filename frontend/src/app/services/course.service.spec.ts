import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { CourseService } from './course.service';
import { AuthService } from '../auth/auth.service';

describe('CourseService', () => {
  let service: CourseService;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['getUserName']);
    authSpy.getUserName.and.returnValue('testuser');

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        CourseService,
        { provide: AuthService, useValue: authSpy }
      ]
    });

    service = TestBed.inject(CourseService);
    httpMock = TestBed.inject(HttpTestingController);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllCourses', () => {
    it('should return all courses with enrollment status', () => {
      const mockCourses = [
        { _id: '1', title: 'Course 1', participants: ['testuser'] },
        { _id: '2', title: 'Course 2', participants: ['otheruser'] }
      ];

      service.getAllCourses().subscribe((courses: any[]) => {
        expect(courses.length).toBe(2);
        expect(courses[0].enrolled).toBeTrue();
        expect(courses[1].enrolled).toBeFalse();
      });

      const req = httpMock.expectOne('http://localhost:3000/api/courses');
      expect(req.request.method).toBe('GET');
      req.flush(mockCourses);
    });
  });

  describe('getCourseData', () => {
    it('should return course data', () => {
      const mockCourse = {
        _id: '1',
        title: 'Test Course',
        textContent: 'Test content',
        participants: ['user1'],
        documents: [],
        tasks: []
      };

      service.getCourseData().subscribe((course: any) => {
        expect(course).toEqual(mockCourse);
      });

      const req = httpMock.expectOne('http://localhost:3000/api/courses/user-kurs');
      expect(req.request.method).toBe('GET');
      req.flush(mockCourse);
    });
  });

  describe('addCourse', () => {
    it('should add a new course', () => {
      const courseData = { title: 'New Course' };
      const mockResponse = { _id: '3', ...courseData };

      service.addCourse(courseData).subscribe((response: any) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('http://localhost:3000/api/courses');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(courseData);
      req.flush(mockResponse);
    });
  });

  describe('deleteCourse', () => {
    it('should delete a course', () => {
      const courseId = '1';

      service.deleteCourse(courseId).subscribe((response: any) => {
        expect(response).toBeNull(); // Assuming delete returns null or void
      });

      const req = httpMock.expectOne(`http://localhost:3000/api/courses/${courseId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('enrollInCourse', () => {
    it('should enroll user in course', () => {
      const enrollmentData = {
        username: 'testuser',
        courseName: 'Test Course',
        enrollmentKey: 'key123'
      };
      
      const mockResponse = {
        success: true,
        message: 'Successfully enrolled'
      };

      service.enrollInCourse(enrollmentData).subscribe((response: any) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('http://localhost:3000/api/user/enroll');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(enrollmentData);
      req.flush(mockResponse);
    });
  });
});