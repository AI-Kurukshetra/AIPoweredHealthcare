insert into auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
select
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  format('sql.bulk.user%1$s@aipoweredhealthcare.local', lpad(gs::text, 3, '0')),
  crypt('DemoPass#2026', gen_salt('bf')),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('full_name', format('SQL Bulk User %s', gs)),
  now(),
  now()
from generate_series(1, 200) gs
on conflict (email) do nothing;
