-- Schema + seed for AI Healthcare Workforce & Operations Platform
-- Target DB: SUPABASE_DB_URL

create extension if not exists "pgcrypto";

-- Users
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  role text not null check (role in ('admin', 'doctor', 'nurse', 'manager')),
  created_at timestamptz not null default now()
);

-- Patients
create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  dob date not null,
  gender text not null check (gender in ('male', 'female', 'other')),
  phone text,
  address text,
  insurance_provider text,
  created_at timestamptz not null default now()
);

-- Staff
create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  specialization text,
  license_number text,
  phone text,
  status text not null check (status in ('active', 'inactive'))
);

-- Visits
create table if not exists public.visits (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  staff_id uuid not null references public.staff(id) on delete set null,
  visit_date timestamptz not null,
  status text not null check (status in ('scheduled', 'in_progress', 'completed', 'cancelled')),
  notes text
);

-- Schedules
create table if not exists public.schedules (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff(id) on delete cascade,
  date date not null,
  shift_start timestamptz not null,
  shift_end timestamptz not null,
  location text
);

-- Compliance records
create table if not exists public.compliance_records (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff(id) on delete cascade,
  credential_name text not null,
  expiry_date date not null,
  status text not null check (status in ('compliant', 'attention_required', 'expired'))
);

-- Communications
create table if not exists public.communications (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.users(id) on delete cascade,
  receiver_id uuid not null references public.users(id) on delete cascade,
  message text not null,
  timestamp timestamptz not null default now()
);

-- Billing records
create table if not exists public.billing_records (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  visit_id uuid not null references public.visits(id) on delete cascade,
  amount numeric(10,2) not null,
  status text not null check (status in ('pending', 'submitted', 'paid', 'denied')),
  payment_method text not null
);

-- Seed data (5 rows per table)
insert into public.users (id, name, email, role, created_at) values
  ('11111111-1111-1111-1111-111111111111', 'Avery Patel', 'avery.patel@example.com', 'admin', now() - interval '20 days'),
  ('22222222-2222-2222-2222-222222222222', 'Mina Rao', 'mina.rao@example.com', 'doctor', now() - interval '18 days'),
  ('33333333-3333-3333-3333-333333333333', 'Noah Kim', 'noah.kim@example.com', 'nurse', now() - interval '16 days'),
  ('44444444-4444-4444-4444-444444444444', 'Liam Chen', 'liam.chen@example.com', 'manager', now() - interval '14 days'),
  ('55555555-5555-5555-5555-555555555555', 'Sofia Torres', 'sofia.torres@example.com', 'doctor', now() - interval '12 days')
on conflict do nothing;

insert into public.patients (id, name, dob, gender, phone, address, insurance_provider, created_at) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Daniel Smith', '1981-04-12', 'male', '555-0101', '123 Harbor St', 'BlueCare', now() - interval '30 days'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Olivia Johnson', '1974-09-03', 'female', '555-0102', '456 Maple Ave', 'HealthPlus', now() - interval '25 days'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Ethan Brown', '1990-01-22', 'male', '555-0103', '789 Pine Rd', 'WellLife', now() - interval '20 days'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Mia Davis', '1968-06-15', 'female', '555-0104', '901 Lake Dr', 'MedSure', now() - interval '15 days'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Lucas Wilson', '1988-11-02', 'other', '555-0105', '135 Oak Ln', 'CareOne', now() - interval '10 days')
on conflict do nothing;

insert into public.staff (id, name, role, specialization, license_number, phone, status) values
  ('f1111111-1111-1111-1111-111111111111', 'Dr. Priya Shah', 'doctor', 'Cardiology', 'LIC-1001', '555-0201', 'active'),
  ('f2222222-2222-2222-2222-222222222222', 'Nurse Alex Green', 'nurse', 'Home Health', 'LIC-1002', '555-0202', 'active'),
  ('f3333333-3333-3333-3333-333333333333', 'Dr. Emma Lee', 'doctor', 'Geriatrics', 'LIC-1003', '555-0203', 'active'),
  ('f4444444-4444-4444-4444-444444444444', 'Nurse Jordan Hall', 'nurse', 'Wound Care', 'LIC-1004', '555-0204', 'inactive'),
  ('f5555555-5555-5555-5555-555555555555', 'Sam Rivera', 'manager', 'Operations', 'LIC-1005', '555-0205', 'active')
on conflict do nothing;

insert into public.visits (id, patient_id, staff_id, visit_date, status, notes) values
  ('v1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'f1111111-1111-1111-1111-111111111111', now() - interval '2 days', 'completed', 'Vitals stable, follow-up in 2 weeks.'),
  ('v2222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'f2222222-2222-2222-2222-222222222222', now() - interval '1 day', 'in_progress', 'Home visit started.'),
  ('v3333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'f3333333-3333-3333-3333-333333333333', now() + interval '1 day', 'scheduled', 'Initial assessment scheduled.'),
  ('v4444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'f4444444-4444-4444-4444-444444444444', now() - interval '4 days', 'cancelled', 'Patient unavailable.'),
  ('v5555555-5555-5555-5555-555555555555', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'f5555555-5555-5555-5555-555555555555', now(), 'scheduled', 'Care plan kickoff.')
on conflict do nothing;

insert into public.schedules (id, staff_id, date, shift_start, shift_end, location) values
  ('s1111111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', current_date, now(), now() + interval '8 hours', 'North Clinic'),
  ('s2222222-2222-2222-2222-222222222222', 'f2222222-2222-2222-2222-222222222222', current_date, now(), now() + interval '8 hours', 'West Zone'),
  ('s3333333-3333-3333-3333-333333333333', 'f3333333-3333-3333-3333-333333333333', current_date + 1, now() + interval '1 day', now() + interval '1 day 8 hours', 'East Clinic'),
  ('s4444444-4444-4444-4444-444444444444', 'f4444444-4444-4444-4444-444444444444', current_date + 2, now() + interval '2 days', now() + interval '2 days 8 hours', 'South Zone'),
  ('s5555555-5555-5555-5555-555555555555', 'f5555555-5555-5555-5555-555555555555', current_date + 3, now() + interval '3 days', now() + interval '3 days 8 hours', 'HQ')
on conflict do nothing;

insert into public.compliance_records (id, staff_id, credential_name, expiry_date, status) values
  ('c1111111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', 'Medical License', current_date + 90, 'compliant'),
  ('c2222222-2222-2222-2222-222222222222', 'f2222222-2222-2222-2222-222222222222', 'RN License', current_date + 30, 'attention_required'),
  ('c3333333-3333-3333-3333-333333333333', 'f3333333-3333-3333-3333-333333333333', 'Board Cert', current_date + 120, 'compliant'),
  ('c4444444-4444-4444-4444-444444444444', 'f4444444-4444-4444-4444-444444444444', 'RN License', current_date - 5, 'expired'),
  ('c5555555-5555-5555-5555-555555555555', 'f5555555-5555-5555-5555-555555555555', 'Manager License', current_date + 60, 'compliant')
on conflict do nothing;

insert into public.communications (id, sender_id, receiver_id, message, timestamp) values
  ('m1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Please review today’s visits.', now() - interval '2 hours'),
  ('m2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'Patient update submitted.', now() - interval '90 minutes'),
  ('m3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'Need staffing support tomorrow.', now() - interval '60 minutes'),
  ('m4444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', 'Approved schedule changes.', now() - interval '30 minutes'),
  ('m5555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'Billing review complete.', now() - interval '10 minutes')
on conflict do nothing;

insert into public.billing_records (id, patient_id, visit_id, amount, status, payment_method) values
  ('b1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'v1111111-1111-1111-1111-111111111111', 180.00, 'pending', 'insurance'),
  ('b2222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'v2222222-2222-2222-2222-222222222222', 220.00, 'submitted', 'insurance'),
  ('b3333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'v3333333-3333-3333-3333-333333333333', 150.00, 'pending', 'self_pay'),
  ('b4444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'v4444444-4444-4444-4444-444444444444', 0.00, 'denied', 'insurance'),
  ('b5555555-5555-5555-5555-555555555555', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'v5555555-5555-5555-5555-555555555555', 300.00, 'paid', 'card')
on conflict do nothing;
