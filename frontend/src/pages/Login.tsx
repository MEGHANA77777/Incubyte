import { FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Car, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";
import { login as loginApi } from "../services/auth";
import { useAuthStore } from "../store/authStore";
import { useToast } from "../context/ToastContext";

const Login = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await loginApi({
        email,
        password,
      });

      login(response.access_token);
      showToast("Welcome back! You are now signed in.", "success");
      navigate("/vehicles", { replace: true });
    } catch (error: any) {
      const message = error.response?.data?.detail || "Login failed. Please check your credentials.";
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <Link to="/" className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brand text-white shadow-xl shadow-brand/20 transition-transform hover:scale-105">
            <Car size={32} />
          </Link>
          <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-900">Sign in to AutoFlex</h1>
          <p className="mt-2 text-slate-500 font-medium">Manage your inventory and orders in one place.</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-xl shadow-slate-200/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 pointer-events-none">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3.5 text-slate-900 outline-none transition-all focus:border-brand focus:ring-4 focus:ring-brand/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-slate-500">Password</label>
                <button type="button" className="text-[10px] font-bold uppercase tracking-widest text-brand hover:underline">Forgot password?</button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 pointer-events-none">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3.5 text-slate-900 outline-none transition-all focus:border-brand focus:ring-4 focus:ring-brand/10"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-100 animate-shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-brand py-4 font-bold text-white shadow-lg shadow-brand/20 transition-all hover:bg-brand-dark hover:shadow-xl active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-slate-100 pt-8">
            <p className="text-sm font-medium text-slate-500">
              New to AutoFlex?{" "}
              <Link to="/register" className="font-bold text-brand hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
        
        <p className="mt-8 text-center text-xs font-medium text-slate-400 uppercase tracking-widest">
          &copy; 2026 AutoFlex Inventory System
        </p>
      </div>
    </div>
  );
};

export default Login;
