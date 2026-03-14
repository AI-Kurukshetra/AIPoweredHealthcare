-- Synthetic bulk seed data for AI Powered Healthcare (HIPAA-safe)
-- Targets ~200 rows per public table.

BEGIN;

TRUNCATE TABLE
  audit_logs,
  messages,
  channels,
  billing_records,
  incidents,
  compliance_records,
  credentials,
  visit_notes,
  visits,
  appointments,
  patients,
  profiles,
  organization_members,
  organizations
RESTART IDENTITY CASCADE;

-- 200 organizations.
INSERT INTO organizations (id, name)
SELECT
  format('10000000-0000-0000-0000-%s', lpad(to_hex(gs), 12, '0'))::uuid,
  format('AIPowered Healthcare Org %s', gs)
FROM generate_series(1, 200) AS gs;

-- Use org #1 as the demo org for related records.
WITH staff_pool AS (
  SELECT id, row_number() OVER (ORDER BY created_at ASC, id ASC) AS rn
  FROM auth.users
  LIMIT 200
)
INSERT INTO organization_members (org_id, user_id, role, status)
SELECT
  '10000000-0000-0000-0000-000000000001'::uuid,
  id,
  CASE rn % 5
    WHEN 1 THEN 'org_admin'
    WHEN 2 THEN 'care_coordinator'
    WHEN 3 THEN 'field_nurse'
    WHEN 4 THEN 'billing_staff'
    ELSE 'field_nurse'
  END::healthcare_role,
  'active'::membership_status
FROM staff_pool;

WITH staff_pool AS (
  SELECT id, row_number() OVER (ORDER BY created_at ASC, id ASC) AS rn
  FROM auth.users
  LIMIT 200
)
INSERT INTO profiles (id, org_id, full_name, phone, consent_given_at)
SELECT
  id,
  '10000000-0000-0000-0000-000000000001'::uuid,
  format('Demo Staff %s', rn),
  '+1-555-200-' || lpad(rn::text, 4, '0'),
  NOW() - ((rn % 30)::text || ' day')::interval
FROM staff_pool;

-- 200 patients.
INSERT INTO patients (id, org_id, first_name, last_name, dob_encrypted, phone, care_status)
SELECT
  format('20000000-0000-0000-0000-%s', lpad(to_hex(gs), 12, '0'))::uuid,
  '10000000-0000-0000-0000-000000000001'::uuid,
  format('PatientFirst%s', gs),
  format('PatientLast%s', gs),
  format('enc:%s', to_char(date '1940-01-01' + ((gs * 37) % 20000), 'YYYY-MM-DD')),
  '+1-555-100-' || lpad(gs::text, 4, '0'),
  CASE
    WHEN gs % 10 = 0 THEN 'discharged'
    WHEN gs % 7 = 0 THEN 'inactive'
    ELSE 'active'
  END::patient_care_status
FROM generate_series(1, 200) AS gs;

-- 200 appointments linked to patients.
WITH patient_pool AS (
  SELECT id, row_number() OVER (ORDER BY id ASC) AS rn
  FROM patients
  WHERE org_id = '10000000-0000-0000-0000-000000000001'::uuid
),
staff_pool AS (
  SELECT user_id, row_number() OVER (ORDER BY user_id ASC) AS rn, count(*) OVER () AS staff_count
  FROM organization_members
  WHERE org_id = '10000000-0000-0000-0000-000000000001'::uuid
)
INSERT INTO appointments (id, org_id, patient_id, assigned_staff_id, starts_at, ends_at, status)
SELECT
  format('30000000-0000-0000-0000-%s', lpad(to_hex(gs), 12, '0'))::uuid,
  '10000000-0000-0000-0000-000000000001'::uuid,
  p.id,
  s.user_id,
  NOW() - INTERVAL '15 day' + (gs || ' hour')::interval,
  NOW() - INTERVAL '15 day' + ((gs + 1) || ' hour')::interval,
  CASE
    WHEN gs % 6 = 0 THEN 'cancelled'
    WHEN gs % 3 = 0 THEN 'scheduled'
    ELSE 'completed'
  END
FROM generate_series(1, 200) AS gs
JOIN patient_pool p ON p.rn = gs
LEFT JOIN staff_pool s ON s.rn = ((gs - 1) % NULLIF(s.staff_count, 0)) + 1;

-- 200 visits linked to appointments/patients.
WITH appointment_pool AS (
  SELECT id, patient_id, row_number() OVER (ORDER BY id ASC) AS rn
  FROM appointments
  WHERE org_id = '10000000-0000-0000-0000-000000000001'::uuid
),
staff_pool AS (
  SELECT user_id, row_number() OVER (ORDER BY user_id ASC) AS rn, count(*) OVER () AS staff_count
  FROM organization_members
  WHERE org_id = '10000000-0000-0000-0000-000000000001'::uuid
)
INSERT INTO visits (id, org_id, patient_id, appointment_id, assigned_staff_id, started_at, completed_at, status)
SELECT
  format('40000000-0000-0000-0000-%s', lpad(to_hex(gs), 12, '0'))::uuid,
  '10000000-0000-0000-0000-000000000001'::uuid,
  a.patient_id,
  a.id,
  s.user_id,
  NOW() - INTERVAL '14 day' + (gs || ' hour')::interval,
  CASE WHEN gs % 4 = 0 THEN NULL ELSE NOW() - INTERVAL '14 day' + ((gs + 1) || ' hour')::interval END,
  CASE WHEN gs % 4 = 0 THEN 'in_progress' ELSE 'completed' END
FROM generate_series(1, 200) AS gs
JOIN appointment_pool a ON a.rn = gs
LEFT JOIN staff_pool s ON s.rn = ((gs - 1) % NULLIF(s.staff_count, 0)) + 1;

-- 200 visit notes.
WITH visit_pool AS (
  SELECT id, patient_id, row_number() OVER (ORDER BY id ASC) AS rn
  FROM visits
  WHERE org_id = '10000000-0000-0000-0000-000000000001'::uuid
)
INSERT INTO visit_notes (id, org_id, visit_id, patient_id, note, vitals)
SELECT
  format('50000000-0000-0000-0000-%s', lpad(to_hex(gs), 12, '0'))::uuid,
  '10000000-0000-0000-0000-000000000001'::uuid,
  v.id,
  v.patient_id,
  format('Routine follow-up note for visit %s. No critical findings.', gs),
  jsonb_build_object(
    'bp', format('%s/%s', 110 + (gs % 30), 70 + (gs % 20)),
    'pulse', 60 + (gs % 35),
    'spo2', format('%s%%', 94 + (gs % 6))
  )
FROM generate_series(1, 200) AS gs
JOIN visit_pool v ON v.rn = gs;

-- 200 credentials.
WITH staff_pool AS (
  SELECT user_id, row_number() OVER (ORDER BY user_id ASC) AS rn
  FROM organization_members
  WHERE org_id = '10000000-0000-0000-0000-000000000001'::uuid
  LIMIT 200
)
INSERT INTO credentials (
  id,
  org_id,
  staff_id,
  credential_type,
  credential_number,
  issued_at,
  expires_at,
  status
)
SELECT
  format('60000000-0000-0000-0000-%s', lpad(to_hex(rn), 12, '0'))::uuid,
  '10000000-0000-0000-0000-000000000001'::uuid,
  user_id,
  CASE WHEN rn % 2 = 0 THEN 'RN_LICENSE' ELSE 'CPR_CERT' END,
  'CR-' || lpad((rn * 97)::text, 6, '0'),
  NOW() - ((365 + rn)::text || ' day')::interval,
  NOW() + ((30 + (rn % 180))::text || ' day')::interval,
  CASE WHEN rn % 11 = 0 THEN 'expiring_soon' ELSE 'active' END
FROM staff_pool;

-- 200 compliance records linked to credentials.
WITH credential_pool AS (
  SELECT id, staff_id, row_number() OVER (ORDER BY id ASC) AS rn
  FROM credentials
  WHERE org_id = '10000000-0000-0000-0000-000000000001'::uuid
)
INSERT INTO compliance_records (id, org_id, credential_id, staff_id, status, checked_at, details)
SELECT
  format('70000000-0000-0000-0000-%s', lpad(to_hex(gs), 12, '0'))::uuid,
  '10000000-0000-0000-0000-000000000001'::uuid,
  c.id,
  c.staff_id,
  CASE WHEN gs % 12 = 0 THEN 'attention_required' ELSE 'compliant' END,
  NOW() - ((gs % 240)::text || ' hour')::interval,
  jsonb_build_object('category', 'credential_status', 'recordNumber', gs)
FROM generate_series(1, 200) AS gs
JOIN credential_pool c ON c.rn = gs;

-- 200 incidents.
WITH patient_pool AS (
  SELECT id, row_number() OVER (ORDER BY id ASC) AS rn
  FROM patients
  WHERE org_id = '10000000-0000-0000-0000-000000000001'::uuid
),
staff_pool AS (
  SELECT user_id, row_number() OVER (ORDER BY user_id ASC) AS rn, count(*) OVER () AS staff_count
  FROM organization_members
  WHERE org_id = '10000000-0000-0000-0000-000000000001'::uuid
)
INSERT INTO incidents (id, org_id, patient_id, reported_by, severity, title, description, status, occurred_at)
SELECT
  format('80000000-0000-0000-0000-%s', lpad(to_hex(gs), 12, '0'))::uuid,
  '10000000-0000-0000-0000-000000000001'::uuid,
  p.id,
  s.user_id,
  ((gs % 5) + 1)::text::incident_severity,
  format('Operational Incident %s', gs),
  format('Synthetic incident narrative %s for test analytics and compliance workflows.', gs),
  CASE WHEN gs % 4 = 0 THEN 'resolved' ELSE 'open' END,
  NOW() - ((gs % 500)::text || ' hour')::interval
FROM generate_series(1, 200) AS gs
JOIN patient_pool p ON p.rn = gs
LEFT JOIN staff_pool s ON s.rn = ((gs - 1) % NULLIF(s.staff_count, 0)) + 1;

-- 200 channels.
WITH patient_pool AS (
  SELECT id, row_number() OVER (ORDER BY id ASC) AS rn
  FROM patients
  WHERE org_id = '10000000-0000-0000-0000-000000000001'::uuid
),
creator AS (
  SELECT user_id
  FROM organization_members
  WHERE org_id = '10000000-0000-0000-0000-000000000001'::uuid
  ORDER BY created_at ASC, user_id ASC
  LIMIT 1
)
INSERT INTO channels (id, org_id, patient_id, name, channel_type, created_by, updated_by)
SELECT
  format('90000000-0000-0000-0000-%s', lpad(to_hex(gs), 12, '0'))::uuid,
  '10000000-0000-0000-0000-000000000001'::uuid,
  CASE WHEN gs <= 180 THEN p.id ELSE NULL END,
  CASE WHEN gs <= 180 THEN format('Patient Channel %s', gs) ELSE format('Team Channel %s', gs) END,
  CASE WHEN gs <= 180 THEN 'patient' ELSE 'team' END,
  c.user_id,
  c.user_id
FROM generate_series(1, 200) AS gs
LEFT JOIN patient_pool p ON p.rn = gs
CROSS JOIN creator c;

-- 200 messages.
WITH channel_pool AS (
  SELECT id, row_number() OVER (ORDER BY id ASC) AS rn
  FROM channels
  WHERE org_id = '10000000-0000-0000-0000-000000000001'::uuid
),
staff_pool AS (
  SELECT user_id, row_number() OVER (ORDER BY user_id ASC) AS rn, count(*) OVER () AS staff_count
  FROM organization_members
  WHERE org_id = '10000000-0000-0000-0000-000000000001'::uuid
)
INSERT INTO messages (id, org_id, channel_id, sender_id, body, escalation_flag, created_by, updated_by)
SELECT
  format('a0000000-0000-0000-0000-%s', lpad(to_hex(gs), 12, '0'))::uuid,
  '10000000-0000-0000-0000-000000000001'::uuid,
  ch.id,
  s.user_id,
  format('Synthetic message %s for channel activity load testing.', gs),
  (gs % 25 = 0),
  s.user_id,
  s.user_id
FROM generate_series(1, 200) AS gs
JOIN channel_pool ch ON ch.rn = gs
LEFT JOIN staff_pool s ON s.rn = ((gs - 1) % NULLIF(s.staff_count, 0)) + 1;

-- 200 billing records.
WITH visit_pool AS (
  SELECT id, patient_id, row_number() OVER (ORDER BY id ASC) AS rn
  FROM visits
  WHERE org_id = '10000000-0000-0000-0000-000000000001'::uuid
)
INSERT INTO billing_records (id, org_id, visit_id, patient_id, cpt_code, icd10_code, units, amount_cents, status)
SELECT
  format('b0000000-0000-0000-0000-%s', lpad(to_hex(gs), 12, '0'))::uuid,
  '10000000-0000-0000-0000-000000000001'::uuid,
  v.id,
  v.patient_id,
  CASE WHEN gs % 2 = 0 THEN '97110' ELSE '99605' END,
  CASE WHEN gs % 3 = 0 THEN 'I10' ELSE 'R26.89' END,
  1 + ((gs % 3)::numeric / 2),
  10000 + (gs * 175),
  CASE
    WHEN gs % 5 = 0 THEN 'paid'
    WHEN gs % 3 = 0 THEN 'submitted'
    ELSE 'pending'
  END
FROM generate_series(1, 200) AS gs
JOIN visit_pool v ON v.rn = gs;

-- 200 audit log rows.
WITH staff_pool AS (
  SELECT user_id, row_number() OVER (ORDER BY user_id ASC) AS rn, count(*) OVER () AS staff_count
  FROM organization_members
  WHERE org_id = '10000000-0000-0000-0000-000000000001'::uuid
)
INSERT INTO audit_logs (id, org_id, actor_id, resource_type, resource_id, action, ip_address, user_agent, metadata, occurred_at)
SELECT
  format('c0000000-0000-0000-0000-%s', lpad(to_hex(gs), 12, '0'))::uuid,
  '10000000-0000-0000-0000-000000000001'::uuid,
  s.user_id,
  CASE
    WHEN gs % 6 = 0 THEN 'billing_records'
    WHEN gs % 5 = 0 THEN 'incidents'
    WHEN gs % 4 = 0 THEN 'visits'
    ELSE 'patients'
  END,
  NULL,
  CASE gs % 5
    WHEN 0 THEN 'READ'
    WHEN 1 THEN 'CREATE'
    WHEN 2 THEN 'UPDATE'
    WHEN 3 THEN 'DELETE'
    ELSE 'EXPORT'
  END::audit_action,
  format('10.0.0.%s', (gs % 200) + 1),
  'bulk-seed.sql',
  jsonb_build_object('source', 'seed', 'index', gs),
  NOW() - ((gs % 720)::text || ' minute')::interval
FROM generate_series(1, 200) AS gs
LEFT JOIN staff_pool s ON s.rn = ((gs - 1) % NULLIF(s.staff_count, 0)) + 1;

COMMIT;
