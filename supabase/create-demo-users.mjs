import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const demoUsers = [
  { email: "demo.admin@aipoweredhealthcare.local", fullName: "Avery Brooks" },
  { email: "demo.coordinator@aipoweredhealthcare.local", fullName: "Jordan Patel" },
  { email: "demo.nurse1@aipoweredhealthcare.local", fullName: "Riley Chen" },
  { email: "demo.nurse2@aipoweredhealthcare.local", fullName: "Cameron Lewis" },
  { email: "demo.billing@aipoweredhealthcare.local", fullName: "Skylar Morgan" },
  { email: "demo.coordinator2@aipoweredhealthcare.local", fullName: "Casey Howard" },
];

const defaultPassword = process.env.DEMO_USER_PASSWORD ?? "DemoPass#2026";

async function run() {
  const { data: listed, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (listError) {
    throw listError;
  }

  const existingEmails = new Set((listed.users ?? []).map((user) => user.email));
  let created = 0;

  for (const user of demoUsers) {
    if (existingEmails.has(user.email)) {
      continue;
    }

    const { error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: defaultPassword,
      email_confirm: true,
      user_metadata: { full_name: user.fullName },
    });

    if (error) {
      throw error;
    }

    created += 1;
  }

  process.stdout.write(`DEMO_USERS_CREATED=${created}\n`);
}

run();
