-- RPC to aggregate chart data with minimal disk IO (3 grouped queries vs full row fetches)
-- Run: supabase db push (or apply via Supabase Dashboard SQL Editor)

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
