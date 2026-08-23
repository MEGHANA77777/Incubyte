import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import Vehicles from "./Vehicles";

const Admin = () => {
  const user = useAuthStore((state) => state.user);
  if (user?.role !== "ADMIN") return <Navigate to="/vehicles" replace />;
  return <Vehicles />;
};

export default Admin;
