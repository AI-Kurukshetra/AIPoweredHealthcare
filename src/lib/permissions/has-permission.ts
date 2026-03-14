import type { HealthcareRole } from "@/types/app.types";

type Resource =
  | "patients"
  | "visits"
  | "schedules"
  | "staff"
  | "credentials"
  | "compliance"
  | "communications"
  | "billing";
type Action = "read" | "create" | "update" | "delete";

const permissions: Record<HealthcareRole, Partial<Record<Resource, Action[]>>> = {
  super_admin: {
    patients: ["read", "create", "update", "delete"],
    visits: ["read", "create", "update", "delete"],
    schedules: ["read", "create", "update", "delete"],
    staff: ["read", "create", "update", "delete"],
    credentials: ["read", "create", "update", "delete"],
    compliance: ["read", "create", "update", "delete"],
    communications: ["read", "create", "update", "delete"],
    billing: ["read", "create", "update", "delete"],
  },
  org_admin: {
    patients: ["read", "create", "update", "delete"],
    visits: ["read", "create", "update", "delete"],
    schedules: ["read", "create", "update", "delete"],
    staff: ["read", "create", "update", "delete"],
    credentials: ["read", "create", "update", "delete"],
    compliance: ["read", "create", "update", "delete"],
    communications: ["read", "create", "update", "delete"],
    billing: ["read", "create", "update", "delete"],
  },
  care_coordinator: {
    patients: ["read", "create", "update"],
    visits: ["read", "create", "update"],
    schedules: ["read", "create", "update"],
    staff: ["read"],
    credentials: ["read"],
    compliance: ["read"],
    communications: ["read", "create", "update"],
    billing: ["read"],
  },
  field_nurse: {
    patients: ["read"],
    visits: ["read", "create", "update"],
    schedules: ["read"],
    communications: ["read", "create"],
  },
  billing_staff: {
    staff: ["read"],
    billing: ["read", "create", "update"],
  },
  patient: {
    patients: ["read"],
    communications: ["read"],
  },
};

export function hasPermission(
  role: HealthcareRole,
  resource: Resource,
  action: Action
) {
  return permissions[role][resource]?.includes(action) ?? false;
}
