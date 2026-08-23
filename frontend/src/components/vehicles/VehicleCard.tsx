import type { Vehicle } from "../../types/vehicle";
import { stockStatus } from "../../types/vehicle";
import { formatCurrency } from "../../utils/formatters";

interface Props {
  vehicle: Vehicle;
  isAdmin: boolean;
  busy?: boolean;
  onPurchase: (vehicle: Vehicle) => void;
  onEdit?: (vehicle: Vehicle) => void;
  onDelete?: (vehicle: Vehicle) => void;
  onRestock?: (vehicle: Vehicle) => void;
}

export const VehicleCard = ({ vehicle, isAdmin, busy, onPurchase, onEdit, onDelete, onRestock }: Props) => {
  const status = stockStatus(vehicle.quantity);
  const statusStyles = status === "In Stock" ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20" : status === "Low Stock" ? "bg-amber-50 text-amber-700 ring-amber-600/20" : "bg-red-50 text-red-700 ring-red-600/20";

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-card transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{vehicle.make}</p>
          <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">{vehicle.model}</h3>
          <p className="mt-1 text-sm text-slate-500">{vehicle.category}</p>
        </div>
        <span className={"inline-flex shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ring-inset " + statusStyles}>{status}</span>
      </div>

      <dl className="mt-7 grid grid-cols-2 border-y border-slate-100 py-4">
        <div><dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Price</dt><dd className="mt-1 text-lg font-semibold text-slate-900">{formatCurrency(vehicle.price)}</dd></div>
        <div className="border-l border-slate-100 pl-5"><dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Available</dt><dd className="mt-1 text-lg font-semibold text-slate-900">{vehicle.quantity} <span className="text-sm font-medium text-slate-500">units</span></dd></div>
      </dl>

      <button disabled={vehicle.quantity === 0 || busy} onClick={() => onPurchase(vehicle)} className="mt-5 w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300">
        {busy ? "Processing purchase…" : vehicle.quantity === 0 ? "Out of stock" : "Purchase vehicle"}
      </button>

      {isAdmin && <div className="mt-4 flex items-center justify-end gap-1 border-t border-slate-100 pt-4 text-xs font-medium">
        <button onClick={() => onEdit?.(vehicle)} className="rounded-md px-2.5 py-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand">Edit</button>
        <button onClick={() => onRestock?.(vehicle)} className="rounded-md px-2.5 py-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand">Restock</button>
        <button onClick={() => onDelete?.(vehicle)} className="rounded-md px-2.5 py-1.5 text-slate-500 hover:bg-red-50 hover:text-red-700">Delete</button>
      </div>}
    </article>
  );
};
