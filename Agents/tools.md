# 🛠️ tools.md
## Healthcare Platform Tool Directory
### Platform: AI-Powered Healthcare Workforce & Operations Management
### Stack: Next.js · Supabase · React Native (Expo) · Vercel · TypeScript

> **Purpose:** Curated directory of tools and platforms for building the Healthcare Workforce Management platform. Every tool is evaluated for HIPAA compliance, BAA availability, and compatibility with the Next.js + Supabase + Vercel + React Native stack.
>
> **⚠️ HIPAA Priority:** Before integrating any tool that processes PHI, confirm BAA availability. No PHI flows to non-BAA services.

---

## Tool Rating Legend

| Symbol | Meaning |
|---|---|
| 🟢 | Free tier is genuinely useful for production |
| 🟡 | Free tier limited; works for prototyping |
| 🔴 | No meaningful free tier |
| 🔗 | API available for programmatic use |
| ⚡ | Native Next.js / Vercel integration |
| 🐘 | Native Supabase integration |
| 🏥 | HIPAA BAA available |
| ⛔ | Do NOT use for PHI — no BAA |

---

## Section 1 — AI Coding Agents

### Claude Code (Anthropic) — PRIMARY

| Property | Detail |
|---|---|
| **Category** | Agentic Coding Agent (CLI) |
| **Free Tier** | 🟡 API credits required |
| **API** | 🔗 Anthropic API + MCP protocol |
| **Next.js** | ⚡ Native App Router + server actions support |
| **Supabase** | 🐘 Direct schema access via Supabase MCP |
| **HIPAA** | ⛔ Do not send PHI to Claude — use synthetic data only |
| **Best For** | Autonomous multi-file feature implementation, schema generation, FHIR transformer generation |

```bash
# Setup with Supabase MCP for live schema access
npm install -g @anthropic-ai/claude-code
claude --mcp-server supabase
```

**Healthcare usage rules:**
- Provide SCHEMA.md and synthetic data — never real patient data
- Always reference PRD feature codes (F1–F13) in prompts
- Use for: scheduling engine, FHIR transformers, RLS policies, compliance rules

---

### Cursor — DAILY DEVELOPMENT

| Property | Detail |
|---|---|
| **Category** | AI Code Editor |
| **Free Tier** | 🟡 Hobby tier |
| **HIPAA** | ⛔ Do not paste real patient records into Cursor |
| **Best For** | Interactive development, refactoring, inline code generation |

**MCP configuration for healthcare project:**
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase@latest", "--project-ref", "YOUR_REF"],
      "env": { "SUPABASE_ACCESS_TOKEN": "sbp_..." }
    }
  }
}
```

---

## Section 2 — Healthcare-Specific Infrastructure

### Supabase — CORE DATA PLATFORM 🏥

| Property | Detail |
|---|---|
| **Category** | Auth + Postgres + Storage + Realtime |
| **Free Tier** | 🟢 2 projects, 500MB DB, 1GB storage |
| **HIPAA** | 🏥 BAA available on Pro plan ($25/month) — **required before any PHI** |
| **API** | 🔗 Full REST + Realtime WebSocket |
| **Next.js** | ⚡ `@supabase/ssr` for App Router |
| **Best For** | Primary PHI data store, auth with MFA, RLS enforcement, real-time coordinator map |

```bash
npm install @supabase/supabase-js @supabase/ssr
```

**HIPAA setup checklist:**
- [ ] Upgrade to Pro plan
- [ ] Sign BAA in Supabase dashboard → Settings → HIPAA
- [ ] Enable MFA in auth settings
- [ ] Enable Point-in-Time Recovery (PITR)
- [ ] Configure audit logging in Postgres
- [ ] Set up private Storage buckets only (no public URLs)

---

### Vercel — DEPLOYMENT 🏥

| Property | Detail |
|---|---|
| **Category** | Deployment Platform |
| **Free Tier** | 🟢 Hobby (personal); 🔴 Pro required for healthcare teams |
| **HIPAA** | 🏥 BAA available on Enterprise plan |
| **Next.js** | ⚡ Purpose-built for Next.js |
| **Best For** | Web app deployment, preview environments, edge functions |

**⚠️ Note:** Use Vercel Pro/Enterprise with BAA for production. Vercel Hobby plan does not include BAA.

---

### Expo (React Native) — MOBILE PLATFORM

| Property | Detail |
|---|---|
| **Category** | Mobile App Framework + OTA Updates |
| **Free Tier** | 🟢 EAS free tier for small teams |
| **HIPAA** | 🏥 No PHI stored in Expo services; app code only |
| **API** | 🔗 EAS CLI + build API |
| **Best For** | React Native build pipeline, OTA updates, iOS/Android distribution |

```bash
npm install -g eas-cli
eas build --platform all
eas update --branch production
```

**Healthcare configuration:**
```json
// app.json
{
  "expo": {
    "plugins": [
      ["expo-local-authentication", { "faceIDPermission": "..." }],
      "expo-secure-store"  // Encrypted credential storage
    ]
  }
}
```

---

### WatermelonDB — OFFLINE SYNC (MOBILE)

| Property | Detail |
|---|---|
| **Category** | Offline-First SQLite Database |
| **Free Tier** | 🟢 Open-source |
| **HIPAA** | 🏥 Local device storage; encrypt with device biometric key |
| **Best For** | Offline visit documentation, pre-fetched patient data, mobile-first SQLite |

```bash
npm install @nozbe/watermelondb
```

**Usage:** Mobile SQLite mirror of assigned patient data and pending mutations. Encrypts with `expo-secure-store` key derived from biometric auth.

---

## Section 3 — Communication & Notifications

### Twilio — HIPAA-COMPLIANT SMS FALLBACK 🏥

| Property | Detail |
|---|---|
| **Category** | SMS / Voice Communications |
| **Free Tier** | 🟡 Trial credits |
| **HIPAA** | 🏥 BAA available; sign before any PHI-adjacent SMS |
| **API** | 🔗 REST API + Node.js SDK |
| **Best For** | Emergency escalation SMS, credential expiry alerts, two-factor auth codes |

```typescript
import twilio from 'twilio'
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

// Non-PHI SMS only in message body — use deep links instead
await client.messages.create({
  body: 'Urgent: Please review incident #1234 in the app',
  from: process.env.TWILIO_PHONE_NUMBER,
  to: staffMember.phone,
})
```

**⚠️ Rule:** Never include PHI in SMS body. Use app deep links for patient data context.

---

### Resend + React Email — TRANSACTIONAL EMAIL 🏥

| Property | Detail |
|---|---|
| **Category** | Transactional Email |
| **Free Tier** | 🟢 3,000 emails/month |
| **HIPAA** | 🏥 BAA available |
| **Next.js** | ⚡ Native integration |
| **Best For** | Credential expiry alerts, incident notifications, shift reminders, welcome emails |

```typescript
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)

// Template: No PHI in email body — link to app for details
await resend.emails.send({
  from: 'alerts@yourhealthcareplatform.com',
  to: coordinator.email,
  subject: 'Credential Expiring: 3 staff members',
  react: <CredentialExpiryAlert count={3} portalUrl="..." />,
})
```

**Email templates to build:**
- `CredentialExpiryAlert` — 90/60/30/7 day warnings
- `IncidentEscalationAlert` — Severity 1–3 notifications
- `ShiftReminder` — Next day schedule preview (no PHI)
- `WelcomeStaff` — Onboarding with MFA setup instructions
- `ComplianceReport` — Weekly summary (link to portal, no PHI in body)

---

### Expo Notifications + FCM/APNs — PUSH NOTIFICATIONS

| Property | Detail |
|---|---|
| **Category** | Push Notifications (Mobile) |
| **Free Tier** | 🟢 Included in Expo |
| **HIPAA** | 🏥 No PHI in push payload — use silent pushes + app fetch |
| **Best For** | Schedule changes, new patient assignments, urgent incident alerts |

```typescript
// HIPAA-safe push: no PHI in notification body
await expo.sendPushNotificationsAsync([{
  to: staffMember.expoPushToken,
  title: 'Schedule Update',
  body: 'Your schedule has been updated. Tap to view.',
  data: { type: 'SCHEDULE_UPDATE', navigateTo: '/schedule' }, // Deep link only
}])
```

---

## Section 4 — EHR Integration

### fhir-kit-client — FHIR R4 CLIENT

| Property | Detail |
|---|---|
| **Category** | FHIR R4 API Client |
| **Free Tier** | 🟢 Open-source |
| **HIPAA** | 🏥 Data stays between your server and EHR — BAA is with EHR vendor |
| **Best For** | Epic/Cerner bi-directional sync, SMART on FHIR OAuth, resource fetching |

```typescript
import FHIRClient from 'fhir-kit-client'

const client = new FHIRClient({
  baseUrl: process.env.EPIC_FHIR_BASE_URL,
})

// SMART on FHIR auth + resource fetch
const patients = await client.search({
  resourceType: 'Patient',
  searchParams: { _lastUpdated: `gt${lastSyncAt}` },
})
```

---

### Medplum (optional) — FHIR SERVER ABSTRACTION

| Property | Detail |
|---|---|
| **Category** | FHIR Platform / EHR Abstraction |
| **Free Tier** | 🟡 Self-hosted or cloud |
| **HIPAA** | 🏥 BAA available on cloud plan |
| **Best For** | If supporting multiple EHR systems; normalizes FHIR variants across vendors |

---

## Section 5 — Background Jobs & Workflows

### Inngest — BACKGROUND JOBS

| Property | Detail |
|---|---|
| **Category** | Durable Workflow / Background Jobs |
| **Free Tier** | 🟢 50,000 function runs/month |
| **HIPAA** | 🏥 BAA available; PHI can flow through job payloads if BAA signed |
| **Next.js** | ⚡ Native `inngest/next` package |
| **Best For** | Credential expiry cron, EHR sync schedule, incident escalation workflows, route pre-computation |

```typescript
// inngest/functions/credential-expiry-check.ts
import { inngest } from '../client'

export const credentialExpiryCheck = inngest.createFunction(
  { id: 'credential-expiry-check' },
  { cron: '0 6 * * *' }, // Every day at 6 AM
  async ({ step }) => {
    const expiring = await step.run('fetch-expiring-credentials', async () => {
      // Query credentials expiring within 90 days
    })

    await step.run('send-alerts', async () => {
      // Send tiered email alerts via Resend
    })

    await step.run('flag-non-compliant', async () => {
      // Mark lapsed staff as unavailable for new assignments
    })
  }
)
```

**Healthcare Inngest functions:**

| Function | Trigger | Purpose |
|---|---|---|
| `credential-expiry-check` | Daily 6 AM cron | Scan expiring credentials, send alerts |
| `ehr-sync` | Every 15 min | FHIR resource sync from Epic/Cerner |
| `incident-escalation` | Event: `incident.created` | Severity-based auto-escalation |
| `route-optimization` | Daily 5 AM cron | Pre-compute daily routes for all nurses |
| `compliance-report` | Weekly Sunday 8 PM | Generate weekly compliance summary |
| `mileage-export` | Monthly 1st cron | Generate mileage reports for billing |

---

## Section 6 — Mapping & Geo

### Google Maps Platform — GPS & ROUTING ⛔ (No PHI)

| Property | Detail |
|---|---|
| **Category** | Maps, Geocoding, Directions |
| **Free Tier** | 🟢 $200/month credit |
| **HIPAA** | ⛔ No BAA — send only addresses, never patient names or identifiers |
| **APIs Used** | Directions API, Geocoding API, Maps JavaScript API, Maps SDK for mobile |

```typescript
// lib/geo/routing.ts
// HIPAA rule: send only lat/lng — never patient names or IDs to Google
async function optimizeRoute(stops: Array<{ lat: number; lng: number }>) {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/directions/json?` +
    `origin=${stops[0].lat},${stops[0].lng}&` +
    `destination=${stops[stops.length-1].lat},${stops[stops.length-1].lng}&` +
    `waypoints=optimize:true|${stops.slice(1,-1).map(s => `${s.lat},${s.lng}`).join('|')}&` +
    `key=${process.env.GOOGLE_MAPS_API_KEY}`
  )
  return response.json()
}
```

---

### PostGIS — GEO QUERIES IN POSTGRES

| Property | Detail |
|---|---|
| **Category** | Postgres Geospatial Extension |
| **Free Tier** | 🟢 Available in Supabase (enable via SQL) |
| **HIPAA** | 🏥 Same Supabase HIPAA boundary |
| **Best For** | Find nearest available nurses to a patient address, service area queries |

```sql
-- Enable in Supabase
CREATE EXTENSION IF NOT EXISTS postgis;

-- Find available nurses within 20 miles of patient
SELECT u.id, u.full_name,
  ST_Distance(
    ST_MakePoint(u.last_lng, u.last_lat)::geography,
    ST_MakePoint($1, $2)::geography
  ) / 1609.34 AS distance_miles
FROM profiles u
JOIN organization_members om ON om.user_id = u.id
WHERE om.org_id = $3
  AND om.role = 'field_nurse'
  AND ST_Distance(...) < 32186  -- 20 miles in meters
ORDER BY distance_miles;
```

---

## Section 7 — Database & Schema Tools

### Supabase CLI

| Property | Detail |
|---|---|
| **Category** | DB Schema & Migration Management |
| **Free Tier** | 🟢 Open-source |
| **HIPAA** | 🏥 Connects to your HIPAA Supabase project |
| **Best For** | Migration management, type generation, local development |

```bash
# Core healthcare workflow
supabase migration new add_fhir_patient_fields
supabase db push --project-ref $PROD_REF
supabase gen types typescript --project-id $REF > src/types/database.types.ts
```

---

### Supabase MCP Server

```json
// .cursor/mcp.json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase@latest", "--project-ref", "YOUR_PROD_REF"],
      "env": { "SUPABASE_ACCESS_TOKEN": "sbp_..." }
    }
  }
}
```

**⚠️ Production MCP:** When connecting Cursor/Claude Code MCP to production Supabase, ensure no real patient data is present in the schema introspection output. Use a staging project for agent-assisted development.

---

## Section 8 — Security & Compliance Tools

### Auth0 (alternative) or Supabase Auth — MFA + SSO

Both support TOTP-based MFA. Supabase Auth is recommended (same HIPAA boundary).

```typescript
// Enforce MFA in middleware.ts
const { data: { user } } = await supabase.auth.getUser()
const aal = user?.factors?.some(f => f.status === 'verified') ? 'aal2' : 'aal1'
if (aal !== 'aal2' && routeRequiresMFA(pathname)) {
  return NextResponse.redirect(new URL('/mfa', request.url))
}
```

---

### Doppler — SECRET MANAGEMENT

| Property | Detail |
|---|---|
| **Category** | Secret Management |
| **Free Tier** | 🟢 Free for small teams |
| **HIPAA** | 🏥 SOC 2 Type II certified; acceptable for secret storage |
| **Best For** | Centralized management of Supabase keys, FHIR credentials, API keys across dev/staging/prod |

**Healthcare secrets to manage:**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY       # Server-only, never client
EPIC_FHIR_BASE_URL
EPIC_CLIENT_ID
EPIC_CLIENT_SECRET              # HIPAA-critical
CERNER_CLIENT_SECRET            # HIPAA-critical
TWILIO_AUTH_TOKEN
RESEND_API_KEY
GOOGLE_MAPS_API_KEY
INNGEST_SIGNING_KEY
SENTRY_DSN
```

---

### Sentry — ERROR MONITORING (PHI SCRUBBING REQUIRED)

| Property | Detail |
|---|---|
| **Category** | Error Monitoring |
| **Free Tier** | 🟢 5,000 errors/month |
| **HIPAA** | ⚠️ BAA available on Business+ plan; configure PHI scrubbing BEFORE any production data |
| **Next.js** | ⚡ `@sentry/nextjs` official package |

```typescript
// sentry.client.config.ts
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  beforeSend(event) {
    // Strip known PHI fields from all events
    if (event.extra) {
      delete event.extra.patient_name
      delete event.extra.dob
      delete event.extra.ssn
      delete event.extra.mrn
      delete event.extra.insurance_id
    }
    // Scrub request body PHI
    if (event.request?.data) {
      event.request.data = '[Scrubbed for HIPAA]'
    }
    return event
  },
})
```

---

## Section 9 — Analytics & Observability

### PostHog — PRODUCT ANALYTICS ⛔ (No PHI)

| Property | Detail |
|---|---|
| **Category** | Product Analytics |
| **Free Tier** | 🟢 1M events/month |
| **HIPAA** | ⚠️ BAA available; self-host or EU cloud for max safety |
| **Best For** | Feature adoption, mobile DAU/MAU tracking, funnel analysis |

```typescript
// Track feature usage — never include PHI
posthog.capture('visit_documented', {
  org_id: orgId,              // Org-level aggregation OK
  visit_type: 'wound_care',   // Clinical category OK
  duration_minutes: 45,       // Operational metric OK
  // patient_id: ❌ NEVER
  // patient_name: ❌ NEVER
})
```

---

### LangSmith — LLM OBSERVABILITY (Phase 3 AI Features)

| Property | Detail |
|---|---|
| **Category** | LLM Tracing & Evaluation |
| **Free Tier** | 🟢 5,000 traces/month |
| **HIPAA** | ⛔ No BAA — trace only with synthetic/anonymized data |
| **Best For** | Tracing Voice-to-Text pipeline, predictive staffing model calls |

---

## Section 10 — Deployment & DevOps

### GitHub Actions — CI/CD

```yaml
# .github/workflows/ci.yml (Healthcare additions)
jobs:
  hipaa-checks:
    name: HIPAA Security Checks
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Scan for hardcoded secrets
        run: npx secretlint "**/*.ts" "**/*.tsx"
      - name: Check for PHI in test files
        run: |
          if grep -r --include="*.ts" "SSN\|social_security\|dob.*real" tests/; then
            echo "❌ Potential real PHI found in test files"
            exit 1
          fi
      - name: Verify RLS enabled on all tables
        run: npx ts-node scripts/verify-rls.ts
```

---

## HIPAA BAA Status Register

| Tool | BAA Available | PHI Flows Through? | Action Required |
|---|---|---|---|
| Supabase | ✅ Yes (Pro plan) | ✅ YES — primary PHI store | Sign BAA before any production PHI |
| Vercel | ✅ Yes (Enterprise) | ⚠️ Request bodies in transit | Sign BAA; enable edge config |
| Twilio | ✅ Yes | ⚠️ SMS fallback (no PHI in body) | Sign BAA as precaution |
| Resend | ✅ Yes | ⚠️ Email (no PHI in body) | Sign BAA as precaution |
| Inngest | ⚠️ Check current status | ⚠️ Job payloads may contain PHI | Confirm BAA before PHI in events |
| Google Maps | ❌ No | ❌ NO — addresses only, no identifiers | Do not send patient names/IDs |
| Sentry | ✅ Yes (Business+) | ⚠️ Error context (scrub PHI) | Configure beforeSend scrubbing |
| PostHog | ✅ Yes (self-host) | ❌ NO — usage metrics only | Do not send PHI events |
| Expo | ✅ Yes (check) | ❌ NO — code and builds only | Confirm for EAS |
| Claude / Anthropic | ❌ No BAA | ❌ NO — dev tool only | NEVER send real PHI |
| GitHub | ✅ Yes (GHEC) | ❌ NO — code only | No PHI in code or issue comments |
| Doppler | ✅ Yes | ⚠️ Stores secrets (not PHI) | Acceptable for secret storage |

---

## Tool → Skill Coverage Matrix

| Tool | Healthcare Skills Covered |
|---|---|
| Claude Code | DB-01–07, BE-01–08, FE-01–07, SEC-01–03 |
| Cursor + Supabase MCP | All code generation skills |
| Supabase CLI | DB-02, DB-03, DB-05 |
| Supabase Realtime | FE-04 (Real-Time Staff Map), FE-07 (hooks) |
| WatermelonDB | FE-03 (Offline Visit Documentation) |
| Inngest | BE-03 (EHR Sync), BE-05 (Credential Monitor), BE-07 (Incidents) |
| fhir-kit-client | BE-03 (EHR Integration) |
| Twilio | BE-02 (Secure Messaging SMS fallback) |
| Resend + React Email | BE-05 (Credential alerts), BE-07 (Incident notifications) |
| Google Maps | BE-06 (GPS & Route Optimization), FE-04 (Staff Map) |
| PostGIS | DB-07 (Geo queries for scheduling) |
| Expo | FE-01 (Mobile UI), FE-03 (Offline Forms) |
| Sentry | SEC-01 (Error monitoring with PHI scrubbing) |
| Doppler | SEC-01 (Secret management) |
| GitHub Actions | All CI/CD, HIPAA security scans |
| Vercel | All web deployment |

---

*22 tools across 10 categories · All evaluated for HIPAA BAA status · All compatible with Next.js + Supabase + React Native stack*
*BAA register must be reviewed quarterly and before any new PHI data flow is introduced*
