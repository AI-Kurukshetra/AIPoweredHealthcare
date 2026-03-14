const SENSITIVE_KEYS = new Set(["patient_name", "dob", "ssn", "mrn", "insurance_id"]);

export function scrubPhiFromObject(input: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) =>
      SENSITIVE_KEYS.has(key) ? [key, "[REDACTED]"] : [key, value]
    )
  );
}
