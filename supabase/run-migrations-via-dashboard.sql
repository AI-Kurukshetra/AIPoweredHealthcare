-- ============================================================
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- https://supabase.com/dashboard/project/byqpbuibpzhzzscidtjx/sql
-- ============================================================

-- 1. RPC for dashboard charts (reduces Disk IO)
CREATE OR REPLACE FUNCTION get_dashboard_charts(p_org_id UUID, p_days INT DEFAULT 30)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_start TIMESTAMPTZ;
  v_result JSONB;
BEGIN
  v_start := date_trunc('day', NOW() - (p_days || ' days')::INTERVAL);

  WITH day_series AS (
    SELECT generate_series(0, p_days - 1)::INT AS n
  ),
  patient_counts AS (
    SELECT
      (EXTRACT(EPOCH FROM (date_trunc('day', created_at) - v_start)) / 86400)::INT AS day_idx,
      count(*)::INT AS cnt
    FROM patients
    WHERE org_id = p_org_id AND deleted_at IS NULL
      AND created_at >= v_start AND created_at < v_start + (p_days || ' days')::INTERVAL
    GROUP BY 1
  ),
  appointment_counts AS (
    SELECT
      (EXTRACT(EPOCH FROM (date_trunc('day', starts_at) - v_start)) / 86400)::INT AS day_idx,
      count(*)::INT AS cnt
    FROM appointments
    WHERE org_id = p_org_id AND deleted_at IS NULL
      AND starts_at >= v_start AND starts_at < v_start + (p_days || ' days')::INTERVAL
    GROUP BY 1
  ),
  visit_counts AS (
    SELECT
      (EXTRACT(EPOCH FROM (date_trunc('day', created_at) - v_start)) / 86400)::INT AS day_idx,
      count(*)::INT AS cnt
    FROM visits
    WHERE org_id = p_org_id AND deleted_at IS NULL
      AND created_at >= v_start AND created_at < v_start + (p_days || ' days')::INTERVAL
    GROUP BY 1
  )
  SELECT jsonb_build_object(
    'labels', (SELECT jsonb_agg(to_char(v_start + (n || ' days')::INTERVAL, 'Mon DD') ORDER BY n) FROM day_series),
    'patientGrowth', (SELECT jsonb_agg(COALESCE(pc.cnt, 0) ORDER BY ds.n) FROM day_series ds LEFT JOIN patient_counts pc ON pc.day_idx = ds.n),
    'staffUtilization', (SELECT jsonb_agg(COALESCE(ac.cnt, 0) ORDER BY ds.n) FROM day_series ds LEFT JOIN appointment_counts ac ON ac.day_idx = ds.n),
    'visitTrends', (SELECT jsonb_agg(COALESCE(vc.cnt, 0) ORDER BY ds.n) FROM day_series ds LEFT JOIN visit_counts vc ON vc.day_idx = ds.n)
  ) INTO v_result;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_dashboard_charts(UUID, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_charts(UUID, INT) TO service_role;

-- 2. Indexes for Disk IO
CREATE INDEX IF NOT EXISTS idx_patients_org_created
  ON patients (org_id, created_at) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_appointments_org_starts
  ON appointments (org_id, starts_at) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_visits_org_created
  ON visits (org_id, created_at) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_audit_logs_org_occurred
  ON audit_logs (org_id, occurred_at DESC);

-- 3. Fix 403 on org-scoped APIs: is_org_member/is_org_admin must be SECURITY DEFINER
-- so they can read organization_members without being blocked by RLS (circular dependency).
CREATE OR REPLACE FUNCTION is_org_member(target_org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM organization_members om
    WHERE om.org_id = target_org_id
      AND om.user_id = auth.uid()
      AND om.status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION is_org_admin(target_org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM organization_members om
    WHERE om.org_id = target_org_id
      AND om.user_id = auth.uid()
      AND om.status = 'active'
      AND om.role IN ('super_admin', 'org_admin', 'care_coordinator')
  );
$$;
