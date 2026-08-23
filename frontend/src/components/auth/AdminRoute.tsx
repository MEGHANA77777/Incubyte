import { Navigate, Outlet } from "react-router-dom";

import { useAuthStore } from "../../store/authStore";
import Loading from "../common/Loading";

const AdminRoute = () => {
  const user = useAuthStore((state) => state.user);

  const isLoading = useAuthStore(
    (state) => state.isLoading
  );

  if (isLoading) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "ADMIN") {
    return <Navigate to="/vehicles" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
