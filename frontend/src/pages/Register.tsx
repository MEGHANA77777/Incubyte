import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register as registerUser } from "../services/auth";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setLoading(true); setError(undefined);
      await registerUser(form);
      navigate("/login", { state: { message: "Account created. Please sign in." } });
    } catch (err: unknown) {
      setError((err as { response?: { data?: { detail?: string } } }).response?.data?.detail ?? "We couldn't create your account.");
    } finally { setLoading(false); }
  };
  return <main className="grid min-h-screen place-items-center bg-stone-950 p-5"><form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-white/10 bg-stone-900 p-8 shadow-2xl"><Link to="/vehicles" className="text-sm font-bold text-amber-300">← Back to inventory</Link><h1 className="mt-6 text-3xl font-black text-white">Start your journey.</h1><p className="mt-2 text-sm text-stone-400">Create an account to reserve your next vehicle.</p>{(["username", "email", "password"] as const).map((field) => <label key={field} className="mt-5 block text-sm font-medium capitalize text-stone-300">{field}<input required type={field === "password" ? "password" : field === "email" ? "email" : "text"} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-stone-950 px-3 py-3 text-white outline-none focus:border-amber-400" /></label>)}{error && <p className="mt-4 text-sm text-red-300">{error}</p>}<button disabled={loading} className="mt-6 w-full rounded-xl bg-amber-400 py-3 font-bold text-stone-950 disabled:opacity-60">{loading ? "Creating account…" : "Create account"}</button><p className="mt-5 text-center text-sm text-stone-400">Already a member? <Link to="/login" className="font-semibold text-amber-300">Sign in</Link></p></form></main>;
};

export default Register;
