"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { X } from "lucide-react";

type ToastVariant = "success" | "error" | "info";

type Toast = {
  id: number;
  title?: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastContextValue = {
  showToast: (toast: Omit<Toast, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let toastIdCounter = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = toastIdCounter++;
    setToasts((current) => [...current, { id, ...toast }]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  useEffect(() => {
    if (!toasts.length) return;

    const timers = toasts.map((toast) =>
      setTimeout(() => {
        dismiss(toast.id);
      }, 4000)
    );

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [toasts, dismiss]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 sm:items-end sm:pr-4">
        {toasts.map((toast) => {
          const variant = toast.variant ?? "info";
          const base =
            "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur-sm sm:w-96";
          const tone =
            variant === "success"
              ? "border-emerald-200 bg-emerald-50/90 text-emerald-900"
              : variant === "error"
              ? "border-rose-200 bg-rose-50/90 text-rose-900"
              : "border-slate-200 bg-slate-50/90 text-slate-900";

          return (
            <div key={toast.id} className={`${base} ${tone}`}>
              <div className="flex-1">
                {toast.title ? (
                  <p className="font-semibold">{toast.title}</p>
                ) : null}
                {toast.description ? (
                  <p className="mt-0.5 text-xs opacity-90">{toast.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Dismiss notification"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }
  return ctx;
}

