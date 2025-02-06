import mongoose from "mongoose";
import request from "supertest";
import Task from '../models/Tasks';
import User from '../models/Users';
import { Submission as SubmissionType, Task as TaskType } from '../types/task';
const { app } = require("../main");

beforeAll(async () => {
  // Verbindung zur Datenbank herstellen
  await mongoose.connect(process.env.MONGO_URI!);
});

afterAll(async () => {
  // Datenbankverbindung schließen
  await mongoose.connection.close();
});

describe("Task Endpoints", () => {
  it("should get all tasks", async () => {
    const res = await request(app).get("/api/tasks");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it("should create a new task", async () => {
    const newTask: TaskType = {
      id: '1',
      title: 'New Task',
      description: 'Task Description',
      dueDate: new Date(),
      courseId: 'course1'
    };

    const res = await request(app).post("/api/tasks").send(newTask);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('title', 'New Task');
  });

  it("should submit a task", async () => {
    const task = await Task.create({
      title: "Submit Task",
      description: "Submit Description",
      dueDate: new Date(),
      courseId: "course1"
    });

    const user = await User.create({
      username: "student",
      password: "password",
    }) as mongoose.Document & { _id: string };

    const submission: SubmissionType = {
      id: '1',
      taskId: task._id.toString(),
      userId: user._id.toString(),
      content: "Task Submission Content",
      submittedAt: new Date(),
      studentId: user._id.toString()
    };

    const res = await request(app).post(`/api/tasks/${task._id}/submit`).send(submission);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("content", "Task Submission Content");
  });
});