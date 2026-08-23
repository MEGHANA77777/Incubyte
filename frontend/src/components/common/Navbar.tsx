import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link to="/vehicles" className="text-sm font-bold tracking-[0.12em] text-slate-950">AUTOFLEX <span className="font-medium text-slate-500">INVENTORY</span></Link>
        <div className="flex items-center gap-2 text-sm">
          <Link to="/vehicles" className="hidden rounded-md px-3 py-2 font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950 sm:block">Inventory</Link>
          {user?.role === "ADMIN" && <Link to="/admin" className="rounded-md px-3 py-2 font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950">Admin</Link>}
          {isAuthenticated ? <><span className="hidden border-l border-slate-200 pl-3 text-xs font-medium text-slate-500 md:block">{user?.username ?? "Meghana"} <span className="text-slate-900">({user?.role})</span></span><button onClick={handleLogout} className="rounded-md border border-slate-300 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">Sign out</button></> : <Link to="/login" className="rounded-md bg-brand px-3 py-2 font-semibold text-white hover:bg-brand-dark">Sign in</Link>}
        </div>
      </nav>
    </header>
  );
};
