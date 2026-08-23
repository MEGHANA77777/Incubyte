import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Car, LayoutDashboard, LogOut, User, Menu, X, Shield } from "lucide-react";
import { useState } from "react";
import { cn } from "../../utils/cn";

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    { name: "Inventory", path: "/vehicles", icon: Car },
    ...(isAuthenticated ? [{ name: "Dashboard", path: "/dashboard", icon: LayoutDashboard }] : []),
    ...(user?.role === "ADMIN" ? [{ name: "Admin", path: "/admin", icon: Shield }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/vehicles" className="flex items-center gap-2 transition-opacity hover:opacity-90">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white">
            <Car size={20} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-lg font-black tracking-tight text-slate-900">AUTOFLEX</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Inventory</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                location.pathname === link.path
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <link.icon size={16} />
              {link.name}
            </Link>
          ))}
          
          <div className="mx-2 h-6 w-[1px] bg-slate-200" />

          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                  <User size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-900">
                    {user?.username || "Account"}
                  </span>
                  <span className="text-[10px] font-medium uppercase text-slate-500">
                    {user?.role}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              Sign in
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="rounded-md p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="border-t border-slate-100 bg-white p-4 md:hidden">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                  location.pathname === link.path
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-600"
                )}
              >
                <link.icon size={18} />
                {link.name}
              </Link>
            ))}
            <div className="my-2 border-t border-slate-100" />
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2">
                  <User size={18} className="text-slate-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900">
                      {user?.username || "Account"}
                    </span>
                    <span className="text-xs text-slate-500">{user?.role}</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-red-600"
                >
                  <LogOut size={18} />
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center rounded-md bg-brand py-3 text-sm font-semibold text-white"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

