export type PatientListItem = {
  id: string;
  firstName: string;
  lastName: string;
  careStatus: "active" | "inactive" | "discharged";
};

export type CreatePatientInput = {
  firstName: string;
  lastName: string;
  phone?: string | null;
  dobEncrypted?: string | null;
};
