import { useEffect, useState } from "react";
import { getDashboard } from "../api";
import { Building2, Users, CreditCard, Wrench, TrendingUp, AlertCircle } from "lucide-react";

function StatCard({ icon: Icon, label, value, sub, color = "#1a3c2e" }) {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#e8f5ef" }}>
          <Icon size={20} style={{ color }} />
        </div>
      </div>
      <div className="font-display text-3xl font-bold mb-1" style={{ color }}>{value}</div>
      <div className="text-sm font-medium" style={{ color: "#6b7280" }}>{label}</div>
      {sub && <div className="text-xs mt-1" style={{ color: "#9ca3af" }}>{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard().then(r => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#1a3c2e", borderTopColor: "transparent" }} />
    </div>
  );

  const fmt = (n) => `R ${(n || 0).toLocaleString("en-ZA", { minimumFractionDigits: 0 })}`;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-1" style={{ color: "#1a3c2e" }}>Dashboard</h1>
        <p className="text-sm" style={{ color: "#6b7280" }}>Your portfolio at a glance</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatCard icon={Building2} label="Total Properties" value={stats?.total_properties ?? 0} />
        <StatCard icon={Building2} label="Occupied Units"
          value={`${stats?.occupied_units ?? 0}/${stats?.total_units ?? 0}`}
          sub={`${stats?.occupancy_rate ?? 0}% occupancy`} />
        <StatCard icon={TrendingUp} label="Monthly Income" value={fmt(stats?.total_monthly_income)} color="#2d6a4f" />
        <StatCard icon={CreditCard} label="Expenses This Month" value={fmt(stats?.total_expenses_this_month)} color="#b7791f" />
      </div>

      {/* Alert cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Overdue payments */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#fef2f2" }}>
              <AlertCircle size={18} style={{ color: "#c53030" }} />
            </div>
            <h3 className="font-semibold" style={{ color: "#1a3c2e" }}>Overdue Payments</h3>
          </div>
          <div className="font-display text-4xl font-bold mb-1" style={{ color: stats?.overdue_payments_count > 0 ? "#c53030" : "#1a3c2e" }}>
            {stats?.overdue_payments_count ?? 0}
          </div>
          <p className="text-sm" style={{ color: "#6b7280" }}>
            {stats?.overdue_payments_count === 0 ? "All tenants are up to date" : "Leases missing payment this month"}
          </p>
        </div>

        {/* Open maintenance */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#fef9e7" }}>
              <Wrench size={18} style={{ color: "#b7791f" }} />
            </div>
            <h3 className="font-semibold" style={{ color: "#1a3c2e" }}>Open Maintenance</h3>
          </div>
          <div className="font-display text-4xl font-bold mb-1" style={{ color: stats?.open_maintenance_requests > 0 ? "#b7791f" : "#1a3c2e" }}>
            {stats?.open_maintenance_requests ?? 0}
          </div>
          <p className="text-sm" style={{ color: "#6b7280" }}>
            {stats?.open_maintenance_requests === 0 ? "No open requests" : "Requests awaiting resolution"}
          </p>
        </div>

        {/* Vacant units */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#e8f5ef" }}>
              <Building2 size={18} style={{ color: "#1a3c2e" }} />
            </div>
            <h3 className="font-semibold" style={{ color: "#1a3c2e" }}>Vacant Units</h3>
          </div>
          <div className="font-display text-4xl font-bold mb-1" style={{ color: "#1a3c2e" }}>
            {stats?.vacant_units ?? 0}
          </div>
          <p className="text-sm" style={{ color: "#6b7280" }}>Units available for new tenants</p>
        </div>

        {/* Net income */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#e8f5ef" }}>
              <TrendingUp size={18} style={{ color: "#2d6a4f" }} />
            </div>
            <h3 className="font-semibold" style={{ color: "#1a3c2e" }}>Net This Month</h3>
          </div>
          <div className="font-display text-4xl font-bold mb-1" style={{ color: "#2d6a4f" }}>
            {fmt((stats?.total_monthly_income ?? 0) - (stats?.total_expenses_this_month ?? 0))}
          </div>
          <p className="text-sm" style={{ color: "#6b7280" }}>Income minus expenses</p>
        </div>
      </div>
    </div>
  );
}
