export interface Task {
    id: string;
    title: string;
    description: string;
    dueDate: Date;
    courseId: string;
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  export interface Submission {
    id: string;
    taskId: string;
    userId: string;
    content: string;
    submittedAt: Date;
    studentId: string;
  }