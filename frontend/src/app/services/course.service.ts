import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';


@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = 'http://localhost:3000/api/courses';

  constructor(private http: HttpClient,
    private authService: AuthService) {}

  getAllCourses(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map((courses: any[]) => {
        // Aktuellen Benutzernamen vom AuthService holen
        const currentUsername = this.authService.getUserName();
        
        // Für jeden Kurs prüfen, ob der aktuelle Benutzer eingeschrieben ist
        return courses.map(course => ({
          ...course,
          enrolled: course.participants && 
                    Array.isArray(course.participants) && 
                    course.participants.includes(currentUsername)
        }));
      })
    );
  }

  enrollInCourse(payload: { username: string; courseName: string; enrollmentKey: string }): Observable<any> {
    return this.http.post<any>('http://localhost:3000/api/user/enroll', payload);
  }
  
  getCourseData(): Observable<any> {
    const url = `${this.apiUrl}/user-kurs`;
    return this.http.get<any>(url);
  }
  
  deleteCourse(courseId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${courseId}`);
  }

  addCourse(course: { title: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, course);
  }
  
}
