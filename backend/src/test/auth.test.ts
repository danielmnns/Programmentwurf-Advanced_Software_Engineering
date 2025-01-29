import mongoose from "mongoose";
import request from "supertest";
const { app } = require("../main"); // Benannter Export verwenden; // Benannter Export verwenden; // Benannter Export verwenden

beforeAll(async () => {
  // Verbindung zur Datenbank herstellen
  await mongoose.connect(process.env.MONGO_URI!);
});

afterAll(async () => {
  // Datenbankverbindung schließen
  await mongoose.connection.close();
});

describe("Auth Endpoints", () => {
  it("should register a new user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "testuser",
      password: "testpassword",
    });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("username", "testuser");
  });

  it("should login an existing user", async () => {
    const res = await request(app).post("/api/auth/login").send({
      username: "testuser",
      password: "testpassword",
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("token");
  });
});
