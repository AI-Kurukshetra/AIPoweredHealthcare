"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { createClient } from "@/lib/supabase/client";

type MfaSetupPanelProps = {
  nextPath: string;
};

type EnrollState = {
  factorId: string;
  qrCodeSvg: string;
  secret: string;
};

function encodeQrDataUrl(qrCodeSvg: string) {
  return `data:image/svg+xml;utf-8,${encodeURIComponent(qrCodeSvg)}`;
}

export function MfaSetupPanel({ nextPath }: MfaSetupPanelProps) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [factorId, setFactorId] = useState<string>("");
  const [enrollState, setEnrollState] = useState<EnrollState | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    supabase.auth.mfa.listFactors().then(({ data }) => {
      const verifiedTotp = data?.totp.find((factor) => factor.status === "verified");
      if (verifiedTotp) {
        setFactorId(verifiedTotp.id);
      }
    });
  }, [supabase]);

  async function handleEnrollTotp() {
    setIsBusy(true);
    setErrorMessage(null);

    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Healthcare Workforce TOTP",
    });

    if (error || !data || !("totp" in data)) {
      setIsBusy(false);
      setErrorMessage("Unable to enroll MFA right now.");
      return;
    }

    setFactorId(data.id);
    setEnrollState({
      factorId: data.id,
      qrCodeSvg: data.totp.qr_code,
      secret: data.totp.secret,
    });
    setIsBusy(false);
  }

  async function handleVerifyTotp() {
    setIsBusy(true);
    setErrorMessage(null);

    const effectiveFactorId = factorId || enrollState?.factorId;
    if (!effectiveFactorId) {
      setIsBusy(false);
      setErrorMessage("No MFA factor found. Enroll first.");
      return;
    }

    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: effectiveFactorId,
    });

    if (challengeError || !challengeData) {
      setIsBusy(false);
      setErrorMessage("Unable to create MFA challenge.");
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: effectiveFactorId,
      challengeId: challengeData.id,
      code: verificationCode.trim(),
    });

    if (verifyError) {
      setIsBusy(false);
      setErrorMessage("Invalid verification code. Try again.");
      return;
    }

    router.replace(nextPath);
    router.refresh();
  }

  return (
    <section className="space-y-5 rounded-lg border border-slate-200 bg-white p-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">TOTP Authenticator Setup</h3>
        <p className="mt-1 text-sm text-slate-600">
          Enroll an authenticator app and verify a 6-digit code to reach AAL2.
        </p>
      </div>

      {!enrollState ? (
        <button
          type="button"
          onClick={handleEnrollTotp}
          disabled={isBusy}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isBusy ? "Enrolling..." : "Enroll Authenticator"}
        </button>
      ) : (
        <div className="space-y-3">
          <Image
            src={encodeQrDataUrl(enrollState.qrCodeSvg)}
            alt="MFA QR code"
            width={160}
            height={160}
            unoptimized
            className="rounded-md border border-slate-200 bg-white p-2"
          />
          <p className="text-xs text-slate-600">
            Can&apos;t scan? Use secret:
            <span className="ml-2 rounded bg-slate-100 px-2 py-1 font-mono text-slate-800">
              {enrollState.secret}
            </span>
          </p>
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700" htmlFor="totpCode">
          Verification code
        </label>
        <input
          id="totpCode"
          name="totpCode"
          value={verificationCode}
          onChange={(event) => setVerificationCode(event.target.value)}
          placeholder="123456"
          inputMode="numeric"
          autoComplete="one-time-code"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-slate-900 focus:ring-1"
        />
        <button
          type="button"
          onClick={handleVerifyTotp}
          disabled={isBusy || verificationCode.trim().length < 6}
          className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isBusy ? "Verifying..." : "Verify and Continue"}
        </button>
      </div>

      {errorMessage ? <p className="text-sm text-rose-700">{errorMessage}</p> : null}
    </section>
  );
}
