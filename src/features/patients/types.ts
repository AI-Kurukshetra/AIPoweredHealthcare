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

export type CreatePatientInput = {
  firstName: string;
  lastName: string;
  phone?: string | null;
  dobEncrypted?: string | null;
};

export type UpdatePatientInput = {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  careStatus?: "active" | "inactive" | "discharged";
};
