export type VisitListItem = {
  id: string;
  patientId: string;
  appointmentId: string | null;
  assignedStaffId: string | null;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
};

export type CreateVisitInput = {
  patientId: string;
  appointmentId?: string;
  assignedStaffId?: string;
  startedAt?: string;
  completedAt?: string;
  status?: "scheduled" | "in_progress" | "completed" | "cancelled";
  note?: string;
  vitals?: {
    systolic?: string;
    diastolic?: string;
    pulse?: string;
    temperature?: string;
    spo2?: string;
  };
};
