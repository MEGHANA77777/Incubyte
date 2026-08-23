import { Link, Outlet } from "react-router-dom";

import { useAuthStore } from "../store/authStore";

const DashboardLayout = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            to="/dashboard"
            className="text-xl font-semibold text-gray-900"
          >
            Car Dealership
          </Link>

          <div className="flex items-center gap-4">
            {user && (
              <span className="text-sm text-gray-600">
                {user.username ?? user.role}
              </span>
            )}

            <button
              type="button"
              onClick={logout}
              className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
