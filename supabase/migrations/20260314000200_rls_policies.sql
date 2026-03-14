-- Enable RLS and baseline HIPAA policies

ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION is_org_member(target_org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
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

CREATE POLICY "organization_members_read_self_org"
ON organization_members FOR SELECT
USING (is_org_member(org_id));

CREATE POLICY "organization_members_admin_manage"
ON organization_members FOR ALL
USING (is_org_admin(org_id))
WITH CHECK (is_org_admin(org_id));

CREATE POLICY "profiles_read_org"
ON profiles FOR SELECT
USING (is_org_member(org_id));

CREATE POLICY "profiles_write_admin"
ON profiles FOR ALL
USING (is_org_admin(org_id))
WITH CHECK (is_org_admin(org_id));

CREATE POLICY "patients_read_org"
ON patients FOR SELECT
USING (is_org_member(org_id) AND deleted_at IS NULL);

CREATE POLICY "patients_insert_admin_or_coordinator"
ON patients FOR INSERT
WITH CHECK (is_org_admin(org_id));

CREATE POLICY "patients_update_admin_or_coordinator"
ON patients FOR UPDATE
USING (is_org_admin(org_id))
WITH CHECK (is_org_admin(org_id));

CREATE POLICY "appointments_read_org"
ON appointments FOR SELECT
USING (is_org_member(org_id) AND deleted_at IS NULL);

CREATE POLICY "appointments_write_admin"
ON appointments FOR ALL
USING (is_org_admin(org_id))
WITH CHECK (is_org_admin(org_id));

CREATE POLICY "visits_read_org_or_assigned_nurse"
ON visits FOR SELECT
USING (
  deleted_at IS NULL
  AND (
    is_org_member(org_id)
    OR assigned_staff_id = auth.uid()
  )
);

CREATE POLICY "visits_insert_assigned_or_admin"
ON visits FOR INSERT
WITH CHECK (
  is_org_admin(org_id)
  OR assigned_staff_id = auth.uid()
);

CREATE POLICY "visits_update_assigned_or_admin"
ON visits FOR UPDATE
USING (is_org_admin(org_id) OR assigned_staff_id = auth.uid())
WITH CHECK (is_org_admin(org_id) OR assigned_staff_id = auth.uid());

CREATE POLICY "visit_notes_read_org"
ON visit_notes FOR SELECT
USING (is_org_member(org_id) AND deleted_at IS NULL);

CREATE POLICY "visit_notes_write_assigned_or_admin"
ON visit_notes FOR ALL
USING (is_org_admin(org_id) OR created_by = auth.uid())
WITH CHECK (is_org_admin(org_id) OR created_by = auth.uid());

CREATE POLICY "credentials_read_org"
ON credentials FOR SELECT
USING (is_org_member(org_id));

CREATE POLICY "credentials_write_admin"
ON credentials FOR ALL
USING (is_org_admin(org_id))
WITH CHECK (is_org_admin(org_id));

CREATE POLICY "compliance_read_org"
ON compliance_records FOR SELECT
USING (is_org_member(org_id));

CREATE POLICY "compliance_write_admin"
ON compliance_records FOR ALL
USING (is_org_admin(org_id))
WITH CHECK (is_org_admin(org_id));

CREATE POLICY "incidents_read_org"
ON incidents FOR SELECT
USING (is_org_member(org_id) AND deleted_at IS NULL);

CREATE POLICY "incidents_create_org_member"
ON incidents FOR INSERT
WITH CHECK (is_org_member(org_id));

CREATE POLICY "incidents_update_admin"
ON incidents FOR UPDATE
USING (is_org_admin(org_id))
WITH CHECK (is_org_admin(org_id));

CREATE POLICY "channels_read_org"
ON channels FOR SELECT
USING (is_org_member(org_id));

CREATE POLICY "channels_write_admin"
ON channels FOR ALL
USING (is_org_admin(org_id))
WITH CHECK (is_org_admin(org_id));

CREATE POLICY "messages_read_org"
ON messages FOR SELECT
USING (is_org_member(org_id) AND deleted_at IS NULL);

CREATE POLICY "messages_write_org"
ON messages FOR INSERT
WITH CHECK (is_org_member(org_id) AND sender_id = auth.uid());

CREATE POLICY "billing_read_org"
ON billing_records FOR SELECT
USING (is_org_member(org_id) AND deleted_at IS NULL);

CREATE POLICY "billing_write_admin_or_billing"
ON billing_records FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.org_id = billing_records.org_id
      AND om.user_id = auth.uid()
      AND om.status = 'active'
      AND om.role IN ('super_admin', 'org_admin', 'billing_staff')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.org_id = billing_records.org_id
      AND om.user_id = auth.uid()
      AND om.status = 'active'
      AND om.role IN ('super_admin', 'org_admin', 'billing_staff')
  )
);

CREATE POLICY "audit_logs_read_admin"
ON audit_logs FOR SELECT
USING (is_org_admin(org_id));

CREATE POLICY "audit_logs_insert_org_member"
ON audit_logs FOR INSERT
WITH CHECK (is_org_member(org_id));

CREATE POLICY "audit_logs_no_update"
ON audit_logs FOR UPDATE
USING (FALSE);

CREATE POLICY "audit_logs_no_delete"
ON audit_logs FOR DELETE
USING (FALSE);
