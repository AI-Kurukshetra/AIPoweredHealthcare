# 🏗️ architecture.md
## AI-Powered Healthcare Workforce & Operations Management Platform
### Stack: Next.js (App Router) · Supabase · React Native · Vercel · TypeScript

> **Version:** 1.0 · **Domain:** Healthcare (HIPAA) · **Reference:** PRD v1.0 (March 2026)
>
> **Purpose:** Definitive architecture reference for AI coding agents and human developers building this platform. Every architectural decision is documented with healthcare-domain rationale. Agents must read this before generating any code.

---

## Part 1 — Build vs. Leverage: Healthcare Edition

### The Three-Question Test (Healthcare Context)

```
Q1: Is this capability UNIQUE to healthcare workflow management?
    └─ YES  → Build custom. This is clinical moat.
    └─ NO   → Continue to Q2.

Q2: Does a MATURE solution handle this reliably AND maintain HIPAA BAA?
    └─ YES  → Integration cost < 2 days?
              ├─ YES → Use it. Confirm BAA.
              └─ NO  → Evaluate SaaS alternative.
    └─ NO   → Continue to Q3.

Q3: Does a SaaS tool exist with a HIPAA BAA and good API?
    └─ YES  → Use SaaS tool. Sign BAA before any PHI flows.
    └─ NO   → Build minimal HIPAA-compliant custom implementation.
```

### Decision Matrix

| Capability | Decision | Healthcare Rationale |
|---|---|---|
| **Auth** | Supabase Auth | HIPAA-compliant; supports MFA (required for PHI access) |
| **Database** | Supabase + RLS + pgvector | PHI stays in one audited system; RLS enforces access |
| **Mobile** | React Native (Expo) | Single codebase for iOS/Android field workers; offline-first support |
| **Offline Sync** | Custom + WatermelonDB | Clinical notes must survive connectivity loss |
| **Messaging** | Custom encrypted (Supabase) | HIPAA messaging requires BAA; Twilio for SMS fallback only |
| **GPS Tracking** | Google Maps APIs | No PHI sent; consent-gated; BAA not required |
| **Background Jobs** | Inngest | Credential expiry checks, EHR sync, escalation workflows |
| **Email** | Resend + React Email | HIPAA BAA available; transactional notifications only |
| **EHR Integration** | FHIR R4 + fhir-kit-client | Industry standard; Epic/Cerner compatible |
| **Push Notifications** | Expo Notifications + FCM/APNs | No PHI in push payload; deep link to app for content |
| **File Storage** | Supabase Storage (encrypted) | Clinical documents, photo evidence — PHI requires encryption |
| **Vector Search** | Supabase pgvector | Clinical note semantic search within existing HIPAA boundary |
| **Error Monitoring** | Sentry (PHI scrubbing enabled) | Must configure data scrubbing — NO PHI in Sentry |
| **Analytics** | PostHog (self-hosted or EU region) | Usage analytics only; no PHI |
| **Business Logic** | Build custom | Scheduling engine, FHIR transformers, compliance rules — clinical moat |

---

## Part 2 — Repository Structure

```
healthcare-platform/
│
├── apps/
│   ├── web/                              # Next.js web app (coordinators, admins)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (auth)/
│   │   │   │   │   ├── login/page.tsx
│   │   │   │   │   ├── mfa/page.tsx     # MFA required for PHI access
│   │   │   │   │   └── auth/callback/route.ts
│   │   │   │   │
│   │   │   │   ├── (app)/
│   │   │   │   │   ├── layout.tsx       # App shell + role-based nav
│   │   │   │   │   ├── dashboard/page.tsx
│   │   │   │   │   ├── patients/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── [id]/
│   │   │   │   │   │       ├── page.tsx
│   │   │   │   │   │       └── care-plan/page.tsx
│   │   │   │   │   ├── schedule/
│   │   │   │   │   │   ├── page.tsx     # Coordinator schedule view
│   │   │   │   │   │   └── auto-assign/page.tsx
│   │   │   │   │   ├── staff/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── [id]/credentials/page.tsx
│   │   │   │   │   ├── compliance/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── incidents/page.tsx
│   │   │   │   │   ├── communications/page.tsx
│   │   │   │   │   ├── analytics/page.tsx
│   │   │   │   │   └── billing/page.tsx
│   │   │   │   │
│   │   │   │   └── api/
│   │   │   │       ├── patients/
│   │   │   │       │   ├── route.ts
│   │   │   │       │   └── [id]/
│   │   │   │       │       ├── route.ts
│   │   │   │       │       └── visits/route.ts
│   │   │   │       ├── schedules/
│   │   │   │       │   ├── route.ts
│   │   │   │       │   └── auto-assign/route.ts
│   │   │   │       ├── visits/route.ts
│   │   │   │       ├── staff/route.ts
│   │   │   │       ├── credentials/route.ts
│   │   │   │       ├── compliance/route.ts
│   │   │   │       ├── incidents/route.ts
│   │   │   │       ├── communications/route.ts
│   │   │   │       ├── billing/route.ts
│   │   │   │       ├── tracking/location/route.ts
│   │   │   │       ├── routes/optimize/route.ts
│   │   │   │       ├── integrations/
│   │   │   │       │   └── ehr/sync/route.ts
│   │   │   │       ├── analytics/route.ts
│   │   │   │       └── webhooks/
│   │   │   │           ├── stripe/route.ts
│   │   │   │           └── ehr/route.ts
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── ui/                  # Shadcn/ui (DO NOT EDIT)
│   │   │   │   ├── layout/
│   │   │   │   │   ├── AppShell.tsx
│   │   │   │   │   ├── Sidebar.tsx      # Role-aware nav links
│   │   │   │   │   └── TopBar.tsx
│   │   │   │   ├── features/
│   │   │   │   │   ├── patients/
│   │   │   │   │   │   ├── PatientCard.tsx
│   │   │   │   │   │   ├── PatientTable.tsx
│   │   │   │   │   │   ├── CareTimeline.tsx
│   │   │   │   │   │   └── CareTeamPanel.tsx
│   │   │   │   │   ├── schedule/
│   │   │   │   │   │   ├── ScheduleGrid.tsx
│   │   │   │   │   │   ├── StaffMapView.tsx
│   │   │   │   │   │   └── AutoAssignPanel.tsx
│   │   │   │   │   ├── compliance/
│   │   │   │   │   │   ├── CredentialTable.tsx
│   │   │   │   │   │   ├── ExpiryTimeline.tsx
│   │   │   │   │   │   └── IncidentForm.tsx
│   │   │   │   │   ├── communications/
│   │   │   │   │   │   ├── MessageThread.tsx
│   │   │   │   │   │   └── ChannelList.tsx
│   │   │   │   │   └── analytics/
│   │   │   │   │       ├── KPIWidget.tsx
│   │   │   │   │       └── OperationsDashboard.tsx
│   │   │   │   └── shared/
│   │   │   │       ├── PHIGuard.tsx     # Wraps PHI display; logs access
│   │   │   │       ├── OfflineIndicator.tsx
│   │   │   │       ├── AuditBadge.tsx
│   │   │   │       ├── EmptyState.tsx
│   │   │   │       └── ConfirmDialog.tsx
│   │   │   │
│   │   │   ├── lib/
│   │   │   │   ├── supabase/
│   │   │   │   │   ├── server.ts        # createServerClient
│   │   │   │   │   ├── client.ts        # createBrowserClient
│   │   │   │   │   └── middleware.ts
│   │   │   │   ├── fhir/
│   │   │   │   │   ├── client.ts        # FHIR R4 API client
│   │   │   │   │   ├── transformers/    # FHIR ↔ internal model
│   │   │   │   │   │   ├── patient.ts
│   │   │   │   │   │   ├── appointment.ts
│   │   │   │   │   │   └── practitioner.ts
│   │   │   │   │   └── validators.ts
│   │   │   │   ├── scheduling/
│   │   │   │   │   ├── matcher.ts       # Credential + geo + hours matching
│   │   │   │   │   └── conflicts.ts     # Conflict detection
│   │   │   │   ├── compliance/
│   │   │   │   │   ├── rules.ts         # CMS/Joint Commission rules
│   │   │   │   │   └── checkers.ts
│   │   │   │   ├── audit/
│   │   │   │   │   └── log.ts           # Centralized audit logging helper
│   │   │   │   ├── geo/
│   │   │   │   │   ├── routing.ts       # Google Maps route optimization
│   │   │   │   │   └── distance.ts
│   │   │   │   ├── billing/
│   │   │   │   │   ├── cpt-mapper.ts    # Service → CPT code mapping
│   │   │   │   │   └── claims.ts
│   │   │   │   ├── validations/
│   │   │   │   │   ├── patient.ts
│   │   │   │   │   ├── visit.ts
│   │   │   │   │   ├── credential.ts
│   │   │   │   │   └── incident.ts
│   │   │   │   ├── permissions/
│   │   │   │   │   ├── roles.ts         # Healthcare role definitions
│   │   │   │   │   └── hasPermission.ts
│   │   │   │   ├── hipaa/
│   │   │   │   │   ├── scrubber.ts      # Strip PHI from error logs
│   │   │   │   │   └── phi-fields.ts    # PHI field registry
│   │   │   │   └── utils.ts
│   │   │   │
│   │   │   ├── hooks/
│   │   │   │   ├── useCurrentUser.ts
│   │   │   │   ├── usePatients.ts
│   │   │   │   ├── useVisits.ts
│   │   │   │   ├── useSchedule.ts
│   │   │   │   ├── useCredentials.ts
│   │   │   │   ├── useComplianceAlerts.ts
│   │   │   │   ├── useIncidents.ts
│   │   │   │   ├── useRealtimeLocation.ts  # Supabase Realtime GPS
│   │   │   │   └── useOrganizationStats.ts
│   │   │   │
│   │   │   ├── stores/
│   │   │   │   ├── ui.ts               # Sidebar, modal state
│   │   │   │   └── offline-queue.ts    # Pending mutation queue
│   │   │   │
│   │   │   └── types/
│   │   │       ├── database.types.ts   # AUTO-GENERATED by Supabase CLI
│   │   │       ├── fhir.types.ts       # FHIR R4 type definitions
│   │   │       └── app.types.ts        # Domain types (HealthcareRole, etc.)
│   │   │
│   │   └── middleware.ts               # Auth + MFA + role guards
│   │
│   └── mobile/                         # React Native (Expo) — field workers
│       ├── src/
│       │   ├── screens/
│       │   │   ├── TodayScreen.tsx      # Daily schedule for nurse
│       │   │   ├── PatientVisitScreen.tsx
│       │   │   ├── DocumentationScreen.tsx
│       │   │   ├── MessagingScreen.tsx
│       │   │   └── ProfileScreen.tsx
│       │   ├── components/
│       │   ├── hooks/
│       │   ├── lib/
│       │   │   ├── offline/
│       │   │   │   ├── queue.ts         # Pending mutations queue
│       │   │   │   └── sync.ts          # Background sync manager
│       │   │   └── supabase/
│       │   │       └── client.ts        # Supabase mobile client
│       │   └── navigation/
│       └── app.json
│
├── packages/
│   └── shared/                          # Shared types + validators
│       ├── types/
│       └── validations/
│
├── inngest/                             # Background job functions
│   ├── client.ts
│   └── functions/
│       ├── credential-expiry-check.ts   # Nightly credential scan
│       ├── ehr-sync.ts                  # FHIR sync every 15 min
│       ├── incident-escalation.ts       # Severity-based escalation
│       ├── route-optimization.ts        # Morning route pre-computation
│       └── compliance-report.ts         # Weekly report generation
│
├── supabase/
│   ├── migrations/
│   │   ├── 20260301000000_initial_schema.sql
│   │   ├── 20260301000001_rls_policies.sql
│   │   ├── 20260301000002_audit_triggers.sql
│   │   └── 20260301000003_fhir_columns.sql
│   ├── seed.sql                         # Synthetic (non-PHI) seed data
│   └── config.toml
│
├── emails/
│   ├── CredentialExpiryAlert.tsx
│   ├── IncidentEscalation.tsx
│   ├── ShiftReminder.tsx
│   └── WelcomeStaff.tsx
│
├── tests/
│   ├── e2e/
│   │   ├── auth.spec.ts
│   │   ├── visit-documentation.spec.ts
│   │   └── scheduling.spec.ts
│   ├── integration/
│   │   ├── scheduling.test.ts
│   │   ├── fhir-transformer.test.ts
│   │   └── rls-policies.test.ts        # RLS enforcement tests (critical)
│   └── fixtures/
│       └── synthetic-patients.ts       # Faker-generated, never real PHI
│
└── doc/
    ├── AGENTS.md                        # AI agent operating instructions
    ├── SCHEMA.md                        # Current schema state for agents
    ├── HIPAA_DECISIONS.md               # HIPAA architectural decisions log
    ├── BLOCKERS.md                      # Open blockers for human resolution
    └── TASKS.md                         # Current sprint task list
```

---

## Part 3 — Database Schema Architecture

### Core Entity Groups

**Group 1 — Identity & Organization**
```sql
-- Platform tenancy
organizations        -- Healthcare agencies/facilities
organization_members -- Staff belonging to an org with role
profiles             -- Extends auth.users with healthcare-specific fields

-- Healthcare roles (enforced in RLS)
CREATE TYPE healthcare_role AS ENUM (
  'super_admin',       -- Anthropic/platform level
  'org_admin',         -- Agency administrator
  'care_coordinator',  -- Manages care teams and schedules
  'field_nurse',       -- Mobile field healthcare worker
  'billing_staff',     -- Claims and billing access
  'patient'            -- Patient portal access (Phase 2)
);
```

**Group 2 — Clinical Entities (PHI — all behind RLS)**
```sql
patients             -- Patient demographics, contact, insurance -- PHI
care_teams           -- Team assignments per patient
care_team_members    -- Staff ↔ care team mappings
medical_records      -- Clinical history references -- PHI
care_plans           -- Active care plans per patient -- PHI
medications          -- Patient medication lists -- PHI
```

**Group 3 — Field Operations**
```sql
staff_schedules      -- Assigned visits per day per staff member
appointments         -- Planned patient visits
visits               -- Completed visit records with documentation
visit_notes          -- Clinical notes from visits -- PHI
visit_photos         -- Photo evidence (stored in Supabase Storage)
location_events      -- GPS check-ins per staff member (time-series)
```

**Group 4 — Compliance & Credentials**
```sql
credentials          -- Staff licenses, certifications, training records
compliance_records   -- Compliance check results and events
compliance_alerts    -- Active alerts requiring action
incidents            -- Reported incidents with severity
corrective_actions   -- Tasks created from incident resolution
```

**Group 5 — Equipment & Inventory**
```sql
equipment            -- Medical equipment catalog per org
equipment_assignments -- Equipment checked out to staff
inventory            -- Supply stock per location
inventory_transactions -- Stock movements for audit
```

**Group 6 — Communications**
```sql
channels             -- Patient-scoped or team-scoped message channels
messages             -- Encrypted messages within channels
message_reads        -- Read receipts per recipient
notifications        -- Push/email notifications log
```

**Group 7 — Billing**
```sql
billing_records      -- Billable services captured at point of care
insurance_claims     -- Claims submitted to payers
claim_status_events  -- Claim lifecycle tracking
```

**Group 8 — System**
```sql
audit_logs           -- HIPAA-required access and change log
ehr_sync_logs        -- FHIR integration sync history
```

### Mandatory Table Conventions

Every table in this schema **must** include:

```sql
-- Identity
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()

-- Multi-tenancy (all non-auth tables)
org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE

-- Audit timestamps
created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()

-- Change tracking
created_by      UUID REFERENCES auth.users(id)
updated_by      UUID REFERENCES auth.users(id)

-- Soft delete (PHI tables — never hard delete)
deleted_at      TIMESTAMPTZ  -- NULL = active

-- Version control for conflict detection
version         INT NOT NULL DEFAULT 1
```

### RLS Policy Pattern (All PHI Tables)

```sql
-- 1. Enable RLS
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- 2. Base read policy — org members only
CREATE POLICY "visits_read_org_members"
ON visits FOR SELECT
USING (
  org_id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid() AND status = 'active'
  )
  AND deleted_at IS NULL
);

-- 3. Scoped read — field nurses see only assigned patients
CREATE POLICY "visits_read_assigned_nurse"
ON visits FOR SELECT
USING (
  assigned_staff_id = auth.uid()
  AND deleted_at IS NULL
);

-- 4. Write — nurse can create visits for their assigned patients
CREATE POLICY "visits_insert_assigned_nurse"
ON visits FOR INSERT
WITH CHECK (
  assigned_staff_id = auth.uid()
  AND org_id IN (
    SELECT org_id FROM organization_members WHERE user_id = auth.uid()
  )
);

-- 5. Admin override within org
CREATE POLICY "visits_admin_full_access"
ON visits FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM organization_members
    WHERE user_id = auth.uid()
    AND org_id = visits.org_id
    AND role IN ('org_admin', 'care_coordinator')
    AND status = 'active'
  )
);
```

---

## Part 4 — API Architecture

### Request Lifecycle (All Healthcare Routes)

```
Incoming Request
    │
    ▼
middleware.ts
    ├─ Verify Supabase session → 401 if missing
    ├─ Check MFA status → redirect if not verified
    └─ Inject org context
    │
    ▼
API Route Handler
    ├─ requireAuth(request)           → 401 if session invalid
    ├─ requireOrgMembership(user, orgId) → 403 if not member
    ├─ Zod.parse(requestBody)         → 422 if invalid input
    ├─ logAudit({ actor, resource, action }) → writes audit_logs
    ├─ Supabase query (RLS enforced)  → data or null
    └─ Return typed response (no PHI in errors)
```

### Standard Response Types

```typescript
// Success
type ApiSuccess<T> = { data: T; error: null }

// Error — PHI NEVER in error messages
type ApiError = {
  data: null
  error: {
    code: string        // "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "VALIDATION_ERROR"
    message: string     // Human-readable, PHI-safe
    details?: Record<string, string[]>  // Validation errors only
  }
}

type ApiResponse<T> = ApiSuccess<T> | ApiError
```

### Audit Log Helper

```typescript
// lib/audit/log.ts
// Call this in EVERY route that touches PHI
export async function logAudit({
  supabase,
  actorId,
  orgId,
  resourceType,
  resourceId,
  action,
  ipAddress,
  userAgent,
}: AuditLogParams) {
  await supabase.from('audit_logs').insert({
    actor_id: actorId,
    org_id: orgId,
    resource_type: resourceType,
    resource_id: resourceId,
    action,       // 'READ' | 'CREATE' | 'UPDATE' | 'DELETE' | 'EXPORT'
    ip_address: ipAddress,
    user_agent: userAgent,
    occurred_at: new Date().toISOString(),
  })
  // Non-blocking — log failure should NOT block the primary operation
}
```

---

## Part 5 — Offline Architecture (Mobile)

```
Mobile App
    │
    ├─ Online path: Supabase client → direct queries → real-time UI
    │
    └─ Offline path:
        ├─ WatermelonDB local SQLite → immediate UI (no delay)
        ├─ Mutation queue (IndexedDB/SQLite) → pending ops logged
        └─ Background sync service:
            ├─ Detects connectivity restored
            ├─ Replays queued mutations in order
            ├─ Conflict resolution: server wins for schedule data
            │                      local wins for clinical notes
            └─ Syncs remote changes to local WatermelonDB
```

**Offline-capable features (MVP):**
- View today's assigned visits (pre-fetched at session start)
- Complete visit documentation forms
- Read patient care notes (cached at visit start)
- Draft messages (queued for delivery)

**Requires connectivity:**
- Schedule changes
- New patient assignments
- GPS location reporting
- EHR data sync

---

## Part 6 — HIPAA Security Architecture

```
Data at Rest
    ├─ Supabase Postgres: AES-256 encryption (platform default)
    ├─ PHI columns with extra sensitivity (SSN, insurance): column-level encryption via pgcrypto
    ├─ Supabase Storage: AES-256, private buckets only (no public URLs for clinical docs)
    └─ Mobile device: WatermelonDB encrypted with device biometric key

Data in Transit
    ├─ TLS 1.2+ enforced on all connections (Supabase + Vercel default)
    ├─ Mobile ↔ API: Certificate pinning for React Native app
    └─ Internal service calls: Same TLS; no plaintext service mesh

Access Control
    ├─ MFA required for all staff with PHI access
    ├─ Session timeout: 15 min idle (web), 30 min idle (mobile with biometric re-auth)
    ├─ RLS: Org-level + role-level on every PHI table
    └─ No service role key in frontend code — ever

Audit
    ├─ Every PHI read/write → audit_logs
    ├─ Audit logs: append-only (no UPDATE/DELETE policies)
    ├─ Retention: 6 years minimum (HIPAA requirement)
    └─ Export capability for compliance investigations

PHI Scrubbing
    └─ Sentry: Configure beforeSend to strip known PHI fields
       Supabase logs: Verify query logging excludes PHI values
       Error messages: Use opaque error codes, never patient data
```

---

## Part 7 — EHR Integration Architecture (FHIR)

```
FHIR Sync Pipeline (Epic / Cerner)

Epic/Cerner FHIR API
    │
    ▼
SMART on FHIR Auth (OAuth2)
    │ Access token (short-lived)
    ▼
Inngest Job: ehr-sync (runs every 15 min)
    │
    ├─ Fetch changed resources since last sync
    │   (Patient, Appointment, Practitioner, Condition, MedicationRequest)
    │
    ├─ Transform: FHIR R4 → Internal schema (lib/fhir/transformers/)
    │
    ├─ Upsert to Supabase (conflict resolution: EHR wins for clinical data)
    │
    ├─ Write to ehr_sync_logs (resource_type, count, errors, duration)
    │
    └─ Emit events for downstream processing
        ├─ patient.updated → invalidate cache
        └─ appointment.created → trigger schedule update
```

**FHIR Resource Mapping (Phase 1 — Epic):**

| FHIR Resource | Internal Table | Sync Direction |
|---|---|---|
| `Patient` | `patients` | Epic → Platform |
| `Practitioner` | `profiles` | Epic → Platform |
| `Appointment` | `appointments` | Bidirectional |
| `Condition` | `medical_records` | Epic → Platform |
| `MedicationRequest` | `medications` | Epic → Platform |
| `Observation` (vitals) | `visit_notes` (JSONB field) | Platform → Epic |

---

## Part 8 — Agent Instructions (CLAUDE.md content)

```markdown
# CLAUDE.md — Healthcare Platform Agent Instructions

## Domain Context
This is a HIPAA-regulated healthcare workforce management platform.
All agents must treat patient data (PHI) with maximum care.
When uncertain about a HIPAA implication, STOP and escalate to BLOCKERS.md.

## Stack
- Next.js 15 App Router + TypeScript strict mode (web)
- React Native + Expo (mobile)
- Supabase (Auth, Postgres, Storage, Realtime)
- Inngest (background jobs)
- Tailwind CSS + Shadcn/ui (web)
- React Native Paper (mobile)

## Healthcare Roles
Field access to PHI is scoped by role: super_admin > org_admin >
care_coordinator > field_nurse > billing_staff > patient.
RLS enforces this — never trust role from client; always verify from DB.

## HIPAA Rules — Non-Negotiable
1. NEVER include PHI in error messages, logs, or API error responses
2. ALWAYS call logAudit() in every route that reads or writes PHI
3. NEVER hard-delete patient records — use deleted_at soft delete
4. ALWAYS add org_id FK to every new table
5. ALWAYS enable RLS immediately when creating a new table
6. NEVER put the Supabase service role key in frontend code
7. ALWAYS use column-level encryption for SSN, DOB, insurance IDs
8. Sentry must have PHI scrubbing configured before any production deploy

## Code Patterns
- Data fetching: Server components for initial page data
- Forms: react-hook-form + zodResolver + server actions
- PHI display: Wrap in <PHIGuard> component (logs access)
- Audit: import { logAudit } from '@/lib/audit/log'
- Auth: import { createClient } from '@/lib/supabase/server' (server only)
- Errors: Never expose PHI; use opaque error codes
- Offline: All mobile mutations must go through the offline queue

## Database Rules
- Enable RLS immediately on every new table
- Add org_id FK on every multi-tenant table
- Add audit columns (created_by, updated_by, version) on every mutable table
- Run `supabase gen types` after every migration
- Update SCHEMA.md after every schema change

## What NOT to do
- Do not use Supabase client in client components for PHI mutations
- Do not skip RLS policies on any table
- Do not expose patient identifiers in URL paths (use UUIDs, not MRNs)
- Do not log PHI to Sentry or console
- Do not use `any` types
- Do not hard-delete any clinical record
```

---

## Part 9 — Technology Decision Log

| Decision | Choice | Healthcare Rationale | Date |
|---|---|---|---|
| Auth | Supabase Auth + MFA | HIPAA requires MFA for workforce apps; Supabase has BAA | MVP |
| PHI Storage | Supabase Postgres (RLS) | Single HIPAA boundary; RLS eliminates application-layer bypass | MVP |
| Mobile framework | React Native (Expo) | Single codebase for iOS/Android; Expo handles OTA updates | MVP |
| Offline sync | Custom queue + WatermelonDB | Clinical notes must not be lost due to connectivity | MVP |
| EHR integration | FHIR R4 + fhir-kit-client | Epic/Cerner both support FHIR R4; portable across EHRs | MVP |
| Messaging | Custom encrypted (Supabase) | HIPAA messaging is complex; keep PHI in one system boundary | MVP |
| Background jobs | Inngest | Credential expiry + EHR sync need reliability + retries | MVP |
| GPS | Google Maps APIs | No PHI sent to Google; consent-gated; BAA not required | MVP |
| Error monitoring | Sentry (PHI scrubbed) | Industry standard; configurable data scrubbing for PHI | MVP |
| Email | Resend (HIPAA BAA) | Best DX; HIPAA BAA available; no PHI in email bodies | MVP |
| File storage | Supabase Storage | Same HIPAA boundary as DB; private buckets; signed URLs | MVP |

---

*Architecture v1.0 · Healthcare Domain · HIPAA-Regulated · Review before every sprint*
*All HIPAA decisions must be logged in HIPAA_DECISIONS.md*
