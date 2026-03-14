import { z } from "zod";

export const createBillingRecordSchema = z.object({
  visitId: z.string().uuid().optional(),
  patientId: z.string().uuid().optional(),
  cptCode: z.string().min(3).max(10),
  icd10Code: z.string().min(1).max(10).optional(),
  units: z.number().positive().max(24).optional(),
  amountCents: z.number().int().positive(),
  status: z.enum(["pending", "submitted", "paid", "denied"]).optional(),
});

export type CreateBillingRecordSchema = z.infer<typeof createBillingRecordSchema>;
