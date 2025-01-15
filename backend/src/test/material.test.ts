import mongoose from "mongoose";
import request from "supertest";
import { app } from "../main"; // Benannter Export verwenden

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
    const res = await request(app).post("/api/materials").send({
      title: "New Material",
      content: "Material Content",
    });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("title", "New Material");
  });
});
