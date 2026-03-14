import { z } from "zod";
import type { Json } from "@/types/database.types";

export const createComplianceSchema = z.object({
  credentialId: z.string().uuid().optional(),
  staffId: z.string().uuid().optional(),
  status: z.string().min(2).max(80),
  checkedAt: z.string().datetime().optional(),
  details: z.custom<Json>().optional(),
});

export type CreateComplianceSchema = z.infer<typeof createComplianceSchema>;
