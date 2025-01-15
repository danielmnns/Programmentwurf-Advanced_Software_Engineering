class CourseService {
  private courses: { id: string; name: string; description: string }[] = [];

  fetchCourses() {
    return this.courses;
  }

  fetchCourseById(courseId: string) {
    return this.courses.find((course) => course.id === courseId);
  }

  addCourse(course: any) {
    this.courses.push(course);
  }

  modifyCourse(courseId: string, updatedCourse: any) {
    const index = this.courses.findIndex((course) => course.id === courseId);
    if (index !== -1) {
      this.courses[index] = { ...this.courses[index], ...updatedCourse };
    }
  }
}

export default CourseService;
