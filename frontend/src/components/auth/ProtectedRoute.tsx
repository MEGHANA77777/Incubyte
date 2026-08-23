import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuthStore } from "../../store/authStore";
import Loading from "../common/Loading";

const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );

  const isLoading = useAuthStore(
    (state) => state.isLoading
  );

  const location = useLocation();

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
