import { z } from "zod";

export const createChannelSchema = z.object({
  name: z.string().min(2).max(120),
  channelType: z.enum(["team", "patient"]).optional(),
  patientId: z.string().uuid().optional(),
});

export const createMessageSchema = z.object({
  body: z.string().min(1).max(4000),
  escalationFlag: z.boolean().optional(),
});

export type CreateChannelSchema = z.infer<typeof createChannelSchema>;
export type CreateMessageSchema = z.infer<typeof createMessageSchema>;
