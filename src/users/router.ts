import { Router } from "express";
import { CreateUserDto, createUserDtoSchema } from "./dto/create-user";
import { usersService } from "./service";
import { currentUser } from "../auth/middleware";

export const router = Router();

router.post("/", async (req, res) => {
  const createUserDto = createUserDtoSchema.safeParse(req.body);
  if (!createUserDto.success) {
    return res.status(400).send(createUserDto.error);
  }
  const user = await usersService.create(createUserDto.data);
  return res.status(201).send(user);
});
