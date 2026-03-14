export type IncidentListItem = {
  id: string;
  patientId: string | null;
  severity: "1" | "2" | "3" | "4" | "5";
  title: string;
  status: string;
  occurredAt: string;
  createdAt: string;
};

export type CreateIncidentInput = {
  patientId?: string;
  severity: "1" | "2" | "3" | "4" | "5";
  title: string;
  description: string;
  occurredAt: string;
};
