import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard, Building2, Users, FileText,
  CreditCard, Wrench, TrendingDown, LogOut
} from "lucide-react";

const nav = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/properties", icon: Building2, label: "Properties" },
  { to: "/tenants", icon: Users, label: "Tenants" },
  { to: "/leases", icon: FileText, label: "Leases" },
  { to: "/payments", icon: CreditCard, label: "Payments" },
  { to: "/maintenance", icon: Wrench, label: "Maintenance" },
  { to: "/expenses", icon: TrendingDown, label: "Expenses" },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-60 flex flex-col fixed inset-y-0 left-0 z-10" style={{ background: "#1a3c2e" }}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#c9a84c" }}>
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <span className="font-display text-white font-semibold text-lg">RentFlow</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "text-white"
                    : "text-green-300 hover:text-white hover:bg-white/10"
                }`
              }
              style={({ isActive }) => isActive ? { background: "rgba(255,255,255,0.15)" } : {}}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: "#c9a84c" }}>
              {user?.full_name?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-semibold truncate">{user?.full_name}</div>
              <div className="text-green-300 text-xs truncate">{user?.email}</div>
            </div>
          </div>
          <button onClick={logout}
            className="flex items-center gap-2 w-full px-4 py-2 rounded-xl text-sm text-green-300 hover:text-white hover:bg-white/10 transition-all">
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-60 min-h-screen p-8" style={{ background: "#f7f5f0" }}>
        {children}
      </main>
    </div>
  );
}
