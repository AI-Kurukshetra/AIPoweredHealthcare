-- Synthetic seed data for AI Powered Healthcare (HIPAA-safe)
-- Contains realistic but fictional operational records only.

INSERT INTO organizations (id, name)
VALUES ('00000000-0000-0000-0000-000000000001', 'AIPowered Healthcare - Demo Org')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO patients (id, org_id, first_name, last_name, dob_encrypted, phone, care_status)
VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Amelia', 'Hayes', 'enc:1947-02-18', '+1-555-100-0001', 'active'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Noah', 'Bennett', 'enc:1952-11-05', '+1-555-100-0002', 'active'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Isla', 'Martinez', 'enc:1960-09-24', '+1-555-100-0003', 'active'),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Lucas', 'Reed', 'enc:1949-01-13', '+1-555-100-0004', 'inactive'),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Mia', 'Foster', 'enc:1955-07-03', '+1-555-100-0005', 'active'),
  ('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'Ethan', 'Cole', 'enc:1939-04-29', '+1-555-100-0006', 'discharged'),
  ('10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'Sophia', 'Bryant', 'enc:1958-08-16', '+1-555-100-0007', 'active'),
  ('10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'Mason', 'Turner', 'enc:1963-12-08', '+1-555-100-0008', 'active')
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  dob_encrypted = EXCLUDED.dob_encrypted,
  phone = EXCLUDED.phone,
  care_status = EXCLUDED.care_status,
  deleted_at = NULL;

INSERT INTO appointments (id, org_id, patient_id, starts_at, ends_at, status)
VALUES
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', NOW() - INTERVAL '2 day' + INTERVAL '9 hour', NOW() - INTERVAL '2 day' + INTERVAL '10 hour', 'completed'),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', NOW() - INTERVAL '1 day' + INTERVAL '8 hour', NOW() - INTERVAL '1 day' + INTERVAL '9 hour', 'completed'),
  ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', NOW() + INTERVAL '2 hour', NOW() + INTERVAL '3 hour', 'scheduled'),
  ('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', NOW() + INTERVAL '4 hour', NOW() + INTERVAL '5 hour', 'scheduled'),
  ('20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000007', NOW() + INTERVAL '1 day' + INTERVAL '9 hour', NOW() + INTERVAL '1 day' + INTERVAL '10 hour', 'scheduled'),
  ('20000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000008', NOW() + INTERVAL '1 day' + INTERVAL '11 hour', NOW() + INTERVAL '1 day' + INTERVAL '12 hour', 'scheduled')
ON CONFLICT (id) DO UPDATE SET
  starts_at = EXCLUDED.starts_at,
  ends_at = EXCLUDED.ends_at,
  status = EXCLUDED.status,
  deleted_at = NULL;

INSERT INTO visits (id, org_id, patient_id, appointment_id, started_at, completed_at, status)
VALUES
  ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', NOW() - INTERVAL '2 day' + INTERVAL '9 hour', NOW() - INTERVAL '2 day' + INTERVAL '10 hour', 'completed'),
  ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', NOW() - INTERVAL '1 day' + INTERVAL '8 hour', NOW() - INTERVAL '1 day' + INTERVAL '9 hour', 'completed'),
  ('30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', NOW() - INTERVAL '30 minutes', NULL, 'in_progress'),
  ('30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', NULL, NULL, NULL, 'scheduled')
ON CONFLICT (id) DO UPDATE SET
  appointment_id = EXCLUDED.appointment_id,
  started_at = EXCLUDED.started_at,
  completed_at = EXCLUDED.completed_at,
  status = EXCLUDED.status,
  deleted_at = NULL;

INSERT INTO visit_notes (id, org_id, visit_id, patient_id, note, vitals)
VALUES
  (
    '40000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'Routine home check completed. Medication adherence reviewed and reinforced.',
    '{"bp":"132/78","pulse":"74","spo2":"97%"}'::jsonb
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000002',
    'Mobility assessment performed. Fall prevention checklist reviewed with caregiver.',
    '{"bp":"128/80","pulse":"70","temperature":"98.2"}'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  note = EXCLUDED.note,
  vitals = EXCLUDED.vitals,
  deleted_at = NULL;

INSERT INTO compliance_records (id, org_id, status, checked_at, details)
VALUES
  (
    '50000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'compliant',
    NOW() - INTERVAL '1 day',
    '{"category":"credential_review","summary":"No issues found"}'::jsonb
  ),
  (
    '50000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'attention_required',
    NOW() - INTERVAL '3 hour',
    '{"category":"documentation_timeliness","summary":"2 visit notes pending final sign-off"}'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  checked_at = EXCLUDED.checked_at,
  details = EXCLUDED.details;

INSERT INTO incidents (id, org_id, patient_id, severity, title, description, status, occurred_at)
VALUES
  (
    '60000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000003',
    '2',
    'Delayed arrival for wound care visit',
    'Arrival exceeded expected window by 35 minutes due to route disruption. Patient contacted and stable.',
    'open',
    NOW() - INTERVAL '2 hour'
  ),
  (
    '60000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '3',
    'Visit documentation submitted late',
    'Clinical note was submitted after internal SLA window. Follow-up coaching assigned.',
    'open',
    NOW() - INTERVAL '6 hour'
  ),
  (
    '60000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    NULL,
    '4',
    'Non-clinical supply count mismatch',
    'Inventory count variance identified during weekly check. Reconciliation completed.',
    'resolved',
    NOW() - INTERVAL '2 day'
  )
ON CONFLICT (id) DO UPDATE SET
  severity = EXCLUDED.severity,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  occurred_at = EXCLUDED.occurred_at,
  deleted_at = NULL;

INSERT INTO billing_records (id, org_id, visit_id, patient_id, cpt_code, icd10_code, units, amount_cents, status)
VALUES
  (
    '70000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '99605',
    'I10',
    1,
    18500,
    'submitted'
  ),
  (
    '70000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000002',
    '97110',
    'R26.89',
    1,
    13200,
    'pending'
  )
ON CONFLICT (id) DO UPDATE SET
  cpt_code = EXCLUDED.cpt_code,
  icd10_code = EXCLUDED.icd10_code,
  units = EXCLUDED.units,
  amount_cents = EXCLUDED.amount_cents,
  status = EXCLUDED.status,
  deleted_at = NULL;

-- Seed staff-aligned records only when auth users are available.
WITH ranked_users AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rn
  FROM auth.users
  LIMIT 6
),
staff_members AS (
  SELECT id,
    CASE rn
      WHEN 1 THEN 'org_admin'
      WHEN 2 THEN 'care_coordinator'
      WHEN 3 THEN 'field_nurse'
      WHEN 4 THEN 'field_nurse'
      WHEN 5 THEN 'billing_staff'
      ELSE 'care_coordinator'
    END AS role,
    CASE rn
      WHEN 1 THEN 'Avery Brooks'
      WHEN 2 THEN 'Jordan Patel'
      WHEN 3 THEN 'Riley Chen'
      WHEN 4 THEN 'Cameron Lewis'
      WHEN 5 THEN 'Skylar Morgan'
      ELSE 'Casey Howard'
    END AS full_name
  FROM ranked_users
)
INSERT INTO organization_members (org_id, user_id, role, status)
SELECT
  '00000000-0000-0000-0000-000000000001',
  id,
  role::healthcare_role,
  'active'::membership_status
FROM staff_members
ON CONFLICT (org_id, user_id) DO UPDATE
SET role = EXCLUDED.role, status = EXCLUDED.status;

WITH ranked_users AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rn
  FROM auth.users
  LIMIT 6
),
staff_members AS (
  SELECT id,
    CASE rn
      WHEN 1 THEN 'Avery Brooks'
      WHEN 2 THEN 'Jordan Patel'
      WHEN 3 THEN 'Riley Chen'
      WHEN 4 THEN 'Cameron Lewis'
      WHEN 5 THEN 'Skylar Morgan'
      ELSE 'Casey Howard'
    END AS full_name
  FROM ranked_users
)
INSERT INTO profiles (id, org_id, full_name, phone, consent_given_at)
SELECT
  id,
  '00000000-0000-0000-0000-000000000001',
  full_name,
  '+1-555-200-' || LPAD((ROW_NUMBER() OVER (ORDER BY id))::text, 4, '0'),
  NOW() - INTERVAL '10 day'
FROM staff_members
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  consent_given_at = EXCLUDED.consent_given_at;

WITH coordinator AS (
  SELECT user_id
  FROM organization_members
  WHERE org_id = '00000000-0000-0000-0000-000000000001'
  ORDER BY created_at ASC
  LIMIT 1
)
INSERT INTO channels (id, org_id, patient_id, name, channel_type, created_by, updated_by)
SELECT
  '80000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  NULL,
  'Clinical Operations',
  'team',
  user_id,
  user_id
FROM coordinator
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  channel_type = EXCLUDED.channel_type;

WITH coordinator AS (
  SELECT user_id
  FROM organization_members
  WHERE org_id = '00000000-0000-0000-0000-000000000001'
  ORDER BY created_at ASC
  LIMIT 1
)
INSERT INTO channels (id, org_id, patient_id, name, channel_type, created_by, updated_by)
SELECT
  '80000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  'Patient - Amelia Hayes',
  'patient',
  user_id,
  user_id
FROM coordinator
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  channel_type = EXCLUDED.channel_type,
  patient_id = EXCLUDED.patient_id;

WITH message_context AS (
  SELECT
    om.user_id AS sender_id,
    c.id AS channel_id
  FROM organization_members om
  JOIN channels c
    ON c.org_id = om.org_id
  WHERE om.org_id = '00000000-0000-0000-0000-000000000001'
    AND c.id = '80000000-0000-0000-0000-000000000001'
  ORDER BY om.created_at ASC
  LIMIT 1
)
INSERT INTO messages (id, org_id, channel_id, sender_id, body, escalation_flag, created_by, updated_by)
SELECT
  '90000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  channel_id,
  sender_id,
  'Morning huddle complete. No critical route blockers reported.',
  FALSE,
  sender_id,
  sender_id
FROM message_context
ON CONFLICT (id) DO UPDATE SET
  body = EXCLUDED.body,
  escalation_flag = EXCLUDED.escalation_flag,
  deleted_at = NULL;

WITH message_context AS (
  SELECT
    om.user_id AS sender_id,
    c.id AS channel_id
  FROM organization_members om
  JOIN channels c
    ON c.org_id = om.org_id
  WHERE om.org_id = '00000000-0000-0000-0000-000000000001'
    AND c.id = '80000000-0000-0000-0000-000000000002'
  ORDER BY om.created_at ASC
  LIMIT 1
)
INSERT INTO messages (id, org_id, channel_id, sender_id, body, escalation_flag, created_by, updated_by)
SELECT
  '90000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  channel_id,
  sender_id,
  'Medication refill request acknowledged. Follow-up visit confirmed.',
  FALSE,
  sender_id,
  sender_id
FROM message_context
ON CONFLICT (id) DO UPDATE SET
  body = EXCLUDED.body,
  escalation_flag = EXCLUDED.escalation_flag,
  deleted_at = NULL;
