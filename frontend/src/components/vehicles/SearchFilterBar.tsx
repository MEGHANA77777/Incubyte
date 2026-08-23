import type { VehicleFilters } from "../../types/vehicle";

interface Props { filters: VehicleFilters; onChange: (filters: VehicleFilters) => void; }

export const SearchFilterBar = ({ filters, onChange }: Props) => {
  const set = (key: keyof VehicleFilters, value: string) => {
    const numeric = key === "min_price" || key === "max_price";
    onChange({ ...filters, [key]: value === "" ? undefined : numeric ? Number(value) : value });
  };
  const inputClass = "w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/15";

  return (
    <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-5">
      <input value={filters.make ?? ""} onChange={(e) => set("make", e.target.value)} placeholder="Search make" className={inputClass} />
      <input value={filters.model ?? ""} onChange={(e) => set("model", e.target.value)} placeholder="Search model" className={inputClass} />
      <select value={filters.category ?? ""} onChange={(e) => set("category", e.target.value)} className={inputClass}><option value="">All categories</option><option>Sedan</option><option>SUV</option><option>Hatchback</option><option>Coupe</option><option>Truck</option></select>
      <input value={filters.min_price ?? ""} onChange={(e) => set("min_price", e.target.value)} type="number" min="0" placeholder="Minimum price" className={inputClass} />
      <input value={filters.max_price ?? ""} onChange={(e) => set("max_price", e.target.value)} type="number" min="0" placeholder="Maximum price" className={inputClass} />
    </div>
  );
};
