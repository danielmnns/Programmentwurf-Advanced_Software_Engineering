import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = 'http://localhost:3000/api/courses';

  constructor(private http: HttpClient) {}

  getAllCourses(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  enrollInCourse(payload: { username: string; courseName: string; enrollmentKey: string }): Observable<any> {
    return this.http.post<any>('http://localhost:3000/api/user/enroll', payload);
  }
  
  getCourseData(): Observable<any> {
    const url = `${this.apiUrl}/user-kurs`;
    return this.http.get<any>(url);
  }
  
  deleteCourse(courseTitle: string): Observable<void> {
    return this.http.
    delete<void>(`${this.apiUrl}/${encodeURIComponent(courseTitle)}`);
  }

  addCourse(course: { title: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, course);
  }
  
}
