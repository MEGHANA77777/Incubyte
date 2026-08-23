import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Car, Shield, Activity, TrendingUp, Package, Users, Settings, ArrowRight, ChevronRight } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { getVehicles } from "../services/vehicles";
import { checkHealth } from "../services/api";
import { cn } from "../utils/cn";

const Dashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ total: 0, lowStock: 0, outOfStock: 0 });
  const [health, setHealth] = useState<string>("checking");

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const { items } = await getVehicles(1, 100);
        setStats({
          total: items.length,
          lowStock: items.filter(v => v.quantity > 0 && v.quantity <= 5).length,
          outOfStock: items.filter(v => v.quantity === 0).length
        });
        
        const healthStatus = await checkHealth();
        setHealth(healthStatus.status);
      } catch (error) {
        setHealth("error");
      }
    };
    loadDashboardData();
  }, []);

  const isAdmin = user?.role === "ADMIN";

  const cards = [
    {
      title: "Inventory",
      description: "Browse the full collection of vehicles.",
      icon: Car,
      link: "/vehicles",
      color: "bg-blue-500",
    },
    ...(isAdmin ? [
      {
        title: "Management",
        description: "Add, edit, and restock vehicles.",
        icon: Shield,
        link: "/admin",
        color: "bg-purple-500",
      },
      {
        title: "Analytics",
        description: "View sales performance and stock trends.",
        icon: TrendingUp,
        link: "/dashboard", // Placeholder
        color: "bg-emerald-500",
      }
    ] : []),
  ];

  return (
    <div className="space-y-10">
      {/* Welcome Section */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">
              Welcome back, <span className="text-brand">{user?.username || "Friend"}</span>
            </h1>
            <p className="mt-2 text-lg text-slate-600">
              Here's what's happening with the inventory today.
            </p>
          </div>
          <div className={cn(
            "flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest shadow-sm ring-1 ring-inset",
            health === "ok" ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20" : "bg-red-50 text-red-700 ring-red-600/20"
          )}>
            <Activity size={14} className={cn(health === "ok" && "animate-pulse")} />
            System Status: {health === "ok" ? "Healthy" : health === "checking" ? "Checking..." : "Offline"}
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Vehicles", value: stats.total, icon: Package, color: "text-blue-600" },
          { label: "Active Users", value: "1.2k", icon: Users, color: "text-purple-600" },
          { label: "Low Stock Alert", value: stats.lowStock, icon: Activity, color: "text-amber-600" },
          { label: "Out of Stock", value: stats.outOfStock, icon: Shield, color: "text-red-600" },
        ].map((stat, i) => (
          <div key={i} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className={cn("rounded-2xl bg-slate-50 p-3", stat.color)}>
                <stat.icon size={24} />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live</span>
            </div>
            <div className="mt-6">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <p className="mt-1 text-3xl font-black text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="mb-6 text-xl font-bold text-slate-900">Quick Actions</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, i) => (
            <Link 
              key={i} 
              to={card.link}
              className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50"
            >
              <div className={cn("mb-6 inline-flex rounded-2xl p-4 text-white shadow-lg shadow-current/20", card.color)}>
                <card.icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">{card.title}</h3>
              <p className="mt-2 text-slate-600">{card.description}</p>
              <div className="mt-6 flex items-center gap-2 text-sm font-bold text-brand group-hover:gap-3 transition-all">
                Get Started <ArrowRight size={16} />
              </div>
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-slate-50 transition-transform group-hover:scale-150" />
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Activity Placeholder */}
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Recent Inventory Activity</h2>
          <button className="text-sm font-bold text-brand hover:underline">View all activity</button>
        </div>
        <div className="space-y-6">
          {[
            { action: "Purchase", item: "Tesla Model 3", time: "2 minutes ago", user: "John Doe" },
            { action: "Restock", item: "BMW X5", time: "1 hour ago", user: "Admin" },
            { action: "Update", item: "Audi A4", time: "3 hours ago", user: "Admin" },
          ].map((act, i) => (
            <div key={i} className="flex items-center justify-between border-b border-slate-50 pb-6 last:border-0 last:pb-0">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full text-white",
                  act.action === "Purchase" ? "bg-emerald-500" : act.action === "Restock" ? "bg-blue-500" : "bg-amber-500"
                )}>
                  {act.action === "Purchase" ? <Package size={18} /> : act.action === "Restock" ? <RefreshCw size={18} /> : <Settings size={18} />}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{act.action}: <span className="text-slate-600 font-medium">{act.item}</span></p>
                  <p className="text-xs text-slate-400">By {act.user} • {act.time}</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

// Internal icon for the list since RefreshCw wasn't in imports
const RefreshCw = (props: any) => <Activity {...props} />;

export default Dashboard;
