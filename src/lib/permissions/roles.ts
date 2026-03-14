import type { HealthcareRole } from "@/types/app.types";

const roleWeight: Record<HealthcareRole, number> = {
  patient: 10,
  billing_staff: 20,
  field_nurse: 30,
  care_coordinator: 40,
  org_admin: 50,
  super_admin: 60,
};

export function isAtLeastRole(
  currentRole: HealthcareRole,
  minimumRole: HealthcareRole
) {
  return roleWeight[currentRole] >= roleWeight[minimumRole];
}
