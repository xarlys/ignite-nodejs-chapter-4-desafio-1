import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database/index";

let connection: Connection;

describe("Create User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to post user and return 201", async () => {
    const response = await request(app).post("/api/v1/users/").send({
      name: "User Test",
      email: "test@email.com",
      password: "admin",
    });
    expect(response.status).toBe(201);
  });
  it("should not be able to post an existing user", async () => {
    await request(app).post("/api/v1/users/").send({
      name: "User1 Test",
      email: "test1@email.com",
      password: "admin",
    });
    const response = await request(app).post("/api/v1/users/").send({
      name: "User1 Test",
      email: "test1@email.com",
      password: "admin",
    });
    expect(response.status).toBe(400);
  });
});
