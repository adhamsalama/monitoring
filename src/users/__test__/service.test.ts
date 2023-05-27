import { UserModel } from "../models/user";
import { usersService } from "../service";

describe("tests creating users", () => {
  it("should create user successfully", async () => {
    const userData = {
      email: "test@test.test",
      password: "123456",
      name: "test",
    };
    const user = await usersService.create(userData);
    expect(user).toBeDefined();
    expect(user.email).toEqual(userData.email);
    expect(user.name).toEqual(userData.name);
    expect(user.verified).toEqual(false);
    const userInDB = await UserModel.findById(user._id);
    expect(userInDB).toBeDefined();
    expect(userInDB!.email).toEqual(userData.email);
    expect(userInDB!.name).toEqual(userData.name);
    expect(userInDB!.verified).toEqual(false);
    expect(userInDB!.password).not.toEqual(userData.password);
  });

  it("should throw error if user already exists", async () => {
    const userData = {
      email: "test2@test.com",
      name: "test",
      password: "123456",
    };
    await usersService.create(userData);
    await expect(usersService.create(userData)).rejects.toThrowError(
      "User already exists"
    );
  });

  it("should fine user by email", async () => {
    const userData = {
      email: "test3@test.com",
      name: "test",
      password: "123456",
    };
    await usersService.create(userData);
    const user = await usersService.findByEmail(userData.email);
    expect(user).toBeDefined();
    expect(user!.email).toEqual(userData.email);
    expect(user!.name).toEqual(userData.name);
    expect(user!.verified).toEqual(false);
  });

  it("should verifyUser", async () => {
    const userData = {
      email: "test4@test.test",
      name: "test",
      password: "123456",
    };
    const user = await usersService.create(userData);
    await usersService.verifyUser(user.email);
    const userInDB = await UserModel.findById(user._id);
    expect(userInDB).toBeDefined();
    expect(userInDB!.verified).toEqual(true);
  });

  it("should authenticate user", async () => {
    const userData = {
      email: "test5@test.test",
      name: "test",
      password: "password",
    };
    const user = await usersService.create(userData);
    const authenticatedUser = await usersService.authenticate(
      user.email,
      userData.password
    );
    expect(authenticatedUser).toBeDefined();
    expect(authenticatedUser!.email).toEqual(userData.email);
    expect(authenticatedUser!.name).toEqual(userData.name);
  });
});
