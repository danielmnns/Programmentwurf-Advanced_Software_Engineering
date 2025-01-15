import mongoose from "mongoose";
import request from "supertest";
import { app } from "../main";
import Task from "../models/Tasks";
import User from "../models/Users";

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI!, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as mongoose.ConnectOptions);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Task Endpoints", () => {
  it("should get all tasks", async () => {
    const res = await request(app).get("/api/tasks");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it("should create a new task", async () => {
    const res = await request(app).post("/api/tasks").send({
      title: "New Task",
      description: "Task Description",
      dueDate: new Date(),
    });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("title", "New Task");
  });

  it("should submit a task", async () => {
    const task: mongoose.Document = await Task.create({
      title: "Submit Task",
      description: "Submit Description",
      dueDate: new Date(),
    });

    const user = await User.create({
      username: "student",
      password: "password",
    });

    const res = await request(app).post(`/api/tasks/${task._id}/submit`).send({
      studentId: user._id,
      content: "Task Submission Content",
    });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("content", "Task Submission Content");
  });
});
