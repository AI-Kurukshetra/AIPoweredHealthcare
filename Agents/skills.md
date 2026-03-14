# 🧠 skills.md
## Modular AI-Assisted Development Skills
### Platform: AI-Powered Healthcare Workforce & Operations Management
### Stack: Next.js (App Router) · Supabase · Vercel · TypeScript · React Native

> **Purpose:** A complete taxonomy of modular, callable skills for autonomously building and maintaining the Healthcare Workforce & Operations Management platform. Each skill maps directly to a PRD feature or architecture concern.
>
> **Domain Context:** Home healthcare agencies, visiting nurse services, mobile field workers. All data is HIPAA-regulated. All features require audit trails. Patient safety is the highest priority.
>
> **How to use:** Each skill is a discrete unit of work. An AI agent (Claude Code, Cursor, Copilot Workspace) can invoke any skill by providing the listed inputs and expect the listed outputs. Skills are composable — chain them to build complete features.

---

## Implementation Tag Key

| Tag | Meaning |
|---|---|
| `[AI-AGENT]` | Best implemented by an AI coding agent (Claude Code, Cursor) |
| `[OSS-LIB]` | Best handled by an open-source library or CLI tool |
| `[SAAS-TOOL]` | Best delegated to an external SaaS platform |
| `[AI-AGENT + OSS]` | AI agent generates the code; OSS library executes or scaffolds it |
| `[AI-AGENT + SAAS]` | AI agent generates config/logic; SaaS platform runs the infrastructure |
| `[HIPAA-CRITICAL]` | Extra review required — touches PHI, audit trails, or access control |

---

## Category 1 — Database Skills (Healthcare Domain)

---

### DB-01 · Healthcare Schema Design

**Description:** Design a normalized, HIPAA-compliant Postgres schema for the healthcare workforce platform. Covers patients, staff, care teams, appointments, visit documentation, credentials, compliance records, and billing entities. All tables with PHI must have audit trigger columns and enforce org-level isolation via `org_id`.

**Example usage:** Given "build the patient + care team coordination module", generate tables for `patients`, `care_teams`, `care_team_members`, `appointments`, `visits`, `care_notes` with UUIDs, correct FK cascade rules, `created_at`/`updated_at` triggers, `deleted_at` soft-delete columns, and PHI-flag comments.

| Property | Detail |
|---|---|
| **Inputs** | PRD feature spec (e.g., F1 Patient Care Team Coordination), entity list, HIPAA data classification, multi-tenant org model |
| **Outputs** | SQL DDL with all tables, FK constraints, enum types, ER diagram in Mermaid syntax, TypeScript type stubs |
| **Implementation** | `[AI-AGENT]` `[HIPAA-CRITICAL]` — Claude Code with PRD context + HIPAA data classification guide |
| **PRD Feature** | All F1–F13 |

**Healthcare-specific conventions:**
- All PHI columns → annotate with `-- PHI: [data type]` SQL comment
- All tables → include `org_id UUID NOT NULL REFERENCES organizations(id)`
- Soft-delete only (never hard-delete patient records) → `deleted_at TIMESTAMPTZ`
- Audit columns on every mutable table → `created_by`, `updated_by`, `version INT`

---

### DB-02 · Healthcare Migration Generation

**Description:** Generate Supabase-compatible, zero-downtime migration files for healthcare schema changes — adding FHIR-compatible fields, altering credential statuses, adding compliance record columns — without data loss. Always includes rollback strategy and PHI impact assessment.

**Example usage:** "Add FHIR-compatible `patient_identifier` JSONB column to `patients` table. Backfill with existing `mrn` field. Add GIN index for JSONB queries."

| Property | Detail |
|---|---|
| **Inputs** | Current schema state, desired schema delta, FHIR field mapping if applicable, existing migration files |
| **Outputs** | Timestamped `.sql` migration in `supabase/migrations/`, rollback SQL, PHI impact assessment note, updated `database.types.ts` |
| **Implementation** | `[AI-AGENT + OSS]` — AI writes SQL; `supabase db diff` validates; `supabase migration new` scaffolds |

---

### DB-03 · HIPAA-Compliant RLS Policy Generation

**Description:** Generate Row Level Security policies for every healthcare table. Enforces org-level data isolation, role-based access (care_coordinator, field_nurse, administrator, billing_staff), patient assignment scoping, and service role bypass for integrations.

**Example usage:** For `visits` table: field nurses can SELECT/INSERT their own assigned visits. Care coordinators can SELECT all visits in their org. Admins can UPDATE/DELETE. Billing staff can read visit billing fields only. Service role bypasses all.

| Property | Detail |
|---|---|
| **Inputs** | Table name, healthcare role matrix (role × CRUD), patient assignment model, org isolation model |
| **Outputs** | SQL `CREATE POLICY` statements per operation, `ALTER TABLE … ENABLE ROW LEVEL SECURITY`, policy audit test matrix |
| **Implementation** | `[AI-AGENT]` `[HIPAA-CRITICAL]` |
| **PRD Feature** | F4 Real-Time Compliance Monitoring, all data tables |

**Role hierarchy to enforce:**
```
super_admin → full access across orgs (internal only)
org_admin → full access within their org
care_coordinator → read all in org, write assigned teams
field_nurse → read/write own assigned patients and visits
billing_staff → read billing/claims data, no PHI except name
patient → read own records only (patient portal)
```

---

### DB-04 · Audit Trail & Compliance Log Schema

**Description:** Implement a comprehensive audit logging system for HIPAA compliance. Every PHI access, modification, or deletion must be logged with who, what, when, from where, and why. Build the `audit_logs` table, trigger functions, and query helpers.

**Example usage:** When a nurse reads a patient's medical record via the mobile app, insert a row into `audit_logs` with `actor_id`, `patient_id`, `action='READ'`, `resource_type='medical_records'`, `ip_address`, `device_fingerprint`, `timestamp`.

| Property | Detail |
|---|---|
| **Inputs** | List of tables containing PHI, trigger event types (SELECT/INSERT/UPDATE/DELETE), retention period requirement |
| **Outputs** | `audit_logs` table DDL, Postgres trigger functions per PHI table, TypeScript audit query helpers, retention policy SQL |
| **Implementation** | `[AI-AGENT]` `[HIPAA-CRITICAL]` |
| **PRD Feature** | F4 Compliance Monitoring, F11 Incident Reporting |

---

### DB-05 · FHIR-Compatible Data Modeling

**Description:** Model healthcare entities (patients, conditions, medications, observations, practitioners) to be FHIR R4-compatible so that EHR integrations (Epic, Cerner) can bi-directionally sync without data transformation loss.

**Example usage:** Add FHIR `Patient` resource mapping to the `patients` table — `fhir_id`, `fhir_resource JSONB`, `fhir_version`, `last_synced_at`. Build a TypeScript FHIR → internal model transformer.

| Property | Detail |
|---|---|
| **Inputs** | FHIR R4 resource type (Patient, Practitioner, Appointment, Observation, etc.), internal entity schema |
| **Outputs** | Schema columns for FHIR compatibility, transformer function (FHIR JSON ↔ internal model), FHIR validation helper |
| **Implementation** | `[AI-AGENT + OSS]` — AI generates mapping; `fhir-kit-client` or `@medplum/fhirclient` for FHIR protocol |
| **PRD Feature** | F7 EHR Integration |

---

### DB-06 · Healthcare Seed Data Generation

**Description:** Generate HIPAA-safe synthetic seed data for development and testing. Uses realistic but entirely fictional patient names, MRNs, diagnoses, visit notes, and care plans. Never uses real patient data. Respects all FK constraints and clinical business rules.

**Example usage:** Generate 3 organizations (home care agencies), 15 field nurses, 5 care coordinators, 50 patients with varied diagnoses and care plans, 200 visits with clinical notes, 30 pending credentials, and 10 open compliance incidents.

| Property | Detail |
|---|---|
| **Inputs** | Entity counts, clinical complexity level (simple/complex), org structure, test scenario requirements |
| **Outputs** | `supabase/seed.sql`, TypeScript seed factory, synthetic clinical note templates |
| **Implementation** | `[AI-AGENT + OSS]` — AI generates seed logic; Faker.js for synthetic PII; `@snaplet/seed` for FK-safe data |
| **⚠️ Rule** | NEVER use real patient names, SSNs, or medical record numbers — synthetic only |

---

### DB-07 · Healthcare Query Optimization

**Description:** Generate optimal queries for healthcare-specific patterns — staff schedule availability windows, patient assignment by geo + credentials, care plan adherence tracking, compliance expiry monitoring, and real-time dashboard aggregations.

**Example usage:** Generate an efficient query that finds available nurses for a patient visit at a given `(lat, lng, datetime)` — filtering by credential validity, max weekly hours, and distance using PostGIS, ordered by a composite efficiency score.

| Property | Detail |
|---|---|
| **Inputs** | Query requirement, filter dimensions, sort/rank criteria, performance target, schema context |
| **Outputs** | Optimized SQL (with CTEs and window functions as needed), PostGIS usage if geo-relevant, TypeScript typed wrapper |
| **Implementation** | `[AI-AGENT]` |
| **PRD Feature** | F3 Staff Scheduling, F8 GPS Route Optimization |

---

## Category 2 — Backend Skills (Healthcare Domain)

---

### BE-01 · Healthcare API Route Generation

**Description:** Generate complete, HIPAA-aware Next.js App Router API routes for all healthcare resource endpoints. Every route enforces authentication, org-level authorization, input validation, audit logging, and standardized error responses. Never expose PHI in error messages.

**Example usage:** Generate `app/api/visits/route.ts` — GET returns paginated visits for the authenticated nurse's assigned patients; POST creates a new visit with validation; both log to `audit_logs`; PHI never appears in 4xx/5xx responses.

| Property | Detail |
|---|---|
| **Inputs** | Resource name, HTTP methods, auth requirements, Zod schema, audit log requirements, PRD feature reference |
| **Outputs** | Complete `route.ts` file, Zod schema, audit log calls, TypeScript response types, inline JSDoc |
| **Implementation** | `[AI-AGENT]` `[HIPAA-CRITICAL]` |
| **PRD API Groups** | `/patients`, `/visits`, `/schedules`, `/compliance`, `/incidents`, `/billing`, `/medical-records` |

**Standard route template:**
```typescript
// Every healthcare route must include:
// 1. await requireAuth(request) → throws 401 if unauthenticated
// 2. await requireOrgMembership(user, orgId) → throws 403 if not a member
// 3. await logAudit({ actor, resource, action, orgId })
// 4. Zod validation on all inputs
// 5. Never expose PHI in error messages (use opaque error codes)
```

---

### BE-02 · HIPAA-Compliant Messaging API

**Description:** Build the secure messaging infrastructure (F10 Communication Hub). Messages must be encrypted at rest, scoped to patient care teams, never expose patient data outside authorized team members, and maintain a complete message audit trail.

**Example usage:** Generate the POST `/api/communications/messages` route that creates a message in a patient-scoped channel, validates sender is on the patient's care team, logs the PHI access, and triggers a push notification to recipients.

| Property | Detail |
|---|---|
| **Inputs** | Message entity schema, care team authorization model, encryption requirements, notification trigger config |
| **Outputs** | Messaging API routes, care team authorization middleware, encrypted message storage schema, push notification trigger |
| **Implementation** | `[AI-AGENT + SAAS]` `[HIPAA-CRITICAL]` — Twilio for HIPAA-compliant SMS backup; custom DB for primary |
| **PRD Feature** | F10 Communication Hub |

---

### BE-03 · EHR Integration Service (FHIR)

**Description:** Build the FHIR API integration layer for Epic/Cerner bi-directional sync. Handles OAuth2 SMART on FHIR authentication, resource fetching, transformation to internal models, conflict resolution, and sync status tracking.

**Example usage:** Build a Inngest background job that syncs patient data from Epic FHIR endpoint on a 15-minute schedule — fetches changed Patient and Appointment resources, transforms to internal schema, upserts to Supabase, logs sync events.

| Property | Detail |
|---|---|
| **Inputs** | EHR system (Epic/Cerner), FHIR resource types to sync, sync direction (read/write/bidirectional), conflict resolution strategy |
| **Outputs** | FHIR OAuth2 client, resource transformer functions, Inngest sync job, `ehr_sync_logs` table, conflict resolution handler |
| **Implementation** | `[AI-AGENT + SAAS]` `[HIPAA-CRITICAL]` — `fhir-kit-client`; Inngest for job durability |
| **PRD Feature** | F7 EHR Integration |

---

### BE-04 · Staff Scheduling Engine

**Description:** Build the automated scheduling engine (F3) — given patient needs, staff credentials, availability windows, regulatory hour limits, and geo-proximity, assign optimal staff-patient pairings. Implements both auto-scheduling and manual override with conflict detection.

**Example usage:** POST `/api/schedules/auto-assign` receives a list of open visit slots, runs the matching algorithm (credentials → availability → distance → hour limits), returns proposed assignments, and highlights any unresolvable conflicts.

| Property | Detail |
|---|---|
| **Inputs** | Open visit requirements, staff availability matrix, credential requirements per patient, max weekly hours rules, geo data |
| **Outputs** | Scheduling algorithm implementation, conflict detection logic, API route, coordinator override endpoints |
| **Implementation** | `[AI-AGENT]` — greedy matching with constraint propagation; no external scheduler service at MVP |
| **PRD Feature** | F3 Staff Scheduling & Resource Allocation |

---

### BE-05 · Credential & Compliance Monitoring

**Description:** Build the credential management and automated compliance tracking system (F4, F12). Monitor expiry dates, send tiered reminder notifications (90/60/30/7 days), block scheduling of lapsed staff, and generate compliance reports.

**Example usage:** An Inngest cron job runs nightly — queries credentials expiring within 90 days, sends tiered email alerts to staff and coordinators, flags non-compliant staff as unavailable for new assignments, logs all actions to `compliance_events`.

| Property | Detail |
|---|---|
| **Inputs** | Credential types and their renewal rules, notification escalation matrix, compliance blocking logic, regulatory reference (CMS, Joint Commission) |
| **Outputs** | `credentials` and `compliance_records` tables, Inngest cron function, notification templates, compliance status API |
| **Implementation** | `[AI-AGENT + SAAS]` — Inngest cron + Resend email |
| **PRD Feature** | F4 Real-Time Compliance Monitoring, F12 Staff Credential Management |

---

### BE-06 · GPS & Route Optimization Service

**Description:** Build the GPS tracking and route optimization layer (F8). Processes real-time location updates from the mobile app, calculates optimal visit sequences using Google Maps Directions API, tracks mileage for billing, and provides coordinator map views.

**Example usage:** Build `POST /api/tracking/location` that receives staff GPS coords, stores in `location_events` (time-series), and triggers route recalculation if next visit ETA exceeds threshold. Build `GET /api/routes/optimize` that returns the optimal visit order for a nurse's day.

| Property | Detail |
|---|---|
| **Inputs** | Staff schedule for the day, current GPS location, patient addresses, visit duration estimates |
| **Outputs** | Location tracking API, route optimization API (Google Maps Directions), mileage calculation, `location_events` schema |
| **Implementation** | `[AI-AGENT + SAAS]` — Google Maps Directions API; InfluxDB or Postgres time-series for location events |
| **PRD Feature** | F8 GPS Tracking & Route Optimization |

---

### BE-07 · Incident Reporting & Escalation Workflow

**Description:** Build the incident reporting system (F11) — structured incident capture with severity classification (1–5), automated escalation rules (notify supervisor at S3, administrator at S2, on-call at S1), root cause analysis templates, and corrective action tracking.

**Example usage:** A nurse files a medication error incident (severity 3) via mobile. The system auto-classifies it, notifies the care coordinator within 5 minutes via in-app + email, triggers a 24-hour follow-up reminder, and creates a corrective action task.

| Property | Detail |
|---|---|
| **Inputs** | Incident taxonomy, severity matrix, escalation rules per severity, notification recipients by role |
| **Outputs** | Incident submission API, classification engine, Inngest escalation workflow, notification templates, corrective action schema |
| **Implementation** | `[AI-AGENT + SAAS]` — Inngest for escalation workflows; Resend/Twilio for notifications |
| **PRD Feature** | F11 Incident Reporting System |

---

### BE-08 · Billing & Claims Integration

**Description:** Build the billing capture layer (F13) — record billable services at point of care during visit documentation, map to CPT/ICD-10 codes, generate claims data for RCM integration, and track claim submission status.

**Example usage:** When a nurse completes a visit and selects services rendered (wound care, medication administration, vitals), the system maps to CPT codes, calculates billable units, creates a `billing_records` row, and queues for RCM export.

| Property | Detail |
|---|---|
| **Inputs** | Service catalog with CPT mappings, insurance policy data, visit documentation data, RCM system target |
| **Outputs** | Billing capture API, CPT/ICD mapping table, RCM export function, claim status tracking, `billing_records` schema |
| **Implementation** | `[AI-AGENT]` `[HIPAA-CRITICAL]` — CPT code logic custom-built; RCM adapter pattern for extensibility |
| **PRD Feature** | F13 Billing & Claims Integration |

---

## Category 3 — Frontend Skills (Healthcare Domain)

---

### FE-01 · Mobile-First Healthcare UI Components

**Description:** Generate the core React Native + React.js component library for healthcare field workers. Components must be thumb-friendly (min 44px tap targets), high-contrast readable in outdoor/bright-light conditions, and accessible (WCAG AA).

**Key components to generate:**
- `PatientCard` — patient summary with alert badges for critical conditions
- `VisitChecklistForm` — mobile-optimized form with photo attachment
- `CredentialBadge` — expiry status indicator (green/yellow/red)
- `ShiftHandoffNote` — structured handoff documentation component
- `EmergencyAlertBanner` — full-width alert for critical patient notifications
- `GPSTrackingToggle` — consent-aware location tracking control
- `OfflineSyncIndicator` — syncs pending when connectivity returns

| Property | Detail |
|---|---|
| **Inputs** | Component spec, mobile viewport constraints, WCAG AA requirements, dark/light mode |
| **Outputs** | React Native + React.js components, Storybook stories, accessibility audit, Tailwind classes |
| **Implementation** | `[AI-AGENT + SAAS]` — v0.dev for web; React Native Paper for mobile primitives |
| **PRD Feature** | F2 Mobile Field Service Management |

---

### FE-02 · Coordinator Dashboard Layout

**Description:** Generate the care coordinator command center — real-time overview of all active field staff locations, today's visit schedule status, pending incidents, compliance alerts, and team messaging. Role-based view switching.

| Property | Detail |
|---|---|
| **Inputs** | Dashboard sections per PRD (F9 Quality Metrics), role (coordinator vs. admin vs. nurse), real-time data requirements |
| **Outputs** | Dashboard page, sidebar navigation, widget grid, real-time data hooks, skeleton loading states |
| **Implementation** | `[AI-AGENT + SAAS]` — v0.dev layout generation + Supabase Realtime subscriptions |
| **PRD Feature** | F1 Patient Care Team Coordination, F9 Quality Metrics Dashboard |

---

### FE-03 · Offline-First Visit Documentation Form

**Description:** Build the mobile visit documentation form (F6) that works fully offline. Captures care notes, treatments, vitals, photos, and e-signatures. Queues submissions locally when offline and auto-syncs when connectivity is restored using `react-query` + IndexedDB queue.

| Property | Detail |
|---|---|
| **Inputs** | Visit documentation schema, offline sync strategy, photo capture requirements, e-signature spec |
| **Outputs** | Multi-step form component, IndexedDB offline queue, sync status UI, photo compression utility |
| **Implementation** | `[AI-AGENT + OSS]` — `react-hook-form` + Zod; `idb-keyval` for IndexedDB; service worker for offline |
| **PRD Feature** | F6 Patient Visit Documentation, F2 Mobile Field Service (offline-first) |

---

### FE-04 · Real-Time Staff Location Map

**Description:** Build the coordinator GPS map view (F8) — displays all active field staff on a map, shows their current visit status, upcoming visits as route lines, and alerts for late arrivals. Uses Google Maps JS API with Supabase Realtime location updates.

| Property | Detail |
|---|---|
| **Inputs** | Staff location event stream, visit schedule data, geo bounds for the org's service area |
| **Outputs** | Map component with staff markers, route visualization, status color coding, click-to-view staff details panel |
| **Implementation** | `[AI-AGENT + SAAS]` — Google Maps JS API + `@react-google-maps/api`; Supabase Realtime |
| **PRD Feature** | F8 GPS Tracking & Route Optimization |

---

### FE-05 · Patient Care Timeline Component

**Description:** Build the longitudinal patient care timeline — displays visit history, care notes, incidents, medication changes, and care plan updates in chronological order. Supports filtering by care type and date range.

| Property | Detail |
|---|---|
| **Inputs** | Patient record schema, timeline event types, date range filters |
| **Outputs** | Timeline component with event type icons, expandable detail cards, filter bar, print/export view |
| **Implementation** | `[AI-AGENT]` |
| **PRD Feature** | F1 Patient Care Team Coordination, F6 Visit Documentation |

---

### FE-06 · Compliance & Credential Dashboard

**Description:** Build the credential expiry management interface (F12) — shows all staff credentials in a sortable table with color-coded expiry status, bulk reminder sending, document upload modal, and verification workflow UI.

| Property | Detail |
|---|---|
| **Inputs** | Credential types, expiry alert thresholds, document upload requirements |
| **Outputs** | Credentials table with sort/filter, expiry timeline chart, document upload modal, bulk action toolbar |
| **Implementation** | `[AI-AGENT + OSS]` — TanStack Table; `react-dropzone` for document uploads |
| **PRD Feature** | F12 Staff Credential Management, F4 Compliance Monitoring |

---

### FE-07 · State Management Hooks (Healthcare)

**Description:** Generate all TanStack Query hooks for the healthcare domain with proper cache invalidation, optimistic updates, offline mutation queuing, and loading/error state handling.

**Hooks to generate:**
```typescript
useCurrentUser()           // authenticated user + role + org
usePatients(filters)       // paginated patient list for org
usePatient(id)             // single patient + care team
useVisits(filters)         // visits for nurse or care team
useCreateVisit()           // optimistic create + offline queue
useSchedule(staffId, date) // daily schedule for a staff member
useCredentials(staffId)    // credentials + expiry status
useComplianceAlerts()      // pending compliance actions
useIncidents(filters)      // open/resolved incidents
useOrganizationStats()     // KPI metrics for dashboard
```

| Property | Detail |
|---|---|
| **Inputs** | Entity schemas (TypeScript types from `database.types.ts`), cache strategy, invalidation rules |
| **Outputs** | Full hook implementations with TypeScript generics, cache keys, error handling |
| **Implementation** | `[AI-AGENT + OSS]` — TanStack Query v5 |
| **PRD Feature** | All features (state layer) |

---

## Category 4 — AI & ML Skills (Healthcare Domain)

---

### AI-01 · Voice-to-Text Clinical Documentation (Phase 3)

**Description:** Integrate AI-powered voice transcription for hands-free visit documentation. Nurses dictate notes during visits; the system transcribes, applies medical terminology correction, and structures the output into the visit documentation schema.

| Property | Detail |
|---|---|
| **Inputs** | Audio stream from mobile, visit context (patient diagnosis, care plan), structured output schema |
| **Outputs** | Transcription service integration, medical NLP post-processing, structured note extraction, confidence scoring |
| **Implementation** | `[AI-AGENT + SAAS]` — OpenAI Whisper API for transcription; Claude for medical terminology structuring |
| **PRD Feature** | Phase 3 — Voice-to-Text Documentation |

---

### AI-02 · Predictive Staffing Engine (Phase 3)

**Description:** Build the ML-based predictive staffing model — analyzes historical visit patterns, patient acuity trends, seasonal factors, and staff attrition to forecast staffing needs 2–4 weeks out. Outputs staffing recommendations to care coordinators.

| Property | Detail |
|---|---|
| **Inputs** | Historical visit data (12+ months), staff availability patterns, patient acuity scores, seasonal parameters |
| **Outputs** | Forecasting model (time-series), staffing recommendation API, confidence intervals, coordinator alert thresholds |
| **Implementation** | `[AI-AGENT + SAAS]` — Vercel AI SDK + Claude for pattern analysis; simple statistical model at MVP scale |
| **PRD Feature** | Phase 3 — AI-Powered Predictive Staffing |

---

### AI-03 · Predictive Risk Analytics (Phase 3)

**Description:** Identify patients at elevated risk of readmission, care gap, or deterioration based on visit frequency, care plan adherence, vitals trends, and diagnosis history. Surface risk scores to care coordinators for proactive intervention.

| Property | Detail |
|---|---|
| **Inputs** | Patient visit history, vitals time-series, care plan adherence data, diagnosis codes |
| **Outputs** | Risk score model, `patient_risk_scores` table, risk alert API, coordinator notification workflow |
| **Implementation** | `[AI-AGENT + SAAS]` `[HIPAA-CRITICAL]` — Claude for pattern reasoning; pgvector for similarity-based risk |
| **PRD Feature** | Phase 3 — Predictive Risk Analytics |

---

## Category 5 — Compliance & Security Skills

---

### SEC-01 · HIPAA Technical Safeguard Implementation

**Description:** Implement the full set of HIPAA Technical Safeguards — encryption at rest and in transit, automatic logoff, audit controls, integrity controls, and transmission security. Covers both database and application layers.

**Checklist:**
- [ ] Supabase column-level encryption for SSN, DOB, insurance IDs
- [ ] TLS 1.2+ enforced on all API routes
- [ ] Session auto-logout after 15 minutes of inactivity (configurable)
- [ ] Audit log for every PHI access (DB-04)
- [ ] RLS enforced on every PHI table (DB-03)
- [ ] No PHI in logs, error messages, or API error responses
- [ ] E2E encryption for secure messages (BE-02)
- [ ] BAA-signed infrastructure only (Supabase, Vercel, Twilio, Resend)

| Property | Detail |
|---|---|
| **Inputs** | Infrastructure stack, PHI data types, session policy requirements |
| **Outputs** | Encryption implementation, session management code, security middleware, compliance checklist with implementation evidence |
| **Implementation** | `[AI-AGENT]` `[HIPAA-CRITICAL]` |

---

### SEC-02 · BAA Vendor Compliance Tracking

**Description:** Track which third-party services process PHI and ensure valid Business Associate Agreements (BAAs) are in place. Maintain a vendor register with BAA status, data type access, and renewal dates.

| Property | Detail |
|---|---|
| **Inputs** | Current tool stack, PHI data flows per vendor |
| **Outputs** | BAA vendor register document, PHI data flow diagram, gaps list for vendors without signed BAAs |
| **Implementation** | `[AI-AGENT]` — document generation; human must execute BAA negotiations |
| **BAA Required For** | Supabase ✓, Vercel ✓, Twilio ✓, Resend ✓, Google Maps ✗ (no PHI sent), Inngest (check) |

---

### SEC-03 · SOC 2 Type II Preparation

**Description:** Generate the evidence collection framework and controls documentation needed for SOC 2 Type II audit preparation, covering security, availability, and confidentiality trust service criteria.

| Property | Detail |
|---|---|
| **Inputs** | Current security controls, incident log, access control policies, deployment pipeline |
| **Outputs** | Controls matrix, evidence collection scripts, policy document templates, gap analysis |
| **Implementation** | `[AI-AGENT]` — documentation; human must validate controls with auditor |
| **PRD Risk** | Data security breaches mitigation |

---

## Category 6 — Context Management Skills

---

### CM-01 · Healthcare AGENTS.md Authoring

**Description:** Maintain the living `AGENTS.md` file with current platform architecture, active tasks, healthcare domain rules, and agent operating boundaries. Must be updated after every session.

| Property | Detail |
|---|---|
| **Inputs** | Session summary, completed features, new decisions, updated schema |
| **Outputs** | Updated `AGENTS.md` with current state, next tasks, domain rules, blockers |
| **Implementation** | `[AI-AGENT]` |

---

### CM-02 · HIPAA Decision Log

**Description:** Maintain a `HIPAA_DECISIONS.md` log of every architectural decision with HIPAA implications — encryption choices, PHI data flows, access control decisions, audit scope — with rationale and approval status.

| Property | Detail |
|---|---|
| **Inputs** | Decision description, PHI impact, alternatives considered, final choice |
| **Outputs** | Entry in `HIPAA_DECISIONS.md` with date, decision, rationale, risk assessment |
| **Implementation** | `[AI-AGENT]` `[HIPAA-CRITICAL]` |

---

## Skill Summary Matrix

| ID | Skill Name | Category | Implementation | Complexity | PRD Phase |
|---|---|---|---|---|---|
| DB-01 | Healthcare Schema Design | Database | AI-AGENT | High | MVP |
| DB-02 | Healthcare Migration Generation | Database | AI-AGENT + OSS | Medium | MVP |
| DB-03 | HIPAA-Compliant RLS | Database | AI-AGENT | High | MVP |
| DB-04 | Audit Trail Schema | Database | AI-AGENT | High | MVP |
| DB-05 | FHIR Data Modeling | Database | AI-AGENT + OSS | High | MVP |
| DB-06 | Healthcare Seed Data | Database | AI-AGENT + OSS | Medium | MVP |
| DB-07 | Healthcare Query Optimization | Database | AI-AGENT | High | MVP |
| BE-01 | Healthcare API Routes | Backend | AI-AGENT | Medium | MVP |
| BE-02 | HIPAA Messaging API | Backend | AI-AGENT + SAAS | High | MVP |
| BE-03 | EHR FHIR Integration | Backend | AI-AGENT + SAAS | High | MVP |
| BE-04 | Staff Scheduling Engine | Backend | AI-AGENT | High | MVP |
| BE-05 | Credential & Compliance | Backend | AI-AGENT + SAAS | High | MVP |
| BE-06 | GPS & Route Optimization | Backend | AI-AGENT + SAAS | Medium | MVP |
| BE-07 | Incident Reporting Workflow | Backend | AI-AGENT + SAAS | Medium | MVP |
| BE-08 | Billing & Claims Integration | Backend | AI-AGENT | High | MVP |
| FE-01 | Mobile Healthcare UI Components | Frontend | AI-AGENT + SAAS | Medium | MVP |
| FE-02 | Coordinator Dashboard | Frontend | AI-AGENT + SAAS | High | MVP |
| FE-03 | Offline Visit Documentation | Frontend | AI-AGENT + OSS | High | MVP |
| FE-04 | Real-Time Staff Map | Frontend | AI-AGENT + SAAS | Medium | MVP |
| FE-05 | Patient Care Timeline | Frontend | AI-AGENT | Medium | MVP |
| FE-06 | Compliance Dashboard | Frontend | AI-AGENT + OSS | Medium | MVP |
| FE-07 | Healthcare TanStack Hooks | Frontend | AI-AGENT + OSS | Medium | MVP |
| AI-01 | Voice-to-Text Documentation | AI/ML | AI-AGENT + SAAS | High | Phase 3 |
| AI-02 | Predictive Staffing Engine | AI/ML | AI-AGENT + SAAS | High | Phase 3 |
| AI-03 | Predictive Risk Analytics | AI/ML | AI-AGENT + SAAS | High | Phase 3 |
| SEC-01 | HIPAA Technical Safeguards | Security | AI-AGENT | High | MVP |
| SEC-02 | BAA Vendor Compliance | Security | AI-AGENT | Medium | MVP |
| SEC-03 | SOC 2 Preparation | Security | AI-AGENT | High | Phase 2 |
| CM-01 | Healthcare AGENTS.md | Context | AI-AGENT | Medium | Ongoing |
| CM-02 | HIPAA Decision Log | Context | AI-AGENT | Medium | Ongoing |

---

*30 modular skills across 6 categories · All healthcare-domain-specific · HIPAA-critical skills marked for mandatory extra review*
*Inherits base skills from the generic skills.md (DB-01–DB-08, BE-01–BE-08, FE-01–FE-09, etc.) — use this file for healthcare overrides and additions*
