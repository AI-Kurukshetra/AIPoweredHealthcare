import { z } from "zod";

export const createScheduleSchema = z
  .object({
    patientId: z.string().uuid(),
    assignedStaffId: z.string().uuid().optional(),
    startsAt: z.string().datetime(),
    endsAt: z.string().datetime(),
    status: z.enum(["scheduled", "confirmed", "completed", "cancelled"]).optional(),
  })
  .refine((value) => new Date(value.endsAt) > new Date(value.startsAt), {
    message: "End time must be after start time.",
    path: ["endsAt"],
  });

export type CreateScheduleSchema = z.infer<typeof createScheduleSchema>;
