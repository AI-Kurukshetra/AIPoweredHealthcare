export type CredentialListItem = {
  id: string;
  staffId: string;
  credentialType: string;
  credentialNumber: string | null;
  issuedAt: string | null;
  expiresAt: string;
  status: string;
};

export type CreateCredentialInput = {
  staffId: string;
  credentialType: string;
  credentialNumber?: string;
  issuedAt?: string;
  expiresAt: string;
  status?: string;
};
