-- Sprint 1 foundation schema for Healthcare Workforce Platform (MVP)
-- NOTE: All PHI tables use soft-delete and include audit columns.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE healthcare_role AS ENUM (
  'super_admin',
  'org_admin',
  'care_coordinator',
  'field_nurse',
  'billing_staff',
  'patient'
);

CREATE TYPE membership_status AS ENUM ('active', 'inactive');
CREATE TYPE patient_care_status AS ENUM ('active', 'inactive', 'discharged');
CREATE TYPE audit_action AS ENUM ('READ', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT');
CREATE TYPE incident_severity AS ENUM ('1', '2', '3', '4', '5');

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role healthcare_role NOT NULL,
  status membership_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  version INT NOT NULL DEFAULT 1,
  UNIQUE (org_id, user_id)
);

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  consent_given_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  version INT NOT NULL DEFAULT 1
);

CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  dob_encrypted TEXT, -- PHI: date_of_birth (encrypted)
  phone TEXT, -- PHI: contact
  care_status patient_care_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ,
  version INT NOT NULL DEFAULT 1
);

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id),
  assigned_staff_id UUID REFERENCES auth.users(id),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ,
  version INT NOT NULL DEFAULT 1
);

CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id),
  appointment_id UUID REFERENCES appointments(id),
  assigned_staff_id UUID REFERENCES auth.users(id),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'in_progress',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ,
  version INT NOT NULL DEFAULT 1
);

CREATE TABLE visit_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id),
  note TEXT NOT NULL, -- PHI: clinical note
  vitals JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ,
  version INT NOT NULL DEFAULT 1
);

CREATE TABLE credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credential_type TEXT NOT NULL,
  credential_number TEXT, -- PHI-adjacent: license identifier
  issued_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  version INT NOT NULL DEFAULT 1
);

CREATE TABLE compliance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  credential_id UUID REFERENCES credentials(id),
  staff_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  version INT NOT NULL DEFAULT 1
);

CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id),
  reported_by UUID REFERENCES auth.users(id),
  severity incident_severity NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL, -- PHI: potentially sensitive narrative
  status TEXT NOT NULL DEFAULT 'open',
  occurred_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ,
  version INT NOT NULL DEFAULT 1
);

CREATE TABLE channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id),
  name TEXT NOT NULL,
  channel_type TEXT NOT NULL DEFAULT 'team',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  version INT NOT NULL DEFAULT 1
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  body TEXT NOT NULL, -- PHI: care communication
  escalation_flag BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ,
  version INT NOT NULL DEFAULT 1
);

CREATE TABLE billing_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  visit_id UUID REFERENCES visits(id),
  patient_id UUID REFERENCES patients(id),
  cpt_code TEXT NOT NULL,
  icd10_code TEXT,
  units NUMERIC(10,2) NOT NULL DEFAULT 1,
  amount_cents INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ,
  version INT NOT NULL DEFAULT 1
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id),
  resource_type TEXT NOT NULL,
  resource_id UUID,
  action audit_action NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_org_members_org_user ON organization_members(org_id, user_id);
CREATE INDEX idx_patients_org_deleted ON patients(org_id, deleted_at);
CREATE INDEX idx_appointments_org_starts_at ON appointments(org_id, starts_at);
CREATE INDEX idx_visits_org_assigned ON visits(org_id, assigned_staff_id);
CREATE INDEX idx_credentials_staff_expiry ON credentials(staff_id, expires_at);
CREATE INDEX idx_incidents_org_severity ON incidents(org_id, severity);
CREATE INDEX idx_messages_channel_created ON messages(channel_id, created_at DESC);
CREATE INDEX idx_audit_logs_org_occurred ON audit_logs(org_id, occurred_at DESC);
