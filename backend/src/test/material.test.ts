import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';
import Material from '../models/Material';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI!, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Material Endpoints', () => {
  it('should get all materials', async () => {
    const res = await request(app).get('/api/materials');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('should upload a new material', async () => {
    const res = await request(app)
      .post('/api/materials')
      .send({
        title: 'New Material',
        content: 'Material Content'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('title', 'New Material');
  });
});