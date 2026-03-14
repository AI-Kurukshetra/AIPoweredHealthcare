import type { HealthcareRole } from "@/types/app.types";

export type StaffListItem = {
  userId: string;
  fullName: string | null;
  phone: string | null;
  role: HealthcareRole;
  status: "active" | "inactive";
};
