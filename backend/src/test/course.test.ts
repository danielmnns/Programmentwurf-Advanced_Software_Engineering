import mongoose from "mongoose";
import request from "supertest";
import { Course as CourseType } from '../types/course';
const { app } = require("../main");

beforeAll(async () => {
  // Verbindung zur Datenbank herstellen
  await mongoose.connect(process.env.MONGO_URI!);
});

afterAll(async () => {
  // Datenbankverbindung schließen
  await mongoose.connection.close();
});

describe("Course Endpoints", () => {
  it("should get all courses", async () => {
    const res = await request(app).get("/api/courses");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it("should create a new course", async () => {
    const newCourse: CourseType = {
      id: '1',
      title: 'New Course',
      description: 'Course Description',
      duration: 10,
      instructorId: 'instructor1'
    };

    const res = await request(app).post("/api/courses").send(newCourse);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('title', 'New Course');
  });
});