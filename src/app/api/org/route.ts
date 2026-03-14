import { ok } from "@/lib/api/responses";

import { env } from "@/config/env";

export async function GET() {
  return ok({ orgId: env.NEXT_PUBLIC_DEFAULT_ORG_ID });
}
