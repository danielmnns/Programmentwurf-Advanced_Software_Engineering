import request from 'supertest';
import mongoose from 'mongoose';
import app from '../main';
import User from '../models/Users';

describe('Auth Controller', () => {
  beforeAll(async () => {
    // Verbindung zur Testdatenbank herstellen
    await mongoose.connect(process.env.MONGO_URI!, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    // Testdatenbank schließen
    await mongoose.connection.close();
  });

  afterEach(async () => {
    // Alle Benutzer nach jedem Test löschen
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const newUser = {
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'student',
        permissions: ['read'],
        settings: {
          language: 'en',
          theme: 'dark',
        },
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.user).toHaveProperty('username', 'testuser');
    });

    it('should not register a user with missing fields', async () => {
      const newUser = {
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Missing required fields');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login an existing user', async () => {
      const newUser = {
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'student',
        permissions: ['read'],
        settings: {
          language: 'en',
          theme: 'dark',
        },
      };

      // Benutzer registrieren
      await request(app).post('/api/auth/register').send(newUser);

      // Benutzer anmelden
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'password123' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body).toHaveProperty('token');
    });

    it('should not login a user with incorrect credentials', async () => {
      const newUser = {
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'student',
        permissions: ['read'],
        settings: {
          language: 'en',
          theme: 'dark',
        },
      };

      // Benutzer registrieren
      await request(app).post('/api/auth/register').send(newUser);

      // Benutzer mit falschen Anmeldedaten anmelden
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'wrongpassword' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });
  });
});