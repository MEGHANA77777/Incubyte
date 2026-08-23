import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SearchFilterBar } from "../components/vehicles/SearchFilterBar";
import { VehicleCard } from "../components/vehicles/VehicleCard";
import { useAuthStore } from "../store/authStore";
import { getVehicles, purchaseVehicle, searchVehicles } from "../services/vehicles";
import type { Vehicle, VehicleFilters } from "../types/vehicle";
import { useToast } from "../context/ToastContext";

const emptyFilters: VehicleFilters = {};

const Vehicles = () => {
  const { isAuthenticated, user } = useAuthStore();
  const { showToast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filters, setFilters] = useState<VehicleFilters>(emptyFilters);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string>();
  const [message, setMessage] = useState<string>();
  const isFiltering = useMemo(() => Object.values(filters).some(Boolean), [filters]);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);
        const result = isFiltering ? await searchVehicles(filters) : (await getVehicles()).items;
        setVehicles(result);
      } catch {
        setMessage("We couldn't load the inventory. Check that the API is running.");
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [filters, isFiltering]);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(undefined), 3500);
    return () => window.clearTimeout(timer);
  }, [message]);

  const handlePurchase = async (vehicle: Vehicle) => {
    if (!isAuthenticated) { const text = "Please sign in to purchase a vehicle."; setMessage(text); showToast(text, "info"); return; }
    try {
      setBusyId(vehicle.id);
      const updated = await purchaseVehicle(vehicle.id);
      setVehicles((items) => items.map((item) => item.id === updated.id ? updated : item));
      setMessage(`${vehicle.make} ${vehicle.model} purchased successfully.`); showToast(`${vehicle.make} ${vehicle.model} purchased successfully.`, "success");
    } catch (error: unknown) {
      const detail = (error as { response?: { data?: { detail?: string } } }).response?.data?.detail;
      setMessage(detail ?? "Purchase could not be completed."); showToast(detail ?? "Purchase could not be completed.", "error");
    } finally { setBusyId(undefined); }
  };

  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 px-6 py-12 md:px-12">
        <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-brand/10 blur-3xl" />
        <p className="relative text-sm font-bold uppercase tracking-[0.25em] text-brand">Driven by distinction</p>
        <h1 className="relative mt-4 max-w-2xl text-4xl font-black tracking-tight text-white md:text-6xl">Find the car that moves you.</h1>
        <p className="relative mt-5 max-w-xl text-slate-300">Explore our curated collection of exceptional vehicles, with live availability and transparent pricing.</p>
        {!isAuthenticated && <Link to="/login" className="relative mt-7 inline-block rounded-full bg-brand px-5 py-3 text-sm font-bold text-white hover:bg-brand-dark">Unlock your next drive</Link>}
        <div className="relative mt-10 flex gap-8 text-sm"><div><strong className="block text-2xl text-white">{vehicles.length}</strong><span className="text-slate-300">Vehicles shown</span></div><div><strong className="block text-2xl text-white">100%</strong><span className="text-slate-300">Live inventory</span></div><div><strong className="block text-2xl text-white">24/7</strong><span className="text-slate-300">Online access</span></div></div>
      </section>
      <section className="mt-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-semibold text-brand">LIVE INVENTORY</p><h2 className="text-2xl font-bold text-slate-900">Available vehicles</h2></div>{user?.role === "ADMIN" && <Link to="/admin" className="rounded-full border border-brand/30 px-4 py-2 text-sm font-bold text-brand hover:bg-brand/10">Manage inventory</Link>}</div>
        <SearchFilterBar filters={filters} onChange={setFilters} />
        {message && <div role="status" className="mt-5 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">{message}</div>}
        {loading ? <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-80 animate-pulse rounded-2xl bg-white" />)}</div> : vehicles.length === 0 ? <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500">No vehicles match these filters.</div> : <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{vehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} isAdmin={false} busy={busyId === vehicle.id} onPurchase={handlePurchase} />)}</div>}
      </section>
    </main>
  );
};


export default Vehicles;
