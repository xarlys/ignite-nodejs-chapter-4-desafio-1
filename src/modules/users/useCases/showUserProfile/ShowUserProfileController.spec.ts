import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidv4 } from "uuid";

import { app } from "../../../../app";
import createConnection from "../../../../database/index";

let connection: Connection;

describe("Authenticate User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to receive a token and return user - 200", async () => {
    await request(app).post("/api/v1/users/").send({
      name: "User Test",
      email: "test@email.com",
      password: "admin",
    });

    const responseToken = await request(app).post("/api/v1/sessions/").send({
      email: "test@email.com",
      password: "admin",
    });

    const { token, user } = responseToken.body;
    const { id } = user;

    const response = await request(app)
      .get("/api/v1/profile")
      .send({ id })
      .set({ Authorization: `Bearer ${token}` });

    expect(response.status).toBe(200);
  });

  it("should not be able to receive a token and return nonexistent user - 401", async () => {
    await request(app).post("/api/v1/users/").send({
      name: "User Test",
      email: "test@email.com",
      password: "admin",
    });

    const responseToken = await request(app).post("/api/v1/sessions/").send({
      email: "test@email.com",
      password: "admin",
    });

    const { token, user } = responseToken.body;
    const { id } = user;

    const invalidToken = uuidv4();

    const response = await request(app)
      .get("/api/v1/profile")
      .send({ id })
      .set({ Authorization: `Bearer ${invalidToken}` });

    expect(response.status).toBe(401);
  });
});
