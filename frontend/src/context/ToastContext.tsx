import { createContext, useContext, useMemo, useState } from "react";

type ToastTone = "success" | "error" | "info";
interface Toast { id: number; message: string; tone: ToastTone; }
interface ToastContextValue { showToast: (message: string, tone?: ToastTone) => void; }

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const value = useMemo(() => ({
    showToast: (message: string, tone: ToastTone = "info") => {
      const id = Date.now();
      setToasts((current) => [...current, { id, message, tone }]);
      window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 4200);
    },
  }), []);

  return <ToastContext.Provider value={value}>{children}
    <div className="fixed right-4 top-5 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3" aria-live="polite">
      {toasts.map((toast) => <div key={toast.id} role="status" className={"rounded-lg border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur " + (toast.tone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : toast.tone === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-slate-200 bg-white text-slate-700")}>{toast.message}</div>)}
    </div>
  </ToastContext.Provider>;
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
};
