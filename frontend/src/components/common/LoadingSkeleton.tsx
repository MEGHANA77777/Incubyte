export const LoadingSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: count }, (_, index) => <div key={index} className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
      <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
      <div className="mt-3 h-7 w-2/3 animate-pulse rounded bg-slate-200" />
      <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-slate-200" />
      <div className="mt-7 h-16 animate-pulse rounded bg-slate-100" />
      <div className="mt-5 h-10 animate-pulse rounded-lg bg-slate-200" />
    </div>)}
  </div>
);
