import { z } from "zod";

export const createCredentialSchema = z.object({
  staffId: z.string().uuid(),
  credentialType: z.string().min(2).max(100),
  credentialNumber: z.string().max(120).optional(),
  issuedAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime(),
  status: z.string().min(2).max(40).optional(),
});

export type CreateCredentialSchema = z.infer<typeof createCredentialSchema>;
