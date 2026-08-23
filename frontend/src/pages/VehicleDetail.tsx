import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Car, CheckCircle2, ChevronRight, ShieldCheck, Tag, Zap } from "lucide-react";
import { getVehicle, purchaseVehicle } from "../services/vehicles";
import { useAuthStore } from "../store/authStore";
import { useToast } from "../context/ToastContext";
import type { Vehicle } from "../types/vehicle";
import { stockStatus } from "../types/vehicle";
import { formatCurrency } from "../utils/formatters";
import { cn } from "../utils/cn";

const VehicleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { isAuthenticated, user } = useAuthStore();
  
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    const fetchVehicle = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getVehicle(id);
        setVehicle(data);
      } catch (error) {
        showToast("Could not load vehicle details.", "error");
        navigate("/vehicles");
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [id, navigate, showToast]);

  const handlePurchase = async () => {
    if (!vehicle) return;
    if (!isAuthenticated) {
      showToast("Please sign in to purchase a vehicle.", "info");
      navigate("/login");
      return;
    }
    
    try {
      setPurchasing(true);
      const updated = await purchaseVehicle(vehicle.id);
      setVehicle(updated);
      showToast(`${vehicle.make} ${vehicle.model} purchased successfully!`, "success");
    } catch (error: any) {
      showToast(error.response?.data?.detail ?? "Purchase failed.", "error");
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-brand" />
        <p className="text-sm font-medium text-slate-500">Loading vehicle details...</p>
      </div>
    );
  }

  if (!vehicle) return null;

  const status = stockStatus(vehicle.quantity);
  const statusStyles = 
    status === "In Stock" ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20" : 
    status === "Low Stock" ? "bg-amber-50 text-amber-700 ring-amber-600/20" : 
    "bg-red-50 text-red-700 ring-red-600/20";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/vehicles" className="group mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-brand">
        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
        Back to Inventory
      </Link>

      <div className="grid gap-12 lg:grid-cols-2">
        {/* Left: Image/Icon Placeholder */}
        <div className="space-y-6">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
            <Car size={120} className="text-slate-100" />
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand/5 to-transparent opacity-50" />
            <div className="absolute top-6 left-6">
              <span className={cn("inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider ring-1 ring-inset", statusStyles)}>
                {status}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-square rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-200">
                <Car size={32} />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Details */}
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-3">
             <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand uppercase tracking-widest">{vehicle.category}</span>
             {vehicle.quantity > 10 && <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 uppercase tracking-widest"><Zap size={12} fill="currentColor" /> Popular Choice</span>}
          </div>
          
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">{vehicle.make} {vehicle.model}</h1>
          <p className="mt-4 text-lg text-slate-600 leading-relaxed">
            Experience unparalleled performance and luxury with the {vehicle.make} {vehicle.model}. 
            This {vehicle.category} has been meticulously maintained and is ready for its next journey.
          </p>

          <div className="mt-8 rounded-3xl bg-white border border-slate-200 p-8 shadow-sm">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Total Price</p>
                <p className="mt-1 text-4xl font-black text-slate-900">{formatCurrency(vehicle.price)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Availability</p>
                <p className="mt-1 text-2xl font-black text-slate-900">{vehicle.quantity} <span className="text-sm font-bold text-slate-400">UNITS</span></p>
              </div>
            </div>

            <button 
              disabled={vehicle.quantity === 0 || purchasing}
              onClick={handlePurchase}
              className="mt-8 w-full rounded-2xl bg-brand py-5 text-lg font-bold text-white shadow-lg shadow-brand/20 transition-all hover:bg-brand-dark hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
            >
              {purchasing ? "Processing Purchase..." : vehicle.quantity === 0 ? "Currently Out of Stock" : "Purchase This Vehicle"}
            </button>
            
            <p className="mt-4 text-center text-xs font-medium text-slate-400 flex items-center justify-center gap-2">
              <ShieldCheck size={14} className="text-emerald-500" /> Secure transaction & instant confirmation
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-brand">
                <Tag size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Fixed Pricing</h4>
                <p className="mt-1 text-sm text-slate-500">No hidden fees or surprise charges at checkout.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-brand">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Verified Stock</h4>
                <p className="mt-1 text-sm text-slate-500">Every vehicle in our system is live and ready.</p>
              </div>
            </div>
          </div>

          {user?.role === "ADMIN" && (
            <div className="mt-10 flex items-center justify-between rounded-2xl border border-dashed border-brand/30 bg-brand/5 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white shadow-md">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-brand">Administrator Access</p>
                  <p className="text-sm font-semibold text-slate-700">You have management rights for this vehicle.</p>
                </div>
              </div>
              <Link to="/admin" className="inline-flex items-center gap-1 text-sm font-bold text-brand hover:underline">
                Manage Inventory <ChevronRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleDetail;
