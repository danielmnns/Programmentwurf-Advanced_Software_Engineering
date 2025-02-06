import mongoose from 'mongoose';
import request from 'supertest';
import { User as UserType } from '../types/user';
const { app } = require("../main");

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
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
      role: 'student',
      permissions: ['read', 'write'],
      profileImage: 'http://example.com/profile.jpg',
      settings: {
        language: 'en',
        theme: 'dark'
      }
    };

    const res = await request(app).post('/api/users').send(newUser);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('username', 'newuser');
  });

  it('should get all users', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });
});