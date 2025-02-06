export interface CourseDetail {
    id: string;
    courseName: string;
    textContent: string;
    assignmentContent: string;
    feedbackContent: string;
    participants: string[];
    documents: Document[];
    assignments: Document[];
    submissions: Document[];
  }
  
  export interface Document {
    name: string;
    url: string;
  }