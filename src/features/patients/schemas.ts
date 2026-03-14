import { z } from "zod";

export const createPatientSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().max(30).optional(),
  dobEncrypted: z.string().max(1000).optional(),
});

export type CreatePatientSchema = z.infer<typeof createPatientSchema>;
