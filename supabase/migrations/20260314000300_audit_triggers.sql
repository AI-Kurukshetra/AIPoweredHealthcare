-- Updated_at + version bump trigger for mutable tables

CREATE OR REPLACE FUNCTION set_updated_at_and_version()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  IF TG_OP = 'UPDATE' THEN
    NEW.version = COALESCE(OLD.version, 0) + 1;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_organization_members_updated
BEFORE UPDATE ON organization_members
FOR EACH ROW EXECUTE FUNCTION set_updated_at_and_version();

CREATE TRIGGER trg_profiles_updated
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at_and_version();

CREATE TRIGGER trg_patients_updated
BEFORE UPDATE ON patients
FOR EACH ROW EXECUTE FUNCTION set_updated_at_and_version();

CREATE TRIGGER trg_appointments_updated
BEFORE UPDATE ON appointments
FOR EACH ROW EXECUTE FUNCTION set_updated_at_and_version();

CREATE TRIGGER trg_visits_updated
BEFORE UPDATE ON visits
FOR EACH ROW EXECUTE FUNCTION set_updated_at_and_version();

CREATE TRIGGER trg_visit_notes_updated
BEFORE UPDATE ON visit_notes
FOR EACH ROW EXECUTE FUNCTION set_updated_at_and_version();

CREATE TRIGGER trg_credentials_updated
BEFORE UPDATE ON credentials
FOR EACH ROW EXECUTE FUNCTION set_updated_at_and_version();

CREATE TRIGGER trg_compliance_records_updated
BEFORE UPDATE ON compliance_records
FOR EACH ROW EXECUTE FUNCTION set_updated_at_and_version();

CREATE TRIGGER trg_incidents_updated
BEFORE UPDATE ON incidents
FOR EACH ROW EXECUTE FUNCTION set_updated_at_and_version();

CREATE TRIGGER trg_channels_updated
BEFORE UPDATE ON channels
FOR EACH ROW EXECUTE FUNCTION set_updated_at_and_version();

CREATE TRIGGER trg_messages_updated
BEFORE UPDATE ON messages
FOR EACH ROW EXECUTE FUNCTION set_updated_at_and_version();

CREATE TRIGGER trg_billing_records_updated
BEFORE UPDATE ON billing_records
FOR EACH ROW EXECUTE FUNCTION set_updated_at_and_version();

-- Prevent audit log mutation (append-only controls)
CREATE OR REPLACE FUNCTION forbid_audit_log_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs is append-only';
END;
$$;

CREATE TRIGGER trg_audit_logs_no_update
BEFORE UPDATE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION forbid_audit_log_mutation();

CREATE TRIGGER trg_audit_logs_no_delete
BEFORE DELETE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION forbid_audit_log_mutation();
