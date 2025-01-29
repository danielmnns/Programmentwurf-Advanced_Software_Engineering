import mongoose from 'mongoose';
import request from 'supertest';
const { app } = require("../main"); // Benannter Export verwenden;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI!, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as mongoose.ConnectOptions);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('API Routes', () => {
  it('should create a new user', async () => {
    const res = await request(app).post('/api/users').send({
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
      role: 'user',
      permissions: ['read', 'write'],
      profileImage: 'https://example.com/images/newuser.png',
      settings: {
        language: 'de',
        theme: 'dark',
      },
    });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('username', 'newuser');
  });

  it('should get all users', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('should create a new course detail', async () => {
    const res = await request(app).post('/api/courseDetail/user-kurs').send({
      courseName: 'Advanced TypeScript',
      textContent: 'This is the text content for the Advanced TypeScript course.',
      aufgabeContent: 'This is the assignment content for the Advanced TypeScript course.',
      feedbackContent: 'This is the feedback content for the Advanced TypeScript course.',
      participants: ['participant1@example.com', 'participant2@example.com'],
      documents: [
        {
          name: 'Course Syllabus',
          url: 'https://example.com/syllabus.pdf',
        },
        {
          name: 'Lecture Notes',
          url: 'https://example.com/lecture-notes.pdf',
        },
      ],
      aufgaben: [
        {
          name: 'Assignment 1',
          url: 'https://example.com/assignment1.pdf',
        },
        {
          name: 'Assignment 2',
          url: 'https://example.com/assignment2.pdf',
        },
      ],
      abgaben: [
        {
          name: 'Submission 1',
          url: 'https://example.com/submission1.pdf',
        },
        {
          name: 'Submission 2',
          url: 'https://example.com/submission2.pdf',
        },
      ],
    });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('courseName', 'Advanced TypeScript');
  });

  it('should get all course details', async () => {
    const res = await request(app).get('/api/courseDetail/user-kurs');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('should create a new enrollment', async () => {
    const res = await request(app).post('/api/enrollment').send({
      username: 'Hannes Baum',
      courseName: 'Fortgeschrittenes TypeScript',
      enrolled: true,
      message: 'Benutzer Compilerbaum wurde erfolgreich im Kurs Angular Grundlagen eingeschrieben.',
    });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('username', 'Hannes Baum');
  });

  it('should get all enrollments', async () => {
    const res = await request(app).get('/api/enrollment');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });
});