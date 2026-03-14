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

export const updateScheduleSchema = z
  .object({
    assignedStaffId: z.string().uuid().nullable().optional(),
    startsAt: z.string().datetime().optional(),
    endsAt: z.string().datetime().optional(),
    status: z.enum(["scheduled", "confirmed", "completed", "cancelled"]).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required.",
  })
  .refine(
    (value) =>
      !(value.startsAt && value.endsAt) ||
      new Date(value.endsAt) > new Date(value.startsAt),
    {
      message: "End time must be after start time.",
      path: ["endsAt"],
    }
  );

export type CreateScheduleSchema = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleSchema = z.infer<typeof updateScheduleSchema>;
