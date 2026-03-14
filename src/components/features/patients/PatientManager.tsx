"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Phone, Search, SearchX, UserPlus, Users } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { PatientListItem } from "@/features/patients/types";
import { PatientTable } from "@/components/features/patients/PatientTable";
import { Pagination } from "@/components/shared/Pagination";
import { apiGet, apiPost } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";

type PatientManagerProps = {
  orgId: string;
  initialPatients: PatientListItem[];
};

export function PatientManager({ orgId, initialPatients }: PatientManagerProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | PatientListItem["careStatus"]>("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [careStatus, setCareStatus] = useState<PatientListItem["careStatus"]>("active");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const {
    data: patients = initialPatients,
    error: patientsQueryError,
    isError: isPatientsQueryError,
  } = useQuery({
    queryKey: queryKeys.patients(orgId, 1, 200),
    queryFn: () =>
      apiGet<PatientListItem[]>("/api/patients", { orgId, page: 1, limit: 200 }),
    initialData: initialPatients,
  });

  const filtered = useMemo(
    () =>
      patients.filter((patient) => {
        const matchesSearch = `${patient.firstName} ${patient.lastName}`
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesStatus =
          statusFilter === "all" ? true : patient.careStatus === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [patients, search, statusFilter]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const census = useMemo(
    () => ({
      total: patients.length,
      active: patients.filter((patient) => patient.careStatus === "active").length,
      inactive: patients.filter((patient) => patient.careStatus === "inactive").length,
      discharged: patients.filter((patient) => patient.careStatus === "discharged").length,
    }),
    [patients]
  );

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const createPatientMutation = useMutation({
    mutationFn: (input: {
      firstName: string;
      lastName: string;
      phone?: string;
      careStatus: PatientListItem["careStatus"];
    }) =>
      apiPost<PatientListItem>("/api/patients", input, {
        orgId,
      }),
    onSuccess: async (createdPatient) => {
      queryClient.setQueryData<PatientListItem[]>(
        queryKeys.patients(orgId, 1, 200),
        (previous) => {
          const safePrevious = previous ?? [];
          if (safePrevious.some((patient) => patient.id === createdPatient.id)) {
            return safePrevious;
          }
          return [createdPatient, ...safePrevious];
        }
      );
      await queryClient.invalidateQueries({ queryKey: ["patients", orgId] });
    },
    onError: (mutationError: Error) => {
      setError(mutationError.message || "Unable to create patient.");
    },
  });

  async function createPatient() {
    setIsSubmitting(true);
    setError(null);
    try {
      await createPatientMutation.mutateAsync({
          firstName,
          lastName,
        phone: phone || undefined,
          careStatus,
      });
      setFirstName("");
      setLastName("");
      setPhone("");
      setCareStatus("active");
      setIsFormOpen(false);
    } catch {
      // handled by mutation onError
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl border border-slate-200/70 bg-white/95 p-5 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)]">
          <div className="flex items-center gap-3">
            <span className="rounded-2xl bg-cyan-50 p-3 text-cyan-700">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Total Census
              </p>
              <p className="text-2xl font-semibold text-slate-950">{census.total}</p>
            </div>
          </div>
        </article>
        <article className="rounded-3xl border border-emerald-200/70 bg-emerald-50/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Active Care
          </p>
          <p className="mt-2 text-2xl font-semibold text-emerald-950">{census.active}</p>
          <p className="mt-1 text-sm text-emerald-800/80">Patients with ongoing services.</p>
        </article>
        <article className="rounded-3xl border border-amber-200/70 bg-amber-50/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
            Inactive
          </p>
          <p className="mt-2 text-2xl font-semibold text-amber-950">{census.inactive}</p>
          <p className="mt-1 text-sm text-amber-800/80">Monitor for reactivation or handoff.</p>
        </article>
        <article className="rounded-3xl border border-slate-200/70 bg-slate-100/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
            Discharged
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{census.discharged}</p>
          <p className="mt-1 text-sm text-slate-600">Historical records retained for audit.</p>
        </article>
      </div>

      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search patients by name..."
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-white shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
          />
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1">
            {(["all", "active", "inactive", "discharged"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setStatusFilter(option)}
                className={`rounded-lg px-3 py-2 text-sm font-medium capitalize transition ${
                  statusFilter === option
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isFormOpen ? <SearchX className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            {isFormOpen ? "Cancel" : "Add Patient"}
          </button>
        </div>
      </div>

      {isPatientsQueryError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Unable to load patients from API. {patientsQueryError?.message ?? "Please try again."}
        </div>
      ) : null}

      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white/80 backdrop-blur-xl border border-indigo-100 rounded-2xl p-6 shadow-xl shadow-indigo-100/50">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-indigo-500" />
                  Register New Patient
                </h3>
                <p className="text-sm text-slate-500">
                  Create the patient record first, then continue the care plan and visit workflow from the profile page.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-4 mb-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">First Name</label>
                  <input
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    placeholder="Jane"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Last Name</label>
                  <input
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    placeholder="Doe"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Phone</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="(555) 123-4567"
                      className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Care Status</label>
                  <select
                    value={careStatus}
                    onChange={(event) => setCareStatus(event.target.value as PatientListItem["careStatus"])}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="discharged">Discharged</option>
                  </select>
                </div>
              </div>

              {error ? <p className="text-sm text-rose-600 mb-4 bg-rose-50 p-3 rounded-lg border border-rose-100">{error}</p> : null}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={createPatient}
                  disabled={isSubmitting || !firstName.trim() || !lastName.trim()}
                  className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-200/50 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 transition-all flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : "Save Patient Record"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-3xl border border-slate-200/70 bg-white/95 p-5 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)]">
          <div className="flex items-center gap-3">
            <span className="rounded-2xl bg-cyan-50 p-3 text-cyan-700">
              <Activity className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-lg font-semibold text-slate-950">Care Registry Control</h3>
              <p className="text-sm text-slate-600">
                Filter the census, open a patient profile, and continue care-plan or visit work from a single registry.
              </p>
            </div>
          </div>
        </section>
        <section className="rounded-3xl border border-slate-200/70 bg-gradient-to-br from-slate-950 to-slate-800 p-5 text-white shadow-[0_20px_45px_-32px_rgba(15,23,42,0.5)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
            Current View
          </p>
          <p className="mt-2 text-3xl font-semibold">{filtered.length}</p>
          <p className="mt-1 text-sm text-slate-200">
            patient{filtered.length === 1 ? "" : "s"} match the current search and status filters.
          </p>
        </section>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <PatientTable patients={paged} />
        {filtered.length === 0 && (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <SearchX className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-700">No patients found</p>
            <p className="text-sm mt-1">Try adjusting your search criteria or register a new patient.</p>
          </div>
        )}
      </div>
      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={filtered.length}
        pageSize={pageSize}
        onPageChange={setPage}
      />
    </div>
  );
}
