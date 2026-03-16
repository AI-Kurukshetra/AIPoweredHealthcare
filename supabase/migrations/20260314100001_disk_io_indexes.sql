-- Indexes to reduce Disk IO for common query patterns
-- Run: supabase db push (or apply via Supabase Dashboard SQL Editor)

-- Patients: org + created_at for charts/metrics
CREATE INDEX IF NOT EXISTS idx_patients_org_created
  ON patients (org_id, created_at) WHERE deleted_at IS NULL;

-- Appointments: org + starts_at for charts
CREATE INDEX IF NOT EXISTS idx_appointments_org_starts
  ON appointments (org_id, starts_at) WHERE deleted_at IS NULL;

-- Visits: org + created_at for charts
CREATE INDEX IF NOT EXISTS idx_visits_org_created
  ON visits (org_id, created_at) WHERE deleted_at IS NULL;

-- Audit logs: org + occurred_at for activity feed
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_occurred
  ON audit_logs (org_id, occurred_at DESC);
