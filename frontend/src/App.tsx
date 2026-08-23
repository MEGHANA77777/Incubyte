import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import "./App.css";

import AdminRoute from "./components/auth/AdminRoute";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import { ToastProvider } from "./context/ToastContext";

import DashboardLayout from "./layouts/DashboardLayout";
import PublicLayout from "./layouts/PublicLayout";

import Admin from "./pages/Admin";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VehicleDetail from "./pages/VehicleDetail";
import Vehicles from "./pages/Vehicles";

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* =====================================================
              PUBLIC ROUTES
              ===================================================== */}

          <Route element={<PublicLayout />}>
            <Route
              path="/vehicles"
              element={<Vehicles />}
            />

            <Route
              path="/vehicles/:id"
              element={<VehicleDetail />}
            />
          </Route>

          {/* =====================================================
              AUTHENTICATION ROUTES
              ===================================================== */}

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          {/* =====================================================
              PROTECTED ROUTES
              ===================================================== */}

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>

              {/* Dashboard */}
              <Route
                path="/dashboard"
                element={<Dashboard />}
              />

              {/* =================================================
                  ADMIN-ONLY ROUTES
                  ================================================= */}

              <Route element={<AdminRoute />}>
                <Route
                  path="/admin"
                  element={<Admin />}
                />
              </Route>

            </Route>
          </Route>

          {/* =====================================================
              DEFAULT ROUTE
              ===================================================== */}

          <Route
            path="/"
            element={
              <Navigate
                to="/vehicles"
                replace
              />
            }
          />

          {/* =====================================================
              UNKNOWN ROUTES
              ===================================================== */}

          <Route
            path="*"
            element={
              <Navigate
                to="/vehicles"
                replace
              />
            }
          />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;