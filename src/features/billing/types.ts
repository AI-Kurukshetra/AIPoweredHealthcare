export type BillingRecordListItem = {
  id: string;
  visitId: string | null;
  patientId: string | null;
  cptCode: string;
  icd10Code: string | null;
  units: number;
  amountCents: number;
  status: string;
  createdAt: string;
};

export type CreateBillingRecordInput = {
  visitId?: string;
  patientId?: string;
  cptCode: string;
  icd10Code?: string;
  units?: number;
  amountCents: number;
  status?: "pending" | "submitted" | "paid" | "denied";
};
