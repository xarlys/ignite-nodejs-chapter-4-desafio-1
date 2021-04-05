import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidv4 } from "uuid";

import { app } from "../../../../app";
import createConnection from "../../../../database/index";

let connection: Connection;

describe("Statements Deposit", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to receive a token, amount and description and deposit - 201", async () => {
    await request(app).post("/api/v1/users/").send({
      name: "User1",
      email: "test1@email.com",
      password: "admin1",
    });

    const responseToken = await request(app).post("/api/v1/sessions/").send({
      email: "test1@email.com",
      password: "admin1",
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({ amount: 100, description: "deposit" })
      .set({ Authorization: `Bearer ${token}` });

    expect(response.status).toBe(201);
  });

  it("should be able to receive a token, amount and description and withdraw - 201", async () => {
    await request(app).post("/api/v1/users/").send({
      name: "User2",
      email: "test2@email.com",
      password: "admin2",
    });

    const responseToken = await request(app).post("/api/v1/sessions/").send({
      email: "test2@email.com",
      password: "admin2",
    });

    const { token } = responseToken.body;

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({ amount: 100, description: "deposit" })
      .set({ Authorization: `Bearer ${token}` });

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({ amount: 50, description: "withdraw" })
      .set({ Authorization: `Bearer ${token}` });

    const { amount } = response.body;

    expect(amount).toEqual(50);
    expect(response.status).toBe(201);
  });
  it("should be able to receive a token and get balance - 200", async () => {
    await request(app).post("/api/v1/users/").send({
      name: "User3",
      email: "test3@email.com",
      password: "admin",
    });

    const responseToken = await request(app).post("/api/v1/sessions/").send({
      email: "test3@email.com",
      password: "admin",
    });

    const { token, user } = responseToken.body;

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({ amount: 100, description: "deposit" })
      .set({ Authorization: `Bearer ${token}` });

    await request(app)
      .post("/api/v1/statements/withdraw")
      .send({ amount: 50, description: "withdraw" })
      .set({ Authorization: `Bearer ${token}` });

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({ Authorization: `Bearer ${token}` });

    expect(response.status).toBe(200);
  });

  it("should be able to receive a token, a statement id and return the statement - 200", async () => {
    await request(app).post("/api/v1/users/").send({
      name: "User4",
      email: "test4@email.com",
      password: "admin",
    });

    const responseToken = await request(app).post("/api/v1/sessions/").send({
      email: "test4@email.com",
      password: "admin",
    });

    const { token } = responseToken.body;

    const responseStatement = await request(app)
      .post("/api/v1/statements/deposit")
      .send({ amount: 100, description: "deposit" })
      .set({ Authorization: `Bearer ${token}` });

    const { id, user_id } = responseStatement.body;

    const url = `/api/v1/statements/${id}`;

    const response = await request(app)
      .get(url)
      .set({ Authorization: `Bearer ${token}` });

    expect(response.status).toBe(200);
  });
});
