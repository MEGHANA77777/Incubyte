import { Outlet } from "react-router-dom";
import { Navbar } from "../components/common/Navbar";

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <Outlet />
    </div>
  );
};

export default PublicLayout;
