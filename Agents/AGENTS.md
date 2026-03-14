# 🤖 agents.md
## AI Agent Registry & Operating Instructions
### Platform: AI-Powered Healthcare Workforce & Operations Management
### Stack: Next.js · Supabase · React Native · Vercel · TypeScript

> **Version:** 1.0 · **Domain:** Healthcare (HIPAA-Regulated) · **Reference:** PRD v1.0 (March 2026)
>
> **Purpose:** Living instruction file for all AI coding agents. Defines agent roles, PRD feature ownership, operating rules, HIPAA constraints, task protocols, and inter-agent coordination patterns.
>
> **⚠️ HIPAA Rule for all agents:** This platform handles Protected Health Information (PHI). No agent may send, log, display, or process real patient data. All development uses synthetic data only. When uncertain about a HIPAA decision, STOP and log to BLOCKERS.md.

---

## Part 1 — Project State

### Current Phase
**Phase 1 — MVP** (Months 1–4)

### MVP Feature Delivery Status

| Feature | Code | Status | Agent Owner |
|---|---|---|---|
| Mobile Staff Scheduling | F3 | 🔴 Not Started | SCHEDULER-AGENT |
| Patient Visit Documentation | F6 | 🔴 Not Started | DOCUMENTATION-AGENT |
| GPS Tracking & Route Optimization | F8 | 🔴 Not Started | GEO-AGENT |
| HIPAA-Compliant Messaging | F10 | 🔴 Not Started | COMMS-AGENT |
| EHR Integration (Epic FHIR) | F7 | 🔴 Not Started | INTEGRATION-AGENT |
| Compliance Tracking | F4, F12 | 🔴 Not Started | COMPLIANCE-AGENT |
| Analytics Dashboard | F9 | 🔴 Not Started | ANALYTICS-AGENT |
| Patient Care Team Coordination | F1 | 🔴 Not Started | COORDINATOR-AGENT |
| Auth + MFA + RBAC | — | 🔴 Not Started | PLATFORM-AGENT |
| Database Schema + RLS | — | 🔴 Not Started | PLATFORM-AGENT |
| HIPAA Safeguards | SEC-01 | 🔴 Not Started | PLATFORM-AGENT |

**Status legend:** 🔴 Not Started · 🟡 In Progress · 🟢 Complete · 🔵 In Review · ⛔ Blocked

---

## Part 2 — Agent Registry

---

### PLATFORM-AGENT
**Role:** Foundation architect — database schema, auth, HIPAA safeguards, infrastructure

**PRD Ownership:** Architecture (Section 6), Security (Section 10)
**Skill Set:** DB-01, DB-02, DB-03, DB-04, DB-05, DB-07, BE-04 (auth), SEC-01, SEC-02

**Responsibilities:**
- Design and implement the full Supabase schema for all 26+ entities
- Write and deploy all RLS policies for every PHI table
- Implement HIPAA audit trail (`audit_logs` table + triggers)
- Configure Supabase Auth with MFA enforcement
- Build role-based access control middleware for Next.js
- Set up Doppler secret management and environment variable schema
- Configure Sentry with PHI scrubbing
- Maintain `SCHEMA.md` after every migration

**Operating instructions:**

```
1. Always start by reading SCHEMA.md for current schema state
2. Generate SQL migrations only for tables not yet in SCHEMA.md
3. Enable RLS immediately on every new table — before writing any query
4. Never generate a migration without an accompanying rollback
5. After every migration:
   a. Update SCHEMA.md
   b. Run: supabase gen types typescript → update database.types.ts
   c. Update AGENTS.md schema state section
6. Log every HIPAA architectural decision to HIPAA_DECISIONS.md
7. When uncertain about PHI scope of a new table, log to BLOCKERS.md
```

**Output file conventions:**
- Migrations: `supabase/migrations/YYYYMMDDHHMMSS_description.sql`
- Types: `src/types/database.types.ts` (auto-generated)
- HIPAA decisions: `doc/HIPAA_DECISIONS.md`

---

### SCHEDULER-AGENT
**Role:** Staff scheduling engine — the core operational feature

**PRD Ownership:** F3 Staff Scheduling & Resource Allocation, F1 Patient Care Team Coordination (assignment aspect)
**Skill Set:** BE-04 (scheduling engine), DB-07 (geo queries), FE-02 (coordinator dashboard)

**Responsibilities:**
- Build the automated scheduling algorithm (credentials × availability × distance × hour limits)
- Build conflict detection and resolution logic
- Create the drag-and-drop schedule management UI for coordinators
- Build the auto-assign API endpoint (`POST /api/schedules/auto-assign`)
- Build the schedule grid component (`ScheduleGrid.tsx`)
- Implement PostGIS-based proximity queries for nurse-to-patient matching

**Operating instructions:**

```
1. Read SCHEMA.md — particularly staff_schedules, appointments, credentials tables
2. Scheduling algorithm priority order:
   a. Credential validity (hard constraint — cannot violate)
   b. Max weekly hours per staff member (hard constraint — labor law)
   c. Patient care plan requirements (matching care type to credential)
   d. Geographic proximity (soft constraint — minimize travel)
   e. Staff preference / continuity of care (soft constraint — patient outcomes)
3. Never assign a nurse with expired credentials — check credentials.expires_at
4. All schedule mutations must emit Inngest events for downstream consumers
5. Scheduling API must be idempotent — safe to retry without duplicate assignments
```

**Key files to own:**
```
lib/scheduling/matcher.ts          # Core matching algorithm
lib/scheduling/conflicts.ts        # Conflict detection
app/api/schedules/route.ts
app/api/schedules/auto-assign/route.ts
components/features/schedule/ScheduleGrid.tsx
components/features/schedule/AutoAssignPanel.tsx
```

---

### DOCUMENTATION-AGENT
**Role:** Visit documentation and offline-first mobile forms

**PRD Ownership:** F6 Patient Visit Documentation, F2 Mobile Field Service Management (offline aspect)
**Skill Set:** FE-03 (offline forms), FE-01 (mobile components), BE-01 (visit API), DB-01 (visit schema)

**Responsibilities:**
- Build multi-step visit documentation form (React Native)
- Implement offline queue with IndexedDB/WatermelonDB sync
- Build photo capture and compression for clinical evidence
- Build e-signature capture
- Integrate `PHIGuard` component for audit logging on every PHI display
- Build auto-save with conflict detection for concurrent edits

**Operating instructions:**

```
1. Read SCHEMA.md for visits, visit_notes, visit_photos tables
2. Offline-first mandate:
   a. All form state stored locally first (WatermelonDB)
   b. Sync to Supabase when connectivity is available
   c. Server wins for schedule conflicts
   d. Local wins for in-progress clinical notes (nurse is the source of truth)
3. Every PHI field rendered in the UI must be wrapped in <PHIGuard>
4. Photo uploads: compress to max 1MB before upload; never store PHI in file names
5. E-signatures: stored as encrypted base64 BLOB in Supabase Storage
6. All mutations must call logAudit() with action='CREATE' or 'UPDATE'
```

**Key files to own:**
```
apps/mobile/src/screens/DocumentationScreen.tsx
apps/mobile/src/screens/PatientVisitScreen.tsx
apps/mobile/src/lib/offline/queue.ts
apps/mobile/src/lib/offline/sync.ts
components/features/patients/CareTimeline.tsx
app/api/visits/route.ts
app/api/visits/[id]/route.ts
```

---

### GEO-AGENT
**Role:** GPS tracking, route optimization, and location intelligence

**PRD Ownership:** F8 GPS Tracking & Route Optimization
**Skill Set:** BE-06 (GPS service), FE-04 (staff map), DB-07 (geo queries)

**Responsibilities:**
- Build real-time GPS location tracking API (`POST /api/tracking/location`)
- Build route optimization service using Google Maps Directions API
- Build real-time coordinator map view with Supabase Realtime + Google Maps
- Build mileage calculation and reporting for billing reimbursement
- Pre-compute daily routes via Inngest morning cron job

**Operating instructions:**

```
1. HIPAA GPS rules:
   a. GPS tracking requires explicit staff consent — store consent_given_at in profiles
   b. Only transmit lat/lng to Google Maps — never patient names or addresses with identifiers
   c. Location data retained for 90 days then purged (unless in active incident investigation)
2. Route optimization sequence:
   a. Morning cron (5 AM) pre-computes optimal routes for each nurse's day
   b. On-demand re-optimization if visit added/cancelled mid-day
   c. Google Maps Directions API — optimize:true waypoints
3. Real-time coordinator map:
   a. Subscribe to location_events via Supabase Realtime
   b. Staff location updates every 5 minutes (configurable)
   c. Late arrival alert if ETA to next visit exceeds scheduled time + 15 min
```

**Key files to own:**
```
lib/geo/routing.ts
lib/geo/distance.ts
app/api/tracking/location/route.ts
app/api/routes/optimize/route.ts
components/features/schedule/StaffMapView.tsx
inngest/functions/route-optimization.ts
```

---

### COMMS-AGENT
**Role:** HIPAA-compliant secure messaging and notifications

**PRD Ownership:** F10 Communication Hub
**Skill Set:** BE-02 (messaging API), FE-01 (message UI components), DB-01 (messaging schema)

**Responsibilities:**
- Build patient-scoped and team-scoped message channels
- Implement care team authorization for channel access
- Build message thread UI with read receipts and escalation flags
- Implement push notification delivery (no PHI in payload)
- Build Twilio SMS fallback for urgent alerts

**Operating instructions:**

```
1. Authorization rule: A user can only access a channel if they are:
   a. A member of the care team for that patient (patient channels), OR
   b. A member of the org's staff channel (team channels)
2. Message content is NOT encrypted at the application layer
   (relies on Supabase TLS + AES-256 at rest). Encryption key management
   is deferred to Phase 2. Log this decision in HIPAA_DECISIONS.md.
3. Push notifications must contain ZERO PHI:
   - Use silent push + app fetch pattern for patient-related notifications
   - Only generic alert text in notification body
4. Message audit: every channel access logs to audit_logs (resource_type='message')
5. Escalation flag: flagged messages trigger Inngest event → supervisor notification
```

**Key files to own:**
```
app/api/communications/route.ts
app/api/communications/[channelId]/messages/route.ts
components/features/communications/MessageThread.tsx
components/features/communications/ChannelList.tsx
inngest/functions/message-escalation.ts
```

---

### INTEGRATION-AGENT
**Role:** EHR integration (FHIR R4) and external data sync

**PRD Ownership:** F7 EHR Integration (Epic MyChart Phase 1)
**Skill Set:** BE-03 (EHR FHIR), DB-05 (FHIR data modeling), DB-02 (migrations)

**Responsibilities:**
- Implement SMART on FHIR OAuth2 authentication with Epic
- Build FHIR resource transformers (Patient, Appointment, Practitioner)
- Build Inngest sync job (every 15 minutes)
- Build sync status dashboard for administrators
- Handle conflict resolution between EHR and platform data

**Operating instructions:**

```
1. Phase 1 scope: Epic FHIR R4 only. Cerner deferred to Phase 2.
   Use adapter pattern (lib/fhir/transformers/) for EHR portability.
2. FHIR sync is READ-ONLY for patient clinical data (Phase 1).
   Only appointment status can be written back to Epic.
3. Sync conflict resolution:
   - EHR wins: patient demographics, diagnoses, medications
   - Platform wins: visit notes, staff assignments, scheduling
4. Always write to ehr_sync_logs with: resource_type, count_synced, 
   count_errors, duration_ms, last_resource_id
5. On FHIR API error: retry 3 times via Inngest, then alert admin via email
6. FHIR tokens are short-lived — implement token refresh before expiry
```

**Key files to own:**
```
lib/fhir/client.ts
lib/fhir/transformers/patient.ts
lib/fhir/transformers/appointment.ts
lib/fhir/transformers/practitioner.ts
lib/fhir/validators.ts
app/api/integrations/ehr/sync/route.ts
inngest/functions/ehr-sync.ts
```

---

### COMPLIANCE-AGENT
**Role:** Credential management, compliance monitoring, incident reporting

**PRD Ownership:** F4 Real-Time Compliance Monitoring, F11 Incident Reporting, F12 Staff Credential Management
**Skill Set:** BE-05 (credential monitoring), BE-07 (incident workflow), FE-06 (compliance dashboard)

**Responsibilities:**
- Build credential repository with automated expiry monitoring
- Build tiered alert system (90/60/30/7 day reminders)
- Block scheduling for staff with lapsed credentials
- Build incident capture form with severity classification
- Build automated escalation workflows per severity tier
- Build root cause analysis and corrective action tracking
- Build compliance dashboard for administrators

**Operating instructions:**

```
1. Credential blocking rule:
   - expired credentials → staff.scheduling_eligible = false immediately
   - 7 days to expiry → warn but do not block
   - Never silently allow an expired credential to pass scheduling
2. Incident severity matrix:
   Severity 1 (Critical): Patient injury, medication error, abuse allegation
     → Notify: on-call administrator immediately (< 5 min)
     → Action: suspend staff pending investigation
   Severity 2 (Serious): Near-miss events, equipment failure, elopement
     → Notify: care coordinator + administrator (< 30 min)
   Severity 3 (Moderate): Documentation errors, missed visits, complaints
     → Notify: care coordinator (< 2 hours)
   Severity 4–5 (Minor): Process concerns, feedback
     → Log and review in weekly report
3. Corrective actions must have:
   - Assigned owner (user_id)
   - Due date (within 30 days for S1-S2)
   - Status tracking (open/in_progress/resolved)
4. All compliance events log to audit_logs AND compliance_events tables
```

**Key files to own:**
```
app/api/credentials/route.ts
app/api/compliance/route.ts
app/api/incidents/route.ts
components/features/compliance/CredentialTable.tsx
components/features/compliance/ExpiryTimeline.tsx
components/features/compliance/IncidentForm.tsx
inngest/functions/credential-expiry-check.ts
inngest/functions/incident-escalation.ts
inngest/functions/compliance-report.ts
```

---

### ANALYTICS-AGENT
**Role:** Quality metrics dashboard and operational reporting

**PRD Ownership:** F9 Quality Metrics Dashboard
**Skill Set:** FE-02 (dashboard layouts), DB-07 (aggregation queries), BE-01 (analytics API)

**Responsibilities:**
- Build the real-time KPI dashboard for administrators and coordinators
- Implement role-based dashboard views (coordinator vs. admin vs. billing)
- Build aggregation queries for all KPI metrics defined in PRD Section 3.2
- Build PDF/Excel export functionality
- Build trend charts and comparison views

**PRD KPIs to implement:**

| KPI | Target | Data Source |
|---|---|---|
| Patient Satisfaction Score | > 85% | visits.satisfaction_rating |
| Staff Utilization Rate | > 80% | visits / staff_schedules |
| Care Plan Adherence Rate | > 90% | visits vs. care_plans |
| Response Time to Patient Requests | < 2 hours | appointments.response_time |
| Regulatory Compliance % | 100% | compliance_records |
| System Uptime | 99.9% | External monitoring |
| Mobile App Engagement (DAU/MAU) | > 60% | PostHog (no PHI) |
| Integration Success Rate | > 98% | ehr_sync_logs |

**Operating instructions:**

```
1. Dashboard data must NEVER contain PHI — aggregate at org level
2. All analytics queries must run against read replicas (if available)
   or use Supabase's connection pooler to avoid impacting primary
3. Heavy aggregations should be pre-computed via Inngest cron and 
   cached in a analytics_snapshots table (refreshed hourly)
4. Export feature: PDF via browser print API; Excel via SheetJS
5. Role-based views:
   - coordinator: team metrics, patient visit status, schedule adherence
   - org_admin: full operational KPIs, staff performance, financial summary
   - billing_staff: billable hours, claim submission rates, revenue metrics
```

**Key files to own:**
```
app/api/analytics/route.ts
components/features/analytics/KPIWidget.tsx
components/features/analytics/OperationsDashboard.tsx
hooks/useOrganizationStats.ts
lib/analytics/aggregations.ts
```

---

### COORDINATOR-AGENT (ORCHESTRATOR)
**Role:** Cross-feature orchestration, session management, AGENTS.md maintenance

**PRD Ownership:** All features (coordination layer)
**Skill Set:** CM-01, CM-02, CM-03, CM-04, CM-05, CM-06

**Responsibilities:**
- Maintain `AGENTS.md` as the living project state
- Update feature status after each completed agent task
- Manage `TASKS.md` sprint backlog
- Maintain `BLOCKERS.md` — log and surface unresolved decisions
- Coordinate handoffs between specialized agents
- Ensure no two agents modify the same file in the same session
- Run new-session start protocol before any coding begins

**New session start protocol:**

```
1. Read doc/AGENTS.md → understand current project state
2. Read doc/SCHEMA.md → understand current database state
3. Read doc/BLOCKERS.md → check for unresolved blockers
4. Read doc/TASKS.md → identify current sprint priority
5. Confirm with operator: "Current state: [summary]. Proceeding with: [next task]. Confirm?"
6. After task complete: update AGENTS.md + TASKS.md + SCHEMA.md
```

---

## Part 3 — Global Agent Rules

### HIPAA Constraints (Non-Negotiable)

```
RULE 1: NEVER include PHI in any generated code as literal values
        → Use variable names and synthetic placeholders only

RULE 2: NEVER include real patient names, MRNs, SSNs, DOBs in:
        → Seed data files, test fixtures, example code, console.logs

RULE 3: ALWAYS add logAudit() call to every API route that reads/writes PHI

RULE 4: ALWAYS enable RLS immediately after CREATE TABLE
        → No table should exist without RLS for more than one migration

RULE 5: ALWAYS use soft delete (deleted_at) for clinical records
        → Never generate DELETE FROM for patients, visits, care_plans, medical_records

RULE 6: NEVER put PHI in error messages, HTTP response error bodies, or Sentry events

RULE 7: NEVER expose org_id, patient_id, or staff_id in URL paths except as UUIDs
        → No sequential IDs, no MRNs in URLs

RULE 8: When uncertain about HIPAA implication of a design decision:
        → STOP. Write to BLOCKERS.md. Do not guess.
```

### General Code Quality Rules

```
ALWAYS:
✓ Use TypeScript strict mode — never `any`
✓ Define Zod schemas before writing API handlers
✓ Use react-hook-form + zodResolver for all forms
✓ Use Server Components by default; add "use client" only when needed
✓ Add loading.tsx and error.tsx alongside every new page.tsx
✓ Use ActionResult<T> = {data: T; error: null} | {data: null; error: string} pattern
✓ Validate org_id in every query — never trust client-provided org context

NEVER:
✗ Use `any` types
✗ Skip RLS policies on new tables
✗ Use Supabase service role key in client components
✗ Import directly from @supabase/supabase-js in server code (use @/lib/supabase/server)
✗ Use Pages Router patterns
✗ Hard-delete clinical records
✗ Send real PHI to any external AI service
```

### File Ownership Rules

Agents must not modify files owned by another agent without coordination:

| Directory / File | Owner |
|---|---|
| `supabase/migrations/` | PLATFORM-AGENT |
| `src/types/database.types.ts` | PLATFORM-AGENT (auto-generated) |
| `lib/supabase/` | PLATFORM-AGENT |
| `lib/audit/` | PLATFORM-AGENT |
| `lib/permissions/` | PLATFORM-AGENT |
| `middleware.ts` | PLATFORM-AGENT |
| `lib/scheduling/` | SCHEDULER-AGENT |
| `app/api/schedules/` | SCHEDULER-AGENT |
| `components/features/schedule/` | SCHEDULER-AGENT |
| `apps/mobile/src/screens/DocumentationScreen.tsx` | DOCUMENTATION-AGENT |
| `apps/mobile/src/lib/offline/` | DOCUMENTATION-AGENT |
| `app/api/visits/` | DOCUMENTATION-AGENT |
| `lib/geo/` | GEO-AGENT |
| `app/api/tracking/` | GEO-AGENT |
| `components/features/schedule/StaffMapView.tsx` | GEO-AGENT |
| `app/api/communications/` | COMMS-AGENT |
| `components/features/communications/` | COMMS-AGENT |
| `lib/fhir/` | INTEGRATION-AGENT |
| `app/api/integrations/` | INTEGRATION-AGENT |
| `app/api/credentials/` | COMPLIANCE-AGENT |
| `app/api/incidents/` | COMPLIANCE-AGENT |
| `components/features/compliance/` | COMPLIANCE-AGENT |
| `inngest/functions/` | Owning agent per function (see agent descriptions) |
| `app/api/analytics/` | ANALYTICS-AGENT |
| `components/features/analytics/` | ANALYTICS-AGENT |
| `doc/` | COORDINATOR-AGENT |

---

## Part 4 — Agent Invocation Examples

### Invoking PLATFORM-AGENT via Claude Code

```bash
# Generate full healthcare database schema
claude "You are PLATFORM-AGENT for the Healthcare Workforce Management Platform.

Context files:
- PRD: $(cat doc/PRD.md)
- Current schema: $(cat doc/SCHEMA.md)
- Existing migrations: $(ls supabase/migrations/)

Task: Generate the complete initial database schema migration covering all core entities:
organizations, profiles, patients, care_teams, care_team_members, staff_schedules,
appointments, visits, visit_notes, credentials, compliance_records, incidents, audit_logs.

Requirements:
- All tables get org_id FK to organizations
- All PHI tables get RLS policies using healthcare role hierarchy
- All mutable tables get updated_at triggers
- All clinical tables get deleted_at soft delete
- Generate Mermaid ER diagram after schema

Output: supabase/migrations/20260301000000_initial_schema.sql"
```

### Invoking SCHEDULER-AGENT via Claude Code

```bash
# Build the scheduling engine
claude "You are SCHEDULER-AGENT for the Healthcare Workforce Management Platform.

Context:
- Schema: $(cat doc/SCHEMA.md)
- Feature spec: $(grep -A 50 'F3.*Staff Scheduling' doc/PRD.md)
- Types: $(cat src/types/database.types.ts)

Task: Implement lib/scheduling/matcher.ts — the core staff-to-patient matching algorithm.

Algorithm requirements:
1. Filter by credential validity (nurses must have valid license + required certifications)
2. Filter by availability (no overlapping appointments within 2h travel buffer)
3. Filter by weekly hour limits (< 40 hours for full-time, < 25 for part-time)
4. Score remaining candidates by:
   - Distance to patient address (PostGIS — lower is better)
   - Continuity score (has the nurse seen this patient before? +20 points)
   - Last assignment recency (prefer nurses not recently overloaded)
5. Return top 3 candidates per visit slot with scores and reasoning

Output full TypeScript implementation with types."
```

### Invoking COMPLIANCE-AGENT via Claude Code

```bash
# Build credential expiry monitoring
claude "You are COMPLIANCE-AGENT for the Healthcare Workforce Management Platform.

Context:
- Schema: $(cat doc/SCHEMA.md) 
- Feature spec F12: $(grep -A 30 'F12' doc/PRD.md)
- Inngest client: $(cat inngest/client.ts)

Task: Implement inngest/functions/credential-expiry-check.ts

Requirements:
- Runs: daily at 6 AM UTC (cron)
- Step 1: Query credentials expiring within 90 days grouped by (90d, 60d, 30d, 7d, expired)
- Step 2: Send Resend email alerts to each affected staff member (tiered message urgency)
- Step 3: Send summary to care coordinator for each affected staff member
- Step 4: For EXPIRED credentials → set staff.scheduling_eligible = false
- Step 5: Log all actions to compliance_events table
- Use step.run() for each step (Inngest durable steps)
- No PHI in email bodies — only staff name and credential type"
```

---

## Part 5 — Sprint Backlog (Phase 1 MVP)

### Sprint 1 (Weeks 1–2) — Foundation

| Task ID | Task | Agent | Skill | Status |
|---|---|---|---|---|
| T-001 | Full database schema migration | PLATFORM-AGENT | DB-01 | 🔴 |
| T-002 | RLS policies for all PHI tables | PLATFORM-AGENT | DB-03 | 🔴 |
| T-003 | Audit log table + triggers | PLATFORM-AGENT | DB-04 | 🔴 |
| T-004 | Supabase Auth + MFA setup | PLATFORM-AGENT | BE-04 | 🔴 |
| T-005 | RBAC middleware (Next.js) | PLATFORM-AGENT | BE-05 | 🔴 |
| T-006 | TypeScript types generation | PLATFORM-AGENT | DB-03 | 🔴 |
| T-007 | Sentry setup with PHI scrubbing | PLATFORM-AGENT | SEC-01 | 🔴 |

### Sprint 2 (Weeks 3–4) — Core Backend

| Task ID | Task | Agent | Skill | Status |
|---|---|---|---|---|
| T-008 | Patient + visit API routes | DOCUMENTATION-AGENT | BE-01 | 🔴 |
| T-009 | Staff scheduling algorithm | SCHEDULER-AGENT | BE-04 | 🔴 |
| T-010 | Credential monitoring cron | COMPLIANCE-AGENT | BE-05 | 🔴 |
| T-011 | Incident reporting API + workflow | COMPLIANCE-AGENT | BE-07 | 🔴 |
| T-012 | GPS tracking API | GEO-AGENT | BE-06 | 🔴 |
| T-013 | Route optimization service | GEO-AGENT | BE-06 | 🔴 |
| T-014 | HIPAA messaging API | COMMS-AGENT | BE-02 | 🔴 |

### Sprint 3 (Weeks 5–6) — Frontend & Mobile

| Task ID | Task | Agent | Skill | Status |
|---|---|---|---|---|
| T-015 | Coordinator dashboard layout | ANALYTICS-AGENT | FE-02 | 🔴 |
| T-016 | Mobile visit documentation form | DOCUMENTATION-AGENT | FE-03 | 🔴 |
| T-017 | Offline sync queue (mobile) | DOCUMENTATION-AGENT | FE-03 | 🔴 |
| T-018 | Real-time staff location map | GEO-AGENT | FE-04 | 🔴 |
| T-019 | Credential dashboard | COMPLIANCE-AGENT | FE-06 | 🔴 |
| T-020 | Schedule grid (drag-and-drop) | SCHEDULER-AGENT | FE-02 | 🔴 |
| T-021 | Patient care timeline | DOCUMENTATION-AGENT | FE-05 | 🔴 |
| T-022 | TanStack Query hooks (all features) | (all agents) | FE-07 | 🔴 |

### Sprint 4 (Weeks 7–8) — EHR Integration + Analytics

| Task ID | Task | Agent | Skill | Status |
|---|---|---|---|---|
| T-023 | Epic FHIR OAuth2 + client | INTEGRATION-AGENT | BE-03 | 🔴 |
| T-024 | FHIR Patient/Appointment transformers | INTEGRATION-AGENT | DB-05 | 🔴 |
| T-025 | EHR sync Inngest job | INTEGRATION-AGENT | BE-03 | 🔴 |
| T-026 | KPI metrics aggregations | ANALYTICS-AGENT | DB-07 | 🔴 |
| T-027 | Analytics dashboard components | ANALYTICS-AGENT | FE-02 | 🔴 |
| T-028 | Billing capture at point of care | DOCUMENTATION-AGENT | BE-08 | 🔴 |
| T-029 | E2E tests for auth + scheduling | COORDINATOR-AGENT | TE-04 | 🔴 |
| T-030 | RLS policy tests | PLATFORM-AGENT | TE-05 | 🔴 |

---

## Part 6 — Open Blockers

> **Add blockers here when an agent encounters a decision requiring human input.**
> Format: `[OPEN] Description — Blocked task — Question — Impact`

*No open blockers at project start. Agents: add blockers here as they arise.*

---

## Part 7 — HIPAA Decision Log (Summary)

> Full decisions in `doc/HIPAA_DECISIONS.md`. Summary only here.

| Decision | Choice | Date | Status |
|---|---|---|---|
| Primary PHI store | Supabase (RLS + AES-256) | Init | ✅ Final |
| Message encryption | Transport + at-rest (no app-layer E2E, Phase 1) | Init | ⚠️ Review Phase 2 |
| Audit log retention | 6 years (HIPAA minimum) | Init | ✅ Final |
| GPS data retention | 90 days (unless incident) | Init | ✅ Final |
| MFA enforcement | Required for all staff (TOTP via Supabase Auth) | Init | ✅ Final |
| PHI in push notifications | Prohibited — use silent push + app fetch | Init | ✅ Final |

---

*AGENTS.md v1.0 · Healthcare Workforce Management Platform · Update after every session*
*Next review checkpoint: After Sprint 1 completion*
