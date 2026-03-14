import { ok } from "@/lib/api/responses";
import { privateCacheHeaders } from "@/lib/api/request";

import { env } from "@/config/env";

export async function GET() {
  return ok(
    { orgId: env.NEXT_PUBLIC_DEFAULT_ORG_ID },
    { headers: privateCacheHeaders(300, 600) }
  );
}
