import { createCheckDTOSchema, CreateCheckDTO } from "./create-check";

// Since we are using PUT method to update a check, we can reuse the same schema
export const updateCheckDTOSchema = createCheckDTOSchema;
export type UpdateCheckDTO = CreateCheckDTO;
