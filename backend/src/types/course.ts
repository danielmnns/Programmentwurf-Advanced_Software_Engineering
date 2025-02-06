export interface Course {
    id: string;
    title: string;
    description: string;
    duration: number; // duration in hours
    instructorId: string;
    participants?: string[];
    documents?: Document[];
    assignments?: Document[];
    submissions?: Document[];
  }
  
  export interface Document {
    name: string;
    url: string;
  }