export interface Course {
    id: string;
    title: string;
    description: string;
    duration: number; // duration in hours
    instructorId: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'instructor';
}