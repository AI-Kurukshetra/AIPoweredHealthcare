# SCHEMA

## Current Baseline
Date: 2026-03-14

Applied migrations:
1. `20260314000100_initial_schema.sql`
2. `20260314000200_rls_policies.sql`
3. `20260314000300_audit_triggers.sql`

## Entity Coverage (Sprint 1 Foundation)
- Identity: `organizations`, `organization_members`, `profiles`
- Clinical/Operations: `patients`, `appointments`, `visits`, `visit_notes`
- Compliance: `credentials`, `compliance_records`, `incidents`
- Communications: `channels`, `messages`
- Billing: `billing_records`
- System: `audit_logs`

## Security Baseline
- RLS enabled on all PHI-bearing and multi-tenant tables.
- Org membership helper functions: `is_org_member`, `is_org_admin`.
- Append-only enforcement on `audit_logs`.
- Updated-at/version trigger on mutable tables.
