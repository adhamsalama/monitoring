import supertest from "supertest";
import { app } from "../../app";
import { usersService } from "../../users/service";

describe("e2e", () => {
  it("should register a user", async () => {
    const data = {
      email: "asdas@adasdasd.cad",
      password: "asdasdasd",
      name: "asd qwe",
    };
    const response = await supertest(app)
      .post("/auth/register")
      .send(data)
      .expect(201);
    expect(response.body.email).toEqual(data.email);
    expect(response.body.name).toEqual(data.name);
    expect(response.body.password).toBeUndefined();
    expect(response.body.verified).toEqual(false);
  });

  it("should login a user", async () => {
    const user = await usersService.create({
      email: "qweq@asda.asd",
      password: "asdasdasd",
      name: "asd qwe",
    });
    await supertest(app)
      .post("/auth/login")
      .send({ email: user.email, password: "asdasdasd" })
      .expect(200);
  });
});
