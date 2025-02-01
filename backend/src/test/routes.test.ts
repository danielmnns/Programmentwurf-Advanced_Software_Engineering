import mongoose from 'mongoose';
import request from 'supertest';
const { app } = require("../main");
import { User as UserType } from '../types/user';
import { Enrollment as EnrollmentType } from '../types/enrollment';

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
    const newUser: UserType = {
      id: '1',
      name: 'New User',
      email: 'newuser@example.com',
      role: 'student'
    };

    const res = await request(app).post('/api/users').send(newUser);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('name', 'New User');
  });

  it('should get all users', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('should create a new enrollment', async () => {
    const newEnrollment: EnrollmentType = {
      id: '1',
      userId: '1',
      courseId: '1',
      enrolledAt: new Date()
    };

    const res = await request(app).post('/api/enrollment').send(newEnrollment);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('userId', '1');
  });

  it('should get all enrollments', async () => {
    const res = await request(app).get('/api/enrollment');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });
});