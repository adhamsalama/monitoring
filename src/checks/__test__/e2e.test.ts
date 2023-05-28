import supertest from "supertest";
import { app } from "../../app";
import { usersService } from "../../users/service";
import { generateAccessToken } from "../../auth/utils";
import { checksService } from "../service";
import { Protocol } from "../types";
import { CheckModel } from "../models/check";

describe("e2e", () => {
  it("should failed to create a check because token wasnt provided", async () => {
    const data = {
      name: "Google",
      url: "https://www.google.com",
      intervalInSeconds: 60,
    };
    await supertest(app).post("/checks").send(data).expect(401);
  });

  it("should create a check", async () => {
    const user = await usersService.create({
      email: "aqw@asd.sda",
      password: "asdasdasd",
      name: "asd qwe",
    });
    const token = generateAccessToken(user);
    const data = {
      name: "Google",
      url: "https://www.google.com",
      protocol: "https",
      intervalInSeconds: 60,
    };
    const response = await supertest(app)
      .post("/checks")
      .set("Authorization", `Bearer ${token}`)
      .send(data);
  });

  it("should get all checks", async () => {
    const user = await usersService.create({
      email: "asd@adqwq.asda",
      password: "asdasdasd",
      name: "asd qwe",
    });
    const token = generateAccessToken(user);
    const data = {
      name: "Google",
      url: "https://www.google.com",
      protocol: Protocol.HTTPS,
      intervalInSeconds: 60,
    };
    const data2 = {
      name: "Facebook",
      url: "https://www.facebook.com",
      protocol: Protocol.HTTPS,
      intervalInSeconds: 10,
    };

    const check1 = await checksService.create(String(user._id), data);
    const check2 = await checksService.create(String(user._id), data2);

    const response = await supertest(app)
      .get("/checks")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[1]).toMatchObject({
      _id: String(check1._id),
      name: check1.name,
      url: check1.url,
      protocol: check1.protocol,
      intervalInSeconds: check1.intervalInSeconds,
    });
    expect(response.body[0]).toMatchObject({
      _id: String(check2._id),
      name: check2.name,
      url: check2.url,
      protocol: check2.protocol,
      intervalInSeconds: check2.intervalInSeconds,
    });
  });

  it("should get a check", async () => {
    const user = await usersService.create({
      email: "asd@adqwq.asda",
      password: "asdasdasd",
      name: "asd qwe",
    });
    const token = generateAccessToken(user);
    const data = {
      name: "Google",
      url: "https://www.google.com",
      protocol: Protocol.HTTPS,
      intervalInSeconds: 60,
    };

    const check1 = await checksService.create(String(user._id), data);

    const response = await supertest(app)
      .get(`/checks/${check1._id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    expect(response.body).toMatchObject({
      _id: String(check1._id),
      name: check1.name,
      url: check1.url,
      protocol: check1.protocol,
      intervalInSeconds: check1.intervalInSeconds,
    });
  });

  it("should update a check", async () => {
    const user = await usersService.create({
      email: "asd@adqwq.asda",
      password: "asdasdasd",
      name: "asd qwe",
    });
    const token = generateAccessToken(user);
    const data = {
      name: "Google",
      url: "https://www.google.com",
      protocol: Protocol.HTTPS,
      intervalInSeconds: 60,
    };

    const check1 = await checksService.create(String(user._id), data);
    const newData = {
      name: "Facebook",
      url: "https://www.facebook.com",
      protocol: Protocol.HTTPS,
      intervalInSeconds: 10,
    };

    const response = await supertest(app)
      .put(`/checks/${check1._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(newData)
      .expect(200);
    expect(response.body).toMatchObject({
      _id: String(check1._id),
      name: newData.name,
      url: newData.url,
      protocol: newData.protocol,
      intervalInSeconds: newData.intervalInSeconds,
    });
  });

  it("should delete a check", async () => {
    const user = await usersService.create({
      email: "asd@adqwq.asda",
      password: "asdasdasd",
      name: "asd qwe",
    });
    const token = generateAccessToken(user);
    const data = {
      name: "Google",
      url: "https://www.google.com",
      protocol: Protocol.HTTPS,
      intervalInSeconds: 60,
    };

    const check1 = await checksService.create(String(user._id), data);

    await supertest(app)
      .delete(`/checks/${check1._id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(204);
    const checkInDB = await CheckModel.findById(check1._id);
    expect(checkInDB).toBeNull();
  });

  it("should failed to get a check because check doesnt exist", async () => {
    const user = await usersService.create({
      email: "asd@adqwq.asda",
      password: "asdasdasd",
      name: "asd qwe",
    });
    const token = generateAccessToken(user);
    await supertest(app)
      .get(`/checks/123123123123123123123123`)
      .set("Authorization", `Bearer ${token}`)
      .expect(404);
  });

  it("should fail to get a check because check doesnt belong to user", async () => {
    const user = await usersService.create({
      email: "asd@adqwq.asda",
      password: "asdasdasd",
      name: "asd qwe",
    });
    const token = generateAccessToken(user);
    const data = {
      name: "Google",
      url: "https://www.google.com",
      protocol: Protocol.HTTPS,
      intervalInSeconds: 60,
    };

    const check1 = await checksService.create("SomeOtherId", data);

    await supertest(app)
      .get(`/checks/${check1._id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(404);
  });

  it("should fail to update a check because it doesn't belong to user", async () => {
    const user = await usersService.create({
      email: "asd@adqwq.asda",
      password: "asdasdasd",
      name: "asd qwe",
    });
    const token = generateAccessToken(user);
    const data = {
      name: "Google",
      url: "https://www.google.com",
      protocol: Protocol.HTTPS,
      intervalInSeconds: 60,
    };

    const check1 = await checksService.create("SomeOtherId", data);

    const newData = {
      name: "Facebook",
      url: "https://www.facebook.com",
      protocol: Protocol.HTTPS,
      intervalInSeconds: 10,
    };

    await supertest(app)
      .put(`/checks/${check1._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(newData)
      .expect(404);
  });

  it("should fail to delete a check because it doesn't belong to user", async () => {
    const user = await usersService.create({
      email: "asd@adqwq.asda",
      password: "asdasdasd",
      name: "asd qwe",
    });
    const token = generateAccessToken(user);
    const data = {
      name: "Google",
      url: "https://www.google.com",
      protocol: Protocol.HTTPS,
      intervalInSeconds: 60,
    };

    const check1 = await checksService.create("SomeOtherId", data);

    await supertest(app)
      .delete(`/checks/${check1._id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(404);
  });

  it("should fail to create a check because of invalid data", async () => {
    const user = await usersService.create({
      email: "asd@adqwq.asda",
      password: "asdasdasd",
      name: "asd qwe",
    });
    const token = generateAccessToken(user);
    const data = {};

    await supertest(app)
      .post(`/checks`)
      .set("Authorization", `Bearer ${token}`)
      .send(data)
      .expect(400);

    const data2 = {
      name: "Google",
      url: "https://www.google.com",
      protocol: "INVALID_PROTOCOL",
      intervalInSeconds: 60,
    };

    await supertest(app)
      .post(`/checks`)
      .set("Authorization", `Bearer ${token}`)
      .send(data2)
      .expect(400);

    const data3 = {
      name: "Google",
      url: "https://www.google.com",
      protocol: Protocol.HTTPS,
      intervalInSeconds: 0,
    };

    await supertest(app)
      .post(`/checks`)
      .set("Authorization", `Bearer ${token}`)
      .send(data3)
      .expect(400);
  });
});
