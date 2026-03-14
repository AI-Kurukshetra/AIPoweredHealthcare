export const queryKeys = {
  analytics: (orgId: string, days?: number) => ["analytics", orgId, days ?? "dashboard"] as const,
  billing: (orgId: string, page = 1, limit = 100) => ["billing", orgId, page, limit] as const,
  channels: (orgId: string, page = 1, limit = 50) =>
    ["communications", orgId, page, limit] as const,
  messages: (orgId: string, channelId: string, page = 1, limit = 50) =>
    ["messages", orgId, channelId, page, limit] as const,
  compliance: (orgId: string, page = 1, limit = 100) =>
    ["compliance", orgId, page, limit] as const,
  credentials: (orgId: string, staffId?: string, page = 1, limit = 100) =>
    ["credentials", orgId, staffId ?? "all", page, limit] as const,
  incidents: (orgId: string, page = 1, limit = 50) =>
    ["incidents", orgId, page, limit] as const,
  patients: (orgId: string, page = 1, limit = 50) => ["patients", orgId, page, limit] as const,
  patient: (orgId: string, id: string) => ["patients", orgId, id] as const,
  patientVisits: (orgId: string, id: string, page = 1, limit = 20) =>
    ["patient-visits", orgId, id, page, limit] as const,
  schedules: (orgId: string, page = 1, limit = 100) =>
    ["schedules", orgId, page, limit] as const,
  staff: (orgId: string, page = 1, limit = 100) => ["staff", orgId, page, limit] as const,
  visits: (orgId: string, page = 1, limit = 50) => ["visits", orgId, page, limit] as const,
};

