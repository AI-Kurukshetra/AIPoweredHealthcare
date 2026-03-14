export type ScheduleListItem = {
  id: string;
  patientId: string;
  assignedStaffId: string | null;
  status: string;
  startsAt: string;
  endsAt: string;
  createdAt: string;
};

export type CreateScheduleInput = {
  patientId: string;
  assignedStaffId?: string;
  startsAt: string;
  endsAt: string;
  status?: "scheduled" | "confirmed" | "completed" | "cancelled";
};

export type UpdateScheduleInput = {
  assignedStaffId?: string | null;
  startsAt?: string;
  endsAt?: string;
  status?: "scheduled" | "confirmed" | "completed" | "cancelled";
};
