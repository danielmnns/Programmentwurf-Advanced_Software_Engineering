import mongoose from "mongoose";
import request from "supertest";
import { app } from "../main"; // Benannter Export verwenden
import Course from "../models/Course";

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
    const res = await request(app).post("/api/courses").send({
      name: "New Course",
      description: "Course Description",
    });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("name", "New Course");
  });

  it("should update an existing course", async () => {
    const course = await Course.create({
      name: "Update Course",
      description: "Update Description",
    });
    const res = await request(app).put(`/api/courses/${course._id}`).send({
      name: "Updated Course",
      description: "Updated Description",
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("name", "Updated Course");
  });

  it("should delete an existing course", async () => {
    const course = await Course.create({
      name: "Delete Course",
      description: "Delete Description",
    });
    const res = await request(app).delete(`/api/courses/${course._id}`);
    expect(res.statusCode).toEqual(204);
  });
});
