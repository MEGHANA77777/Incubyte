import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-stone-950/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link to="/vehicles" className="text-lg font-black tracking-tight text-white">APEX<span className="text-amber-400">MOTORS</span></Link>
        <div className="flex items-center gap-3 text-sm">
          <Link to="/vehicles" className="hidden text-stone-300 hover:text-white sm:block">Inventory</Link>
          {user?.role === "ADMIN" && <Link to="/admin" className="text-stone-300 hover:text-white">Admin</Link>}
          {isAuthenticated ? <button onClick={handleLogout} className="rounded-full border border-white/15 px-4 py-2 text-stone-200 hover:border-amber-400 hover:text-amber-300">Sign out</button> : <Link to="/login" className="rounded-full bg-amber-400 px-4 py-2 font-semibold text-stone-950 hover:bg-amber-300">Sign in</Link>}
        </div>
      </nav>
    </header>
  );
};
