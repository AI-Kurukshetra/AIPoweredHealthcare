import { z } from "zod";

/** Accepts any 8-4-4-4-12 hex UUID (e.g. seed IDs like 20000000-0000-0000-0000-000000000003). */
const uuidLike = z.string().regex(
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  "Invalid UUID"
);

export const createScheduleSchema = z
  .object({
    patientId: uuidLike,
    assignedStaffId: uuidLike.optional(),
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
    assignedStaffId: uuidLike.nullable().optional(),
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
