# TASKS

## Sprint 1 (Foundation)

- [x] T-001 Full database schema migration (initial foundation entities)
- [x] T-002 Baseline RLS policies for covered entities
- [x] T-003 Audit table + append-only trigger policy
- [x] T-005 RBAC/auth middleware baseline
- [x] T-006 Initial TypeScript DB type stubs
- [x] T-004 Supabase Auth + MFA full implementation
- [ ] T-007 Sentry setup with PHI scrubbing

## Current Increment
- [x] Patients vertical slice (`GET/POST /api/patients`)
- [x] Server-rendered `/patients` page with loading + error boundaries
- [x] Visits vertical slice (`GET/POST /api/visits`)
- [x] Incidents vertical slice (`GET/POST /api/incidents`)
- [x] Analytics endpoint (`GET /api/analytics`) + live dashboard metrics
- [x] Server-rendered `/visits` and `/incidents` pages with loading + error boundaries
- [x] `supabase/seed.sql` with realistic synthetic healthcare data
