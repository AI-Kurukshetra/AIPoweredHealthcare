import { z } from "zod";

const vitalsSchema = z
  .object({
    systolic: z.string().max(10).optional(),
    diastolic: z.string().max(10).optional(),
    pulse: z.string().max(10).optional(),
    temperature: z.string().max(10).optional(),
    spo2: z.string().max(10).optional(),
  })
  .strict();

export const createVisitSchema = z.object({
  patientId: z.string().uuid(),
  appointmentId: z.string().uuid().optional(),
  assignedStaffId: z.string().uuid().optional(),
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  status: z.enum(["scheduled", "in_progress", "completed", "cancelled"]).optional(),
  note: z.string().min(1).max(4000).optional(),
  vitals: vitalsSchema.optional(),
});

export type CreateVisitSchema = z.infer<typeof createVisitSchema>;
