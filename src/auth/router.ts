import { Router } from "express";
import { loginSchema } from "./dto/login";
import { usersService } from "../users/service";
import jwt from "jsonwebtoken";
import { createUserDtoSchema } from "../users/dto/create-user";
import { NotificationsFactory } from "../notifications/factory";
import { NotificationChannel } from "../notifications/types";

const router = Router();
const notificationChannel = NotificationsFactory.create(
  NotificationChannel.Email
);

router.post("/login", async (req, res) => {
  const loginCredentials = loginSchema.safeParse(req.body);
  if (!loginCredentials.success) {
    return res.status(400).send(loginCredentials.error);
  }
  const user = await usersService.authenticate(
    loginCredentials.data.email,
    loginCredentials.data.password
  );
  if (!user) {
    return res.status(401).send("Invalid credentials");
  }
  const token = jwt.sign(user, process.env.JWT_SECRET!, {
    expiresIn: "24h",
  });
  return res.status(200).send({ token });
});

router.post("/register", async (req, res) => {
  const createUserDto = createUserDtoSchema.safeParse(req.body);
  if (!createUserDto.success) {
    return res.status(400).send(createUserDto.error);
  }
  const user = await usersService.create(createUserDto.data);
  const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET!, {
    expiresIn: "1h",
  });

  // await notificationChannel.send(
  //   user.email,
  //   `Your verification link is ${process.env.BASE_URL}/auth/verify?token=${token}`,
  //   "Verify your account"
  // );

  return res.status(201).send(user);
});

router.get("/verify", async (req, res) => {
  const token = req.query.token as string | null;
  if (!token) {
    return res.status(400).send("No token was provided");
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      email: string;
    };
    await usersService.verifyUser(payload.email);
    return res.status(200).send("User verified");
  } catch (err) {
    return res.status(400).send("Invalid token");
  }
});
export { router };
