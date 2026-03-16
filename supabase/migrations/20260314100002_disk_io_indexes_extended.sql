-- Extended indexes to reduce Disk I/O for list/read APIs
-- Complements 20260314100001_disk_io_indexes.sql

-- Organization members: org + created_at for staff list ordering
CREATE INDEX IF NOT EXISTS idx_organization_members_org_created
  ON organization_members (org_id, created_at DESC);

-- Compliance records: org + checked_at for list ordering
CREATE INDEX IF NOT EXISTS idx_compliance_records_org_checked
  ON compliance_records (org_id, checked_at DESC);

-- Credentials: org for list by organization
CREATE INDEX IF NOT EXISTS idx_credentials_org_id
  ON credentials (org_id);

-- Channels: org for communications list
CREATE INDEX IF NOT EXISTS idx_channels_org_id
  ON channels (org_id);

-- Incidents: org + occurred_at for list ordering
CREATE INDEX IF NOT EXISTS idx_incidents_org_occurred
  ON incidents (org_id, occurred_at DESC)
  WHERE deleted_at IS NULL;

-- Billing records: org + created_at for list
CREATE INDEX IF NOT EXISTS idx_billing_records_org_created
  ON billing_records (org_id, created_at DESC)
  WHERE deleted_at IS NULL;

-- Visits: patient_id + created_at for patient timeline/visits
CREATE INDEX IF NOT EXISTS idx_visits_patient_created
  ON visits (patient_id, created_at DESC)
  WHERE deleted_at IS NULL;
