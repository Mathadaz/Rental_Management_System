import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api";
import { useAuth } from "../context/AuthContext";
import { getMe } from "../api";
import toast from "react-hot-toast";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await login(form);
      localStorage.setItem("token", data.access_token);
      const me = await getMe();
      setUser(me.data);
      toast.success(`Welcome back, ${me.data.full_name.split(" ")[0]}!`);
      navigate("/");
    } catch {
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#f7f5f0" }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12" style={{ background: "#1a3c2e" }}>
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#c9a84c" }}>
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="text-white font-display text-xl font-semibold">RentFlow</span>
          </div>
          <h1 className="font-display text-5xl font-bold text-white leading-tight mb-6">
            Manage your<br />properties<br />with clarity.
          </h1>
          <p className="text-green-200 text-lg leading-relaxed max-w-sm">
            Track tenants, leases, payments and maintenance — all in one place.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[["Properties", "Track all your units"], ["Payments", "Never miss rent"], ["Maintenance", "Resolve fast"], ["Dashboard", "Real-time stats"]].map(([t, d]) => (
            <div key={t} className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.07)" }}>
              <div className="text-white font-semibold text-sm mb-1">{t}</div>
              <div className="text-green-300 text-xs">{d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <h2 className="font-display text-3xl font-bold mb-2" style={{ color: "#1a3c2e" }}>Sign in</h2>
            <p className="text-sm" style={{ color: "#6b7280" }}>Welcome back to your dashboard</p>
          </div>

          <form onSubmit={handle} className="space-y-5">
            <div>
              <label>Email address</label>
              <input type="email" placeholder="you@example.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button className="btn-primary w-full mt-2" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: "#6b7280" }}>
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold" style={{ color: "#1a3c2e" }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
