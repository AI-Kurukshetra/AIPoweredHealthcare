import type { HealthcareRole } from "@/types/app.types";

export type PatientListItem = {
  id: string;
  firstName: string;
  lastName: string;
  careStatus: "active" | "inactive" | "discharged";
};

export type PatientDetail = {
  id: string;
  firstName: string;
  lastName: string;
  careStatus: "active" | "inactive" | "discharged";
  phone: string | null;
  dobEncrypted: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PatientVisitItem = {
  id: string;
  status: string;
  assignedStaffId: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
};

export type PatientTimelineEvent = {
  id: string;
  type: "appointment" | "visit" | "note";
  title: string;
  detail: string;
  occurredAt: string;
  status: string | null;
  actorId: string | null;
};

export type PatientCareTeamMember = {
  userId: string;
  fullName: string | null;
  phone: string | null;
  role: HealthcareRole;
  status: "active" | "inactive";
  assignmentCount: number;
  upcomingAppointmentAt: string | null;
};

export type CreatePatientInput = {
  firstName: string;
  lastName: string;
  phone?: string | null;
  dobEncrypted?: string | null;
  careStatus?: "active" | "inactive" | "discharged";
};

export type UpdatePatientInput = {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  careStatus?: "active" | "inactive" | "discharged";
};
