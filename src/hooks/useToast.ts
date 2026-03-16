import { useToastContext } from "@/components/providers/ToastProvider";

type ToastOptions = {
  title?: string;
  description?: string;
};

export function useToast() {
  const { showToast } = useToastContext();

  return {
    showSuccess: (options: ToastOptions) =>
      showToast({ ...options, variant: "success" }),
    showError: (options: ToastOptions) =>
      showToast({ ...options, variant: "error" }),
    showInfo: (options: ToastOptions) =>
      showToast({ ...options, variant: "info" }),
  };
}

