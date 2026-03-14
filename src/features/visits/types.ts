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

export type VisitNoteItem = {
  id: string;
  note: string;
  vitals: Record<string, string> | null;
  createdAt: string;
  createdBy: string | null;
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

export type UpdateVisitInput = {
  status?: "scheduled" | "in_progress" | "completed" | "cancelled";
  startedAt?: string | null;
  completedAt?: string | null;
  note?: string;
  vitals?: {
    systolic?: string;
    diastolic?: string;
    pulse?: string;
    temperature?: string;
    spo2?: string;
  };
};
