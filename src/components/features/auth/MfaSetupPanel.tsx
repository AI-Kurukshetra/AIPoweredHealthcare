"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CheckCircle2, Shield, Smartphone } from "lucide-react";
import QRCode from "qrcode";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type MfaSetupPanelProps = {
  nextPath: string;
};

type EnrollState = {
  factorId: string;
  qrCodeSvg: string | null;
  qrCodeDataUrl: string | null;
  otpAuthUrl: string | null;
  secret: string;
};

function encodeQrDataUrl(qrCodeSvg: string) {
  return `data:image/svg+xml;utf-8,${encodeURIComponent(qrCodeSvg)}`;
}

function normalizeTotpCode(value: string) {
  return value.replace(/\D/g, "").slice(0, 6);
}

async function resolveQrDataUrl(
  qrCodeSvg: string | null,
  otpAuthUrl: string | null
) {
  if (qrCodeSvg) {
    const trimmed = qrCodeSvg.trim();
    if (trimmed.startsWith("data:image/")) {
      return trimmed;
    }
    if (trimmed.startsWith("<svg")) {
      return encodeQrDataUrl(trimmed);
    }
  }

  if (otpAuthUrl) {
    try {
      return await QRCode.toDataURL(otpAuthUrl, { margin: 1, width: 256 });
    } catch {
      return null;
    }
  }

  return null;
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

    const { data: listedFactors, error: listError } = await supabase.auth.mfa.listFactors();
    if (listError) {
      setIsBusy(false);
      setErrorMessage("Unable to inspect existing MFA factors.");
      return;
    }

    const existingTotpFactors = listedFactors?.totp ?? [];
    const verifiedFactor = existingTotpFactors.find((factor) => factor.status === "verified");
    if (verifiedFactor) {
      setFactorId(verifiedFactor.id);
      setEnrollState(null);
      setIsBusy(false);
      setErrorMessage(
        "MFA is already enrolled for this account. Enter the current authenticator code to continue, or use Reset MFA Setup."
      );
      return;
    }

    // Remove stale unverified factors to avoid friendly-name conflicts.
    for (const factor of existingTotpFactors) {
      await supabase.auth.mfa.unenroll({ factorId: factor.id });
    }

    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: `Healthcare Workforce TOTP ${new Date().toISOString()}`,
    });

    if (error || !data || !("totp" in data)) {
      setIsBusy(false);
      const enrollErrorCode = error?.code ?? "";
      if (enrollErrorCode === "mfa_factor_name_conflict") {
        setErrorMessage(
          "A TOTP factor with this name already exists. Click Reset MFA Setup and enroll again."
        );
      } else {
        setErrorMessage("Unable to enroll MFA right now.");
      }
      return;
    }

    const totpPayload = data.totp as {
      qr_code?: string;
      uri?: string;
      secret?: string;
    };

    const qrCodeSvg = totpPayload.qr_code ?? null;
    const otpAuthUrl = totpPayload.uri ?? null;
    const qrCodeDataUrl = await resolveQrDataUrl(qrCodeSvg, otpAuthUrl);

    setFactorId(data.id);
    setEnrollState({
      factorId: data.id,
      qrCodeSvg,
      qrCodeDataUrl,
      otpAuthUrl,
      secret: totpPayload.secret ?? "",
    });
    setIsBusy(false);
  }

  async function handleResetMfa() {
    setIsBusy(true);
    setErrorMessage(null);

    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) {
      setIsBusy(false);
      setErrorMessage("Unable to reset MFA factors right now.");
      return;
    }

    const totpFactors = data?.totp ?? [];
    for (const factor of totpFactors) {
      await supabase.auth.mfa.unenroll({ factorId: factor.id });
    }

    setFactorId("");
    setEnrollState(null);
    setVerificationCode("");
    setIsBusy(false);
  }

  async function handleVerifyTotp() {
    setIsBusy(true);
    setErrorMessage(null);

    const normalizedCode = normalizeTotpCode(verificationCode);

    if (normalizedCode.length !== 6) {
      setIsBusy(false);
      setErrorMessage("Enter a valid 6-digit authenticator code.");
      return;
    }

    const { data: listedFactors, error: listError } = await supabase.auth.mfa.listFactors();
    if (listError) {
      setIsBusy(false);
      setErrorMessage("Unable to load MFA factors for verification.");
      return;
    }

    const orderedFactorIds = [
      factorId,
      enrollState?.factorId,
      ...((listedFactors?.totp ?? []).map((factor) => factor.id)),
    ].filter((id, index, arr): id is string => Boolean(id) && arr.indexOf(id) === index);

    if (!orderedFactorIds.length) {
      setIsBusy(false);
      setErrorMessage("No MFA factor found. Enroll first.");
      return;
    }

    let isVerified = false;
    let lastErrorCode: string | null = null;

    for (const candidateFactorId of orderedFactorIds) {
      const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
        factorId: candidateFactorId,
        code: normalizedCode,
      });

      if (!verifyError) {
        isVerified = true;
        setFactorId(candidateFactorId);
        break;
      }

      lastErrorCode = verifyError.code ?? null;
    }

    if (!isVerified) {
      setIsBusy(false);
      if (lastErrorCode === "mfa_verification_failed") {
        setErrorMessage(
          "Invalid code. Ensure your authenticator app time is set automatically and try the newest 6-digit code."
        );
      } else {
        setErrorMessage("Unable to verify MFA right now. Try again.");
      }
      return;
    }

    router.replace(nextPath);
    router.refresh();
  }

  return (
    <Card className="auth-card border-cyan-100/80 bg-white/90">
      <CardHeader>
        <div className="mb-2 flex items-center gap-2 text-cyan-700">
          <Shield className="h-4 w-4" />
          <CardTitle className="text-lg">TOTP Authenticator Setup</CardTitle>
        </div>
        <CardDescription>
          Enroll an authenticator app and verify a 6-digit code to reach AAL2.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {!enrollState ? (
          <Button
            type="button"
            onClick={handleEnrollTotp}
            disabled={isBusy}
            className="w-full bg-cyan-700 hover:bg-cyan-600"
          >
            <Smartphone className="h-4 w-4" />
            {isBusy ? "Enrolling..." : "Enroll Authenticator"}
          </Button>
        ) : (
          <div className="space-y-3">
            {enrollState.qrCodeDataUrl ? (
              <Image
                src={enrollState.qrCodeDataUrl}
                alt="MFA QR code"
                width={176}
                height={176}
                unoptimized
                className="rounded-xl border border-slate-200 bg-white p-3 shadow-[0_8px_28px_-20px_rgba(15,23,42,0.45)]"
              />
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                QR preview unavailable. Use manual secret entry in your authenticator app.
              </div>
            )}
            <p className="text-xs text-slate-600">
              Can&apos;t scan? Use secret:
              <span className="ml-2 rounded bg-slate-100 px-2 py-1 font-mono text-slate-800">
                {enrollState.secret}
              </span>
            </p>
            {enrollState.otpAuthUrl ? (
              <p className="break-all text-xs text-slate-500">{enrollState.otpAuthUrl}</p>
            ) : null}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="totpCode">Verification code</Label>
          <Input
            id="totpCode"
            name="totpCode"
            value={verificationCode}
            onChange={(event) => setVerificationCode(normalizeTotpCode(event.target.value))}
            placeholder="123456"
            inputMode="numeric"
            autoComplete="one-time-code"
          />
          <Button
            type="button"
            onClick={handleVerifyTotp}
            disabled={isBusy || verificationCode.trim().length < 6}
            className="w-full bg-cyan-700 hover:bg-cyan-600"
          >
            <CheckCircle2 className="h-4 w-4" />
            {isBusy ? "Verifying..." : "Verify and Continue"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleResetMfa}
            disabled={isBusy}
            className="w-full"
          >
            Reset MFA Setup
          </Button>
        </div>

        {errorMessage ? <p className="text-sm text-rose-700">{errorMessage}</p> : null}
      </CardContent>
    </Card>
  );
}
