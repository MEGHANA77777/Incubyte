import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Modal } from "../components/common/Modal";
import { Navbar } from "../components/common/Navbar";
import { VehicleCard } from "../components/vehicles/VehicleCard";
import { VehicleForm } from "../components/vehicles/VehicleForm";
import { useToast } from "../context/ToastContext";
import { createVehicle, deleteVehicle, getVehicles, purchaseVehicle, restockVehicle, updateVehicle } from "../services/vehicles";
import { useAuthStore } from "../store/authStore";
import type { Vehicle, VehiclePayload } from "../types/vehicle";

type ModalState = "create" | "edit" | "restock" | "delete" | null;

const Admin = () => {
  const user = useAuthStore((state) => state.user);
  const { showToast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selected, setSelected] = useState<Vehicle>();
  const [modal, setModal] = useState<ModalState>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [restockAmount, setRestockAmount] = useState(1);

  const load = async () => {
    try { setLoading(true); setVehicles((await getVehicles(1, 100)).items); }
    catch { showToast("Inventory could not be loaded.", "error"); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  if (user?.role !== "ADMIN") return <Navigate to="/vehicles" replace />;
  const close = () => { setModal(null); setSelected(undefined); };

  const save = async (payload: VehiclePayload) => {
    try {
      setSubmitting(true);
      if (modal === "edit" && selected) { await updateVehicle(selected.id, payload); showToast("Vehicle details updated.", "success"); }
      else { await createVehicle(payload); showToast("Vehicle added to inventory.", "success"); }
      close(); await load();
    } catch (error: unknown) { showToast((error as { response?: { data?: { detail?: string } } }).response?.data?.detail ?? "Vehicle could not be saved.", "error"); }
    finally { setSubmitting(false); }
  };
  const remove = async () => {
    if (!selected) return;
    try { setSubmitting(true); await deleteVehicle(selected.id); showToast("Vehicle removed from inventory.", "success"); close(); await load(); }
    catch { showToast("Vehicle could not be deleted.", "error"); }
    finally { setSubmitting(false); }
  };
  const restock = async () => {
    if (!selected || restockAmount < 1) return;
    try { setSubmitting(true); await restockVehicle(selected.id, restockAmount); showToast("Stock updated successfully.", "success"); close(); await load(); }
    catch { showToast("Vehicle could not be restocked.", "error"); }
    finally { setSubmitting(false); }
  };
  const purchase = async (vehicle: Vehicle) => {
    try { await purchaseVehicle(vehicle.id); showToast("Vehicle purchased successfully.", "success"); await load(); }
    catch (error: unknown) { showToast((error as { response?: { data?: { detail?: string } } }).response?.data?.detail ?? "Purchase could not be completed.", "error"); }
  };
  const open = (kind: ModalState, vehicle?: Vehicle) => { setSelected(vehicle); setModal(kind); };

  return <div className="min-h-screen bg-slate-50"><Navbar /><main className="mx-auto max-w-7xl px-5 py-10">
    <div className="flex flex-wrap items-end justify-between gap-5 rounded-3xl border border-slate-200 bg-white p-7"><div><p className="text-sm font-bold tracking-[0.2em] text-brand">ADMIN CONSOLE</p><h1 className="mt-2 text-3xl font-black text-slate-900">Inventory command centre</h1><p className="mt-2 text-slate-500">Create, update, restock, and retire vehicles in real time.</p></div><button onClick={() => open("create")} className="rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white hover:bg-brand-dark">+ Add vehicle</button></div>
    {loading ? <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <div key={i} className="h-80 animate-pulse rounded-2xl bg-white" />)}</div> : <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{vehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} isAdmin busy={submitting && selected?.id === vehicle.id} onPurchase={purchase} onEdit={(item) => open("edit", item)} onRestock={(item) => open("restock", item)} onDelete={(item) => open("delete", item)} />)}</div>}
    <Modal open={modal === "create" || modal === "edit"} title={modal === "edit" ? "Edit vehicle" : "Add vehicle"} onClose={close}><VehicleForm vehicle={modal === "edit" ? selected : undefined} submitting={submitting} onSubmit={save} /></Modal>
    <Modal open={modal === "restock"} title={"Restock " + (selected?.make ?? "") + " " + (selected?.model ?? "")} onClose={close}><div className="space-y-5"><p className="text-sm text-slate-500">Add units to the existing stock level.</p><input autoFocus type="number" min="1" value={restockAmount} onChange={(e) => setRestockAmount(Number(e.target.value))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/15" /><button disabled={submitting || restockAmount < 1} onClick={restock} className="w-full rounded-xl bg-brand py-3 font-bold text-stone-950 disabled:opacity-60">Confirm restock</button></div></Modal>
    <Modal open={modal === "delete"} title="Remove vehicle?" onClose={close}><p className="text-sm text-slate-700">This will permanently remove <strong>{selected?.make} {selected?.model}</strong> from the inventory.</p><div className="mt-6 flex justify-end gap-3"><button onClick={close} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700">Cancel</button><button disabled={submitting} onClick={remove} className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">Delete vehicle</button></div></Modal>
  </main></div>;
};

export default Admin;
