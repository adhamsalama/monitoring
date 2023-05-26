import zod from "zod";

export const loginSchema = zod.object({
  email: zod.string().email(),
  password: zod.string().min(6),
});

export type LoginDto = zod.infer<typeof loginSchema>;
