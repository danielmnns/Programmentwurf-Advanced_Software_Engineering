import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';
import User from '../models/User';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI!, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('User Endpoints', () => {
  it('should get all users', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('should create a new user', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({
        username: 'newuser',
        password: 'newpassword'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('username', 'newuser');
  });

  it('should update an existing user', async () => {
    const user = await User.create({ username: 'updateuser', password: 'updatepassword' });
    const res = await request(app)
      .put(`/api/users/${user._id}`)
      .send({
        username: 'updateduser',
        password: 'updatedpassword'
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('username', 'updateduser');
  });

  it('should delete an existing user', async () => {
    const user = await User.create({ username: 'deleteuser', password: 'deletepassword' });
    const res = await request(app).delete(`/api/users/${user._id}`);
    expect(res.statusCode).toEqual(204);
  });
});