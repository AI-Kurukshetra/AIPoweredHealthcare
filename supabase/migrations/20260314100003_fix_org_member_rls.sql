-- Fix 403 on org-scoped APIs: is_org_member/is_org_admin must be SECURITY DEFINER
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
