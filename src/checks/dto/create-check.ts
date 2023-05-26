import zod from "zod";
import { Protocol } from "../types";

export const createCheckDTOSchema = zod.object({
  name: zod.string().min(3),
  url: zod.string().url(),
  protocol: zod.enum([Protocol.HTTP, Protocol.HTTPS, Protocol.tcp]),
  path: zod.string().optional(),
  port: zod.number().min(1).max(65535).optional(),
  webhook: zod.string().url().optional(),
  timeoutInSeconds: zod.number().min(5).max(60).optional(),
  intervalInSeconds: zod
    .number()
    .min(1)
    .max(60 * 10)
    .optional(),
  threshold: zod.number().min(1).max(10).optional(),
  authentication: zod
    .object({
      username: zod.string().min(1),
      password: zod.string().min(1),
    })
    .optional(),
  httpHeaders: zod
    .array(
      zod.object({
        key: zod.string().min(1),
        value: zod.string().min(1),
      })
    )
    .optional(),
  assert: zod
    .object({
      statusCode: zod.number().min(100).max(599),
    })
    .optional(),
  tags: zod.array(zod.string()).optional(),
});

export type CreateCheckDTO = zod.infer<typeof createCheckDTOSchema>;
