import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_DEFAULT_ORG_ID: z
    .string()
    .uuid()
    .default("00000000-0000-0000-0000-000000000001"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_DEFAULT_ORG_ID: process.env.NEXT_PUBLIC_DEFAULT_ORG_ID,
  NODE_ENV: process.env.NODE_ENV,
});

if (!parsed.success) {
  const { fieldErrors } = parsed.error.flatten();
  throw new Error(
    `Invalid environment configuration: ${JSON.stringify(fieldErrors)}`
  );
}

export const env = parsed.data;
