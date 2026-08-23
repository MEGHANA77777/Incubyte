import type { VehicleFilters } from "../../types/vehicle";

interface Props { filters: VehicleFilters; onChange: (filters: VehicleFilters) => void; }

export const SearchFilterBar = ({ filters, onChange }: Props) => {
  const set = (key: keyof VehicleFilters, value: string) => {
    const numeric = key === "min_price" || key === "max_price";
    onChange({ ...filters, [key]: value === "" ? undefined : numeric ? Number(value) : value });
  };
  return (
    <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-5">
      <input value={filters.make ?? ""} onChange={(e) => set("make", e.target.value)} placeholder="Make e.g. Honda" className="rounded-xl border border-white/10 bg-stone-900 px-3 py-2.5 text-sm outline-none placeholder:text-stone-500 focus:border-amber-400" />
      <input value={filters.model ?? ""} onChange={(e) => set("model", e.target.value)} placeholder="Model" className="rounded-xl border border-white/10 bg-stone-900 px-3 py-2.5 text-sm outline-none placeholder:text-stone-500 focus:border-amber-400" />
      <input value={filters.category ?? ""} onChange={(e) => set("category", e.target.value)} placeholder="Category" className="rounded-xl border border-white/10 bg-stone-900 px-3 py-2.5 text-sm outline-none placeholder:text-stone-500 focus:border-amber-400" />
      <input value={filters.min_price ?? ""} onChange={(e) => set("min_price", e.target.value)} type="number" min="0" placeholder="Min price" className="rounded-xl border border-white/10 bg-stone-900 px-3 py-2.5 text-sm outline-none placeholder:text-stone-500 focus:border-amber-400" />
      <input value={filters.max_price ?? ""} onChange={(e) => set("max_price", e.target.value)} type="number" min="0" placeholder="Max price" className="rounded-xl border border-white/10 bg-stone-900 px-3 py-2.5 text-sm outline-none placeholder:text-stone-500 focus:border-amber-400" />
    </div>
  );
};
