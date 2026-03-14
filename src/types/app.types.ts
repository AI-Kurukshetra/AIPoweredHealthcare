export type HealthcareRole =
  | "super_admin"
  | "org_admin"
  | "care_coordinator"
  | "field_nurse"
  | "billing_staff"
  | "patient";

export type ActionResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };
