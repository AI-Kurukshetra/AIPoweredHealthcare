import type { HealthcareRole } from "@/types/app.types";

export type StaffListItem = {
  userId: string;
  fullName: string | null;
  phone: string | null;
  role: HealthcareRole;
  status: "active" | "inactive";
};

export type StaffProfile = {
  userId: string;
  fullName: string | null;
  phone: string | null;
  role: HealthcareRole;
  status: "active" | "inactive";
  createdAt: string;
};

export type StaffWorkloadSummary = {
  upcomingAppointments: number;
  completedVisits: number;
  activeVisits: number;
  nextAppointmentAt: string | null;
};
