import mongoose from "mongoose";
import request from "supertest";
import { Material as MaterialType } from '../types/material';
const { app } = require("../main");

beforeAll(async () => {
  // Verbindung zur Datenbank herstellen
  await mongoose.connect(process.env.MONGO_URI!);
});

afterAll(async () => {
  // Datenbankverbindung schließen
  await mongoose.connection.close();
});

describe("Material Endpoints", () => {
  it("should get all materials", async () => {
    const res = await request(app).get("/api/materials");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it("should upload a new material", async () => {
    const newMaterial: MaterialType = {
      id: '1',
      title: 'New Material',
      content: 'Material Content',
      courseId: 'course1'
    };

    const res = await request(app).post("/api/materials").send(newMaterial);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('title', 'New Material');
  });
});