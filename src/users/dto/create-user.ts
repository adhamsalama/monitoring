import zod from "zod";

export const createUserDtoSchema = zod.object({
  email: zod.string().email(),
  password: zod.string().min(6),
  name: zod.string().min(3),
});

export type CreateUserDto = zod.infer<typeof createUserDtoSchema>;
