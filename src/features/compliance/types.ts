import type { Json } from "@/types/database.types";

export type ComplianceListItem = {
  id: string;
  credentialId: string | null;
  staffId: string | null;
  status: string;
  checkedAt: string;
  details: Json | null;
};

export type CreateComplianceInput = {
  credentialId?: string;
  staffId?: string;
  status: string;
  checkedAt?: string;
  details?: Json;
};
