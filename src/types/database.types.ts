export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      organization_members: {
        Row: {
          id: string;
          org_id: string;
          user_id: string;
          role:
            | "super_admin"
            | "org_admin"
            | "care_coordinator"
            | "field_nurse"
            | "billing_staff"
            | "patient";
          status: "active" | "inactive";
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          version: number;
        };
        Insert: {
          id?: string;
          org_id: string;
          user_id: string;
          role:
            | "super_admin"
            | "org_admin"
            | "care_coordinator"
            | "field_nurse"
            | "billing_staff"
            | "patient";
          status?: "active" | "inactive";
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          version?: number;
        };
        Update: Partial<Database["public"]["Tables"]["organization_members"]["Insert"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          org_id: string;
          full_name: string;
          phone: string | null;
          consent_given_at: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          version: number;
        };
        Insert: {
          id: string;
          org_id: string;
          full_name: string;
          phone?: string | null;
          consent_given_at?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          version?: number;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      patients: {
        Row: {
          id: string;
          org_id: string;
          first_name: string;
          last_name: string;
          dob_encrypted: string | null;
          phone: string | null;
          care_status: "active" | "inactive" | "discharged";
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          deleted_at: string | null;
          version: number;
        };
        Insert: {
          id?: string;
          org_id: string;
          first_name: string;
          last_name: string;
          dob_encrypted?: string | null;
          phone?: string | null;
          care_status?: "active" | "inactive" | "discharged";
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          deleted_at?: string | null;
          version?: number;
        };
        Update: Partial<Database["public"]["Tables"]["patients"]["Insert"]>;
        Relationships: [];
      };
      appointments: {
        Row: {
          id: string;
          org_id: string;
          patient_id: string;
          assigned_staff_id: string | null;
          starts_at: string;
          ends_at: string;
          status: string;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          deleted_at: string | null;
          version: number;
        };
        Insert: {
          id?: string;
          org_id: string;
          patient_id: string;
          assigned_staff_id?: string | null;
          starts_at: string;
          ends_at: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          deleted_at?: string | null;
          version?: number;
        };
        Update: Partial<Database["public"]["Tables"]["appointments"]["Insert"]>;
        Relationships: [];
      };
      visits: {
        Row: {
          id: string;
          org_id: string;
          patient_id: string;
          appointment_id: string | null;
          assigned_staff_id: string | null;
          started_at: string | null;
          completed_at: string | null;
          status: string;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          deleted_at: string | null;
          version: number;
        };
        Insert: {
          id?: string;
          org_id: string;
          patient_id: string;
          appointment_id?: string | null;
          assigned_staff_id?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          deleted_at?: string | null;
          version?: number;
        };
        Update: Partial<Database["public"]["Tables"]["visits"]["Insert"]>;
        Relationships: [];
      };
      visit_notes: {
        Row: {
          id: string;
          org_id: string;
          visit_id: string;
          patient_id: string;
          note: string;
          vitals: Json | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          deleted_at: string | null;
          version: number;
        };
        Insert: {
          id?: string;
          org_id: string;
          visit_id: string;
          patient_id: string;
          note: string;
          vitals?: Json | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          deleted_at?: string | null;
          version?: number;
        };
        Update: Partial<Database["public"]["Tables"]["visit_notes"]["Insert"]>;
        Relationships: [];
      };
      credentials: {
        Row: {
          id: string;
          org_id: string;
          staff_id: string;
          credential_type: string;
          credential_number: string | null;
          issued_at: string | null;
          expires_at: string;
          status: string;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          version: number;
        };
        Insert: {
          id?: string;
          org_id: string;
          staff_id: string;
          credential_type: string;
          credential_number?: string | null;
          issued_at?: string | null;
          expires_at: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          version?: number;
        };
        Update: Partial<Database["public"]["Tables"]["credentials"]["Insert"]>;
        Relationships: [];
      };
      compliance_records: {
        Row: {
          id: string;
          org_id: string;
          credential_id: string | null;
          staff_id: string | null;
          status: string;
          checked_at: string;
          details: Json | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          version: number;
        };
        Insert: {
          id?: string;
          org_id: string;
          credential_id?: string | null;
          staff_id?: string | null;
          status: string;
          checked_at?: string;
          details?: Json | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          version?: number;
        };
        Update: Partial<Database["public"]["Tables"]["compliance_records"]["Insert"]>;
        Relationships: [];
      };
      incidents: {
        Row: {
          id: string;
          org_id: string;
          patient_id: string | null;
          reported_by: string | null;
          severity: "1" | "2" | "3" | "4" | "5";
          title: string;
          description: string;
          status: string;
          occurred_at: string;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          deleted_at: string | null;
          version: number;
        };
        Insert: {
          id?: string;
          org_id: string;
          patient_id?: string | null;
          reported_by?: string | null;
          severity: "1" | "2" | "3" | "4" | "5";
          title: string;
          description: string;
          status?: string;
          occurred_at: string;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          deleted_at?: string | null;
          version?: number;
        };
        Update: Partial<Database["public"]["Tables"]["incidents"]["Insert"]>;
        Relationships: [];
      };
      channels: {
        Row: {
          id: string;
          org_id: string;
          patient_id: string | null;
          name: string;
          channel_type: string;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          version: number;
        };
        Insert: {
          id?: string;
          org_id: string;
          patient_id?: string | null;
          name: string;
          channel_type?: string;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          version?: number;
        };
        Update: Partial<Database["public"]["Tables"]["channels"]["Insert"]>;
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          org_id: string;
          channel_id: string;
          sender_id: string;
          body: string;
          escalation_flag: boolean;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          deleted_at: string | null;
          version: number;
        };
        Insert: {
          id?: string;
          org_id: string;
          channel_id: string;
          sender_id: string;
          body: string;
          escalation_flag?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          deleted_at?: string | null;
          version?: number;
        };
        Update: Partial<Database["public"]["Tables"]["messages"]["Insert"]>;
        Relationships: [];
      };
      billing_records: {
        Row: {
          id: string;
          org_id: string;
          visit_id: string | null;
          patient_id: string | null;
          cpt_code: string;
          icd10_code: string | null;
          units: number;
          amount_cents: number;
          status: string;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          deleted_at: string | null;
          version: number;
        };
        Insert: {
          id?: string;
          org_id: string;
          visit_id?: string | null;
          patient_id?: string | null;
          cpt_code: string;
          icd10_code?: string | null;
          units?: number;
          amount_cents: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          deleted_at?: string | null;
          version?: number;
        };
        Update: Partial<Database["public"]["Tables"]["billing_records"]["Insert"]>;
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          org_id: string;
          actor_id: string | null;
          resource_type: string;
          resource_id: string | null;
          action: "READ" | "CREATE" | "UPDATE" | "DELETE" | "EXPORT";
          ip_address: string | null;
          user_agent: string | null;
          metadata: Json | null;
          occurred_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          actor_id?: string | null;
          resource_type: string;
          resource_id?: string | null;
          action: "READ" | "CREATE" | "UPDATE" | "DELETE" | "EXPORT";
          ip_address?: string | null;
          user_agent?: string | null;
          metadata?: Json | null;
          occurred_at?: string;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      healthcare_role:
        | "super_admin"
        | "org_admin"
        | "care_coordinator"
        | "field_nurse"
        | "billing_staff"
        | "patient";
      membership_status: "active" | "inactive";
      patient_care_status: "active" | "inactive" | "discharged";
      audit_action: "READ" | "CREATE" | "UPDATE" | "DELETE" | "EXPORT";
      incident_severity: "1" | "2" | "3" | "4" | "5";
    };
    CompositeTypes: Record<string, never>;
  };
};
