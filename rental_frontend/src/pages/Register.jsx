import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register, login } from "../api";
import { useAuth } from "../context/AuthContext";
import { getMe } from "../api";
import toast from "react-hot-toast";

export default function Register() {
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      const { data } = await login({ email: form.email, password: form.password });
      localStorage.setItem("token", data.access_token);
      const me = await getMe();
      setUser(me.data);
      toast.success("Account created successfully!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: "#f7f5f0" }}>
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#1a3c2e" }}>
            <span className="text-white font-bold text-lg">R</span>
          </div>
          <span className="font-display text-xl font-semibold" style={{ color: "#1a3c2e" }}>RentFlow</span>
        </div>

        <h2 className="font-display text-3xl font-bold mb-2" style={{ color: "#1a3c2e" }}>Create account</h2>
        <p className="text-sm mb-8" style={{ color: "#6b7280" }}>Start managing your properties today</p>

        <form onSubmit={handle} className="space-y-5">
          <div>
            <label>Full name</label>
            <input placeholder="John Smith" value={form.full_name}
              onChange={e => setForm({ ...form, full_name: e.target.value })} required />
          </div>
          <div>
            <label>Email address</label>
            <input type="email" placeholder="you@example.com" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label>Password</label>
            <input type="password" placeholder="Min 8 characters" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button className="btn-primary w-full" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: "#6b7280" }}>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold" style={{ color: "#1a3c2e" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
