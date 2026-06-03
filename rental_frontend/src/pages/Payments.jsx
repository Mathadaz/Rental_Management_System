import { useEffect, useState } from "react";
import { getLeases, getPayments, createPayment } from "../api";
import { Plus, CreditCard, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
      <div className="card w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-xl font-bold" style={{ color: "#1a3c2e" }}>{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function PaymentForm({ leaseId, onSave, onClose }) {
  const now = new Date();
  const [form, setForm] = useState({
    amount: "", payment_date: now.toISOString().split("T")[0],
    period_month: now.getMonth() + 1, period_year: now.getFullYear(),
    method: "bank_transfer", reference: "", notes: ""
  });
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await createPayment(leaseId, { ...form, amount: +form.amount, period_month: +form.period_month, period_year: +form.period_year });
      toast.success("Payment recorded!");
      onSave(data);
    } catch { toast.error("Failed to record payment"); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handle} className="space-y-4">
      <div><label>Amount (R)</label><input type="number" placeholder="8000" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label>Period Month</label>
          <select value={form.period_month} onChange={e => setForm({ ...form, period_month: e.target.value })}>
            {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m,i) => <option key={i} value={i+1}>{m}</option>)}
          </select>
        </div>
        <div><label>Period Year</label><input type="number" value={form.period_year} onChange={e => setForm({ ...form, period_year: e.target.value })} /></div>
      </div>
      <div><label>Payment Date</label><input type="date" value={form.payment_date} onChange={e => setForm({ ...form, payment_date: e.target.value })} /></div>
      <div><label>Method</label>
        <select value={form.method} onChange={e => setForm({ ...form, method: e.target.value })}>
          {["bank_transfer","eft","cash","card"].map(m => <option key={m} value={m}>{m.replace("_"," ").toUpperCase()}</option>)}
        </select>
      </div>
      <div><label>Reference</label><input placeholder="POP-2026-001" value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} /></div>
      <div className="flex gap-3 pt-2">
        <button className="btn-primary flex-1" type="submit" disabled={loading}>{loading ? "Saving..." : "Record Payment"}</button>
        <button className="btn-ghost" type="button" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
}

export default function Payments() {
  const [leases, setLeases] = useState([]);
  const [selectedLease, setSelectedLease] = useState(null);
  const [payments, setPayments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeases().then(r => {
      const active = r.data.filter(l => l.status === "active");
      setLeases(active);
      if (active.length > 0) {
        setSelectedLease(active[0]);
        getPayments(active[0].id).then(p => setPayments(p.data));
      }
    }).finally(() => setLoading(false));
  }, []);

  const selectLease = async (lease) => {
    setSelectedLease(lease);
    const { data } = await getPayments(lease.id);
    setPayments(data);
  };

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const fmt = (d) => new Date(d).toLocaleDateString("en-ZA");

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1" style={{ color: "#1a3c2e" }}>Payments</h1>
          <p className="text-sm" style={{ color: "#6b7280" }}>Track rent payments by lease</p>
        </div>
        {selectedLease && (
          <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Record Payment
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "#1a3c2e", borderTopColor: "transparent" }} /></div>
      ) : leases.length === 0 ? (
        <div className="card p-16 text-center">
          <CreditCard size={40} className="mx-auto mb-4" style={{ color: "#d1d5db" }} />
          <p className="font-semibold" style={{ color: "#6b7280" }}>No active leases found</p>
          <p className="text-sm mt-1" style={{ color: "#9ca3af" }}>Create a lease first to record payments</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-6">
          {/* Lease selector */}
          <div className="col-span-1 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#9ca3af" }}>Active Leases</p>
            {leases.map(l => (
              <button key={l.id} onClick={() => selectLease(l)}
                className={`w-full text-left p-3 rounded-xl border transition-all text-sm ${selectedLease?.id === l.id ? "border-green-700 bg-white" : "border-transparent bg-white/60 hover:bg-white"}`}
                style={{ borderColor: selectedLease?.id === l.id ? "#1a3c2e" : "transparent" }}>
                <div className="font-semibold text-xs" style={{ color: "#1a3c2e" }}>Lease #{l.id}</div>
                <div className="text-xs" style={{ color: "#6b7280" }}>Unit {l.unit_id}</div>
                <div className="text-xs font-mono mt-1" style={{ color: "#2d6a4f" }}>R {l.monthly_rent.toLocaleString()}/mo</div>
              </button>
            ))}
          </div>

          {/* Payments list */}
          <div className="col-span-3">
            {payments.length === 0 ? (
              <div className="card p-12 text-center">
                <CheckCircle size={32} className="mx-auto mb-3" style={{ color: "#d1d5db" }} />
                <p className="text-sm" style={{ color: "#6b7280" }}>No payments recorded for this lease yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map(p => (
                  <div key={p.id} className="card p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#e8f5ef" }}>
                        <CheckCircle size={16} style={{ color: "#2d6a4f" }} />
                      </div>
                      <div>
                        <div className="font-semibold text-sm" style={{ color: "#1a3c2e" }}>
                          {months[p.period_month - 1]} {p.period_year}
                        </div>
                        <div className="text-xs" style={{ color: "#6b7280" }}>{fmt(p.payment_date)} · {p.method.replace("_"," ").toUpperCase()}</div>
                        {p.reference && <div className="text-xs font-mono" style={{ color: "#9ca3af" }}>Ref: {p.reference}</div>}
                      </div>
                    </div>
                    <div className="font-display font-bold text-lg" style={{ color: "#2d6a4f" }}>
                      R {p.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showForm && selectedLease && (
        <Modal title="Record Payment" onClose={() => setShowForm(false)}>
          <PaymentForm leaseId={selectedLease.id} onSave={(p) => { setPayments([...payments, p]); setShowForm(false); }} onClose={() => setShowForm(false)} />
        </Modal>
      )}
    </div>
  );
}
