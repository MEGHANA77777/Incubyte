import type { ReactNode } from "react";

interface Props { open: boolean; title: string; children: ReactNode; onClose: () => void; }

export const Modal = ({ open, title, children, onClose }: Props) => {
  if (!open) return null;
  return <div className="fixed inset-0 z-40 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={title}>
    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
      <div className="mb-5 flex items-center justify-between gap-4"><h2 className="text-xl font-bold text-slate-900">{title}</h2><button onClick={onClose} aria-label="Close dialog" className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900">✕</button></div>
      {children}
    </div>
  </div>;
};
