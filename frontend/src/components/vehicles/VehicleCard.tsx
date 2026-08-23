import type { Vehicle } from "../../types/vehicle";
import { stockStatus } from "../../types/vehicle";
import { formatCurrency } from "../../utils/formatters";

interface Props {
  vehicle: Vehicle; isAdmin: boolean; busy?: boolean;
  onPurchase: (vehicle: Vehicle) => void;
  onEdit?: (vehicle: Vehicle) => void; onDelete?: (vehicle: Vehicle) => void; onRestock?: (vehicle: Vehicle) => void;
}

export const VehicleCard = ({ vehicle, isAdmin, busy, onPurchase, onEdit, onDelete, onRestock }: Props) => {
  const status = stockStatus(vehicle.quantity);
  const statusStyles = status === "In Stock" ? "bg-emerald-400/15 text-emerald-300" : status === "Low Stock" ? "bg-amber-400/15 text-amber-300" : "bg-red-400/15 text-red-300";
  return (
    <article className="group overflow-hidden rounded-2xl border border-white/10 bg-stone-900 shadow-xl shadow-black/10 transition hover:-translate-y-1 hover:border-amber-400/50">
      <div className="relative h-36 bg-gradient-to-br from-stone-700 via-stone-800 to-stone-950 p-5">
        <div className="absolute -right-5 bottom-0 text-8xl font-black italic text-white/5">A</div>
        <span className={"rounded-full px-2.5 py-1 text-xs font-bold " + statusStyles}>{status}</span>
        <p className="mt-7 text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">{vehicle.category}</p>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold text-white">{vehicle.make} {vehicle.model}</h3>
        <div className="mt-4 flex items-end justify-between"><div><p className="text-xs text-stone-500">Drive-away price</p><p className="text-lg font-bold text-amber-300">{formatCurrency(vehicle.price)}</p></div><p className="text-right text-sm text-stone-400"><span className="block text-lg font-bold text-white">{vehicle.quantity}</span>in stock</p></div>
        <button disabled={vehicle.quantity === 0 || busy} onClick={() => onPurchase(vehicle)} className="mt-5 w-full rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-stone-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-stone-700 disabled:text-stone-400">{busy ? "Processing…" : vehicle.quantity === 0 ? "Currently unavailable" : "Purchase vehicle"}</button>
        {isAdmin && <div className="mt-3 grid grid-cols-3 gap-2 text-xs"><button onClick={() => onEdit?.(vehicle)} className="rounded-lg border border-white/10 py-2 text-stone-300 hover:border-white/30">Edit</button><button onClick={() => onRestock?.(vehicle)} className="rounded-lg border border-white/10 py-2 text-stone-300 hover:border-white/30">Restock</button><button onClick={() => onDelete?.(vehicle)} className="rounded-lg border border-red-400/30 py-2 text-red-300 hover:bg-red-400/10">Delete</button></div>}
      </div>
    </article>
  );
};
