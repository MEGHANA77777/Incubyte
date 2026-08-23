import { FormEvent, useEffect, useState } from "react";
import type { Vehicle, VehiclePayload } from "../../types/vehicle";

interface Props { vehicle?: Vehicle; submitting: boolean; onSubmit: (value: VehiclePayload) => Promise<void>; }

const blank: VehiclePayload = { make: "", model: "", category: "", price: 0, quantity: 0 };

export const VehicleForm = ({ vehicle, submitting, onSubmit }: Props) => {
  const [value, setValue] = useState<VehiclePayload>(blank);
  useEffect(() => setValue(vehicle ? { make: vehicle.make, model: vehicle.model, category: vehicle.category, price: vehicle.price, quantity: vehicle.quantity } : blank), [vehicle]);
  const submit = async (event: FormEvent) => { event.preventDefault(); await onSubmit(value); };
  const update = (key: keyof VehiclePayload, raw: string) => setValue((current) => ({ ...current, [key]: key === "price" || key === "quantity" ? Number(raw) : raw }));
  return <form onSubmit={submit} className="space-y-4">
    <div className="grid gap-4 sm:grid-cols-2">{(["make", "model", "category"] as const).map((field) => <label key={field} className={field === "category" ? "sm:col-span-2" : ""}><span className="text-sm font-medium capitalize text-slate-700">{field}</span><input required minLength={1} value={value[field]} onChange={(e) => update(field, e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/15" /></label>)}</div>
    <div className="grid gap-4 sm:grid-cols-2"><label><span className="text-sm font-medium text-slate-700">Price</span><input required type="number" min="1" step="0.01" value={value.price || ""} onChange={(e) => update("price", e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/15" /></label><label><span className="text-sm font-medium text-slate-700">Quantity</span><input required type="number" min="0" value={value.quantity} onChange={(e) => update("quantity", e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/15" /></label></div>
    <button disabled={submitting} className="w-full rounded-xl bg-brand py-3 font-bold text-white hover:bg-brand-dark disabled:opacity-60">{submitting ? "Saving…" : vehicle ? "Save changes" : "Add vehicle"}</button>
  </form>;
};
