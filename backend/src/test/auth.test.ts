import request from 'supertest';
const { app } = require("../main");
import { AuthRequest } from '../types/auth';

describe('Auth Endpoints', () => {
  it('should register a new user', async () => {
    const newUser: AuthRequest = {
      username: 'testuser',
      password: 'testpassword'
    };

    const res = await request(app).post('/api/auth/register').send(newUser);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'User registered');
  });

  it('should login an existing user', async () => {
    const loginUser: AuthRequest = {
      username: 'testuser',
      password: 'testpassword'
    };

    const res = await request(app).post('/api/auth/login').send(loginUser);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Login erfolgreich');
  });
});