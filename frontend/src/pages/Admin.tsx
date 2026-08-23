import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Modal } from "../components/common/Modal";
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

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-5 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-xs font-bold tracking-wider text-brand">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand"></span>
            </span>
            ADMIN CONSOLE
          </div>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900">Inventory Management</h1>
          <p className="mt-3 text-lg text-slate-600">Create, update, and manage your vehicle collection in real-time with full control over stock and pricing.</p>
        </div>
        <button onClick={() => open("create")} className="group relative flex items-center gap-2 overflow-hidden rounded-2xl bg-brand px-6 py-4 font-bold text-white transition-all hover:bg-brand-dark hover:shadow-lg hover:shadow-brand/20">
          <span className="text-lg">+</span>
          Add New Vehicle
        </button>
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between border-b border-slate-200 pb-5">
          <h2 className="text-xl font-bold text-slate-900">Current Collection <span className="ml-2 text-sm font-normal text-slate-500">({vehicles.length} vehicles)</span></h2>
        </div>

        {loading ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => <div key={i} className="h-80 animate-pulse rounded-2xl bg-white border border-slate-200 shadow-sm" />)}
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle) => (
              <VehicleCard 
                key={vehicle.id} 
                vehicle={vehicle} 
                isAdmin 
                busy={submitting && selected?.id === vehicle.id} 
                onPurchase={purchase} 
                onEdit={(item) => open("edit", item)} 
                onRestock={(item) => open("restock", item)} 
                onDelete={(item) => open("delete", item)} 
              />
            ))}
          </div>
        )}
      </div>

      <Modal open={modal === "create" || modal === "edit"} title={modal === "edit" ? "Edit vehicle" : "Add vehicle"} onClose={close}>
        <VehicleForm vehicle={modal === "edit" ? selected : undefined} submitting={submitting} onSubmit={save} />
      </Modal>

      <Modal open={modal === "restock"} title={"Restock " + (selected?.make ?? "") + " " + (selected?.model ?? "")} onClose={close}>
        <div className="space-y-5">
          <p className="text-sm text-slate-500">Enter the number of units you want to add to the current inventory.</p>
          <div className="relative">
            <input autoFocus type="number" min="1" value={restockAmount} onChange={(e) => setRestockAmount(Number(e.target.value))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-lg font-semibold text-slate-900 outline-none transition-all focus:border-brand focus:ring-4 focus:ring-brand/10" />
            <div className="absolute inset-y-0 right-4 flex items-center text-sm font-medium text-slate-400">UNITS</div>
          </div>
          <button disabled={submitting || restockAmount < 1} onClick={restock} className="w-full rounded-xl bg-brand py-4 text-sm font-bold text-white transition-all hover:bg-brand-dark disabled:opacity-60">
            {submitting ? "Updating stock..." : "Confirm Restock"}
          </button>
        </div>
      </Modal>

      <Modal open={modal === "delete"} title="Delete Vehicle?" onClose={close}>
        <div className="space-y-4">
          <div className="rounded-xl bg-red-50 p-4 text-red-800">
            <p className="text-sm font-medium">Warning: This action cannot be undone.</p>
          </div>
          <p className="text-slate-600">Are you sure you want to permanently remove <strong>{selected?.make} {selected?.model}</strong> from the inventory?</p>
          <div className="mt-8 flex gap-3">
            <button onClick={close} className="flex-1 rounded-xl border border-slate-300 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">Cancel</button>
            <button disabled={submitting} onClick={remove} className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-60">
              {submitting ? "Deleting..." : "Delete Vehicle"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};


export default Admin;
