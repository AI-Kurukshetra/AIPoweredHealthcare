# HIPAA Decisions

## 2026-03-14

### Decision 001: Audit Logs are Append-Only
- Context: HIPAA requires robust tamper-resistant access history for PHI operations.
- Choice: `audit_logs` table disallows update/delete via RLS and DB triggers.
- Rationale: Enforces immutable audit history at data layer instead of app-only controls.
- Status: Approved

### Decision 002: PHI-Safe Error Contract
- Context: API responses must never leak PHI in error bodies.
- Choice: Standardized opaque error codes/messages (`UNAUTHORIZED`, `FORBIDDEN`, etc.).
- Rationale: Prevents accidental disclosure while preserving client-side handling.
- Status: Approved

### Decision 003: Soft Delete for Clinical Records
- Context: Patient and clinical records should not be hard deleted in operational workflows.
- Choice: `deleted_at` on PHI-bearing clinical entities (`patients`, `visits`, `visit_notes`, `incidents`, `messages`, `billing_records`).
- Rationale: Supports compliance traceability and safer recovery.
- Status: Approved

### Decision 004: Enforce AAL2 for PHI Routes
- Context: Staff must complete MFA before accessing PHI workflows.
- Choice: Middleware blocks `/dashboard` and `/patients` unless current session AAL is `aal2`, redirecting to `/mfa`.
- Rationale: Centralized gate minimizes route-level bypass risk.
- Status: Approved
