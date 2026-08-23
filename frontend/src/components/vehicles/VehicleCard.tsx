import { Link } from "react-router-dom";
import { Car, ChevronRight, Edit2, Info, RefreshCw, Trash2, Tag } from "lucide-react";
import type { Vehicle } from "../../types/vehicle";
import { stockStatus } from "../../types/vehicle";
import { formatCurrency } from "../../utils/formatters";
import { cn } from "../../utils/cn";

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
  const statusStyles = 
    status === "In Stock" ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20" : 
    status === "Low Stock" ? "bg-amber-50 text-amber-700 ring-amber-600/20" : 
    "bg-red-50 text-red-700 ring-red-600/20";

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200/50">
      <div className="relative aspect-[16/9] bg-slate-100 p-4 flex items-center justify-center overflow-hidden">
        <Car size={64} className="text-slate-300 transition-transform group-hover:scale-110" />
        <div className="absolute top-3 left-3">
           <span className={cn("inline-flex items-center rounded-md px-2 py-1 text-xs font-bold uppercase tracking-wider ring-1 ring-inset", statusStyles)}>
            {status}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-slate-600 backdrop-blur-sm shadow-sm transition-colors hover:bg-white hover:text-brand">
            <Tag size={16} />
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand">{vehicle.make}</p>
            <h3 className="mt-1 text-xl font-black text-slate-900 line-clamp-1">{vehicle.model}</h3>
            <p className="mt-1 text-sm font-medium text-slate-500">{vehicle.category}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-y border-slate-50 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">List Price</p>
            <p className="text-xl font-black text-slate-900">{formatCurrency(vehicle.price)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Available</p>
            <p className="text-xl font-black text-slate-900">{vehicle.quantity} <span className="text-xs font-bold text-slate-400">UNITS</span></p>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button 
            disabled={vehicle.quantity === 0 || busy} 
            onClick={() => onPurchase(vehicle)} 
            className="flex-1 rounded-xl bg-brand py-3 text-sm font-bold text-white transition-all hover:bg-brand-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            {busy ? "Processing..." : vehicle.quantity === 0 ? "Sold Out" : "Buy Now"}
          </button>
          
          <Link 
            to={`/vehicles/${vehicle.id}`}
            className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3 transition-colors hover:bg-slate-100 hover:text-brand"
            title="View Details"
          >
            <Info size={20} />
          </Link>
        </div>

        {isAdmin && (
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
            <div className="flex gap-1">
              <button onClick={() => onEdit?.(vehicle)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand" title="Edit">
                <Edit2 size={16} />
              </button>
              <button onClick={() => onRestock?.(vehicle)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand" title="Restock">
                <RefreshCw size={16} />
              </button>
              <button onClick={() => onDelete?.(vehicle)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" title="Delete">
                <Trash2 size={16} />
              </button>
            </div>
            <Link to={`/vehicles/${vehicle.id}`} className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-brand">
              Admin View <ChevronRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </article>
  );
};

