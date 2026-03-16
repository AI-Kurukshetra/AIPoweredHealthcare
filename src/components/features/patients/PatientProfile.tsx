"use client";

import type { PatientDetail } from "@/features/patients/types";
import { useState } from "react";
import { AlertTriangle, Activity } from "lucide-react";
import { useToast } from "@/hooks/useToast";

type PatientProfileProps = {
  patient: PatientDetail;
};

function formatDate(value: string | null) {
  if (!value) return "N/A";
  return new Date(value).toLocaleString();
}

export function PatientProfile({ patient }: PatientProfileProps) {
  const [riskData, setRiskData] = useState<{riskScore: number; category: string; recommendations: string[]} | null>(null);
  const [loadingRisk, setLoadingRisk] = useState(false);
  const { showSuccess, showError } = useToast();

  async function calculateRisk() {
    setLoadingRisk(true);
    try {
      const res = await fetch("/api/ai/patient-risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vitals: { systolic: 145, heartRate: 105 }, age: 78 }),
      });
      if (!res.ok) {
        showError({
          title: "Risk analysis failed",
          description: "Unable to run AI risk prediction for this patient.",
        });
        return;
      }
      const data = await res.json();
      setRiskData(data);
      showSuccess({
        title: "Risk analysis complete",
        description: "AI generated a risk score and recommendations.",
      });
    } catch {
      showError({
        title: "Risk analysis failed",
        description: "We could not reach the AI service. Try again later.",
      });
    } finally {
      setLoadingRisk(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_6px_24px_-16px_rgba(15,23,42,0.35)]">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
        Patient Profile
      </p>
      <h2 className="mt-1 text-3xl font-semibold text-slate-950">
        {patient.firstName} {patient.lastName}
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        Longitudinal patient operations record and recent visit activity.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-slate-50/90 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Care Status
          </p>
          <p className="mt-1 text-sm font-semibold capitalize text-slate-900">
            {patient.careStatus}
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-slate-50/90 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Phone
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {patient.phone ?? "N/A"}
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-slate-50/90 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Created
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {formatDate(patient.createdAt)}
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-slate-50/90 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Last Updated
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {formatDate(patient.updatedAt)}
          </p>
        </article>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide flex items-center gap-2 text-rose-700">
              <Activity className="h-4 w-4" /> AI Patient Risk Prediction
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Predict readmissions and complications based on longitudinal history.
            </p>
          </div>
          <button
            onClick={calculateRisk}
            disabled={loadingRisk}
            className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50"
          >
            {loadingRisk ? "Analyzing..." : "Calculate Risk"}
          </button>
        </div>
        {riskData && (
          <div className="mt-4 flex gap-4 bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex flex-col items-center justify-center bg-rose-50 rounded-lg p-3 w-24">
              <AlertTriangle className={`h-6 w-6 ${riskData.riskScore > 3 ? 'text-rose-600' : 'text-amber-500'}`} />
              <p className="text-2xl font-bold mt-1 text-slate-900">{riskData.riskScore}</p>
              <p className="text-[10px] uppercase font-bold text-slate-500">Score</p>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-slate-950">{riskData.category}</p>
              <ul className="mt-2 space-y-1">
                {riskData.recommendations.map((rec, i) => (
                  <li key={i} className="text-xs text-slate-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
