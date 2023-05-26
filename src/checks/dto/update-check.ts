import zod from "zod";
import { Protocol } from "../types";
import { create } from "domain";
import { createCheckDTOSchema, CreateCheckDTO } from "./create-check";

const updateCheckDTOSchema = createCheckDTOSchema;
export type UpdateCheckDTO = CreateCheckDTO;
// export const updateCheckDTOSchema = zod.object({
//   name: zod.string().min(3).optional(),
//   url: zod.string().url().optional(),
//   protocol: zod.enum([Protocol.HTTP, Protocol.HTTPS, Protocol.tcp]).optional(),
//   path: zod.string().optional(),
//   port: zod.number().min(1).max(65535).optional(),
//   webhook: zod.string().url().optional(),
//   timeoutInSeconds: zod.number().min(1).max(60).optional(),
//   intervalInSeconds: zod

//     .number()
//     .min(1)
//     .max(60 * 60)
//     .optional(),
//   threshold: zod.number().min(1).max(10).optional(),
//   authentication: zod
//     .object({
//       username: zod.string().min(1),
//       password: zod.string().min(1),
//     })
//     .optional(),
//   httpHeaders: zod
//     .array(
//       zod.object({
//         key: zod.string().min(1),
//         value: zod.string().min(1),
//       })
//     )
//     .optional(),
//   assert: zod

//     .object({
//       statusCode: zod.number().min(100).max(599),
//     })
//     .optional(),
//   tags: zod.array(zod.string()).optional(),
// });

// export type UpdateCheckDTO = zod.infer<typeof updateCheckDTOSchema>;
