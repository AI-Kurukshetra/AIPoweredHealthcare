import { z } from "zod";

export const createIncidentSchema = z.object({
  patientId: z.string().uuid().optional(),
  severity: z.enum(["1", "2", "3", "4", "5"]),
  title: z.string().min(3).max(140),
  description: z.string().min(10).max(4000),
  occurredAt: z.string().datetime(),
});

export type CreateIncidentSchema = z.infer<typeof createIncidentSchema>;
