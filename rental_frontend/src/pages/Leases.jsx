import { useEffect, useState } from "react";
import { getLeases, createLease, getProperties, getUnits, getTenants, updateLease } from "../api";
import { Plus, FileText, Calendar } from "lucide-react";
import toast from "react-hot-toast";

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
      <div className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-xl font-bold" style={{ color: "#1a3c2e" }}>{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function LeaseForm({ onSave, onClose }) {
  const [properties, setProperties] = useState([]);
  const [units, setUnits] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [form, setForm] = useState({ unit_id: "", tenant_id: "", start_date: "", end_date: "", monthly_rent: "", deposit_paid: "", notes: "" });
  const [selectedProp, setSelectedProp] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([getProperties(), getTenants()]).then(([p, t]) => {
      setProperties(p.data);
      setTenants(t.data);
    });
  }, []);

  useEffect(() => {
    if (selectedProp) getUnits(selectedProp).then(r => setUnits(r.data));
  }, [selectedProp]);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await createLease({ ...form, unit_id: +form.unit_id, tenant_id: +form.tenant_id, monthly_rent: +form.monthly_rent, deposit_paid: +form.deposit_paid || 0 });
      toast.success("Lease created!");
      onSave(data);
    } catch (err) { toast.error(err.response?.data?.detail || "Failed to create lease"); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handle} className="space-y-4">
      <div>
        <label>Property</label>
        <select value={selectedProp} onChange={e => { setSelectedProp(e.target.value); setForm({ ...form, unit_id: "" }); }}>
          <option value="">Select property...</option>
          {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div>
        <label>Unit</label>
        <select value={form.unit_id} onChange={e => setForm({ ...form, unit_id: e.target.value })} required>
          <option value="">Select unit...</option>
          {units.map(u => <option key={u.id} value={u.id}>Unit {u.unit_number} — R{u.monthly_rent}/mo</option>)}
        </select>
      </div>
      <div>
        <label>Tenant</label>
        <select value={form.tenant_id} onChange={e => setForm({ ...form, tenant_id: e.target.value })} required>
          <option value="">Select tenant...</option>
          {tenants.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label>Start Date</label><input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} required /></div>
        <div><label>End Date</label><input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} required /></div>
        <div><label>Monthly Rent (R)</label><input type="number" value={form.monthly_rent} onChange={e => setForm({ ...form, monthly_rent: e.target.value })} required /></div>
        <div><label>Deposit Paid (R)</label><input type="number" value={form.deposit_paid} onChange={e => setForm({ ...form, deposit_paid: e.target.value })} /></div>
      </div>
      <div><label>Notes</label><textarea rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
      <div className="flex gap-3 pt-2">
        <button className="btn-primary flex-1" type="submit" disabled={loading}>{loading ? "Saving..." : "Create Lease"}</button>
        <button className="btn-ghost" type="button" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
}

const statusBadge = (s) => {
  if (s === "active") return <span className="badge-green">Active</span>;
  if (s === "expired") return <span className="badge-gray">Expired</span>;
  return <span className="badge-red">Terminated</span>;
};

export default function Leases() {
  const [leases, setLeases] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeases().then(r => setLeases(r.data)).finally(() => setLoading(false));
  }, []);

  const fmt = (d) => new Date(d).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });

  const terminate = async (lease) => {
    if (!confirm("Terminate this lease?")) return;
    try {
      const { data } = await updateLease(lease.id, { status: "terminated" });
      setLeases(leases.map(l => l.id === data.id ? data : l));
      toast.success("Lease terminated");
    } catch { toast.error("Failed"); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1" style={{ color: "#1a3c2e" }}>Leases</h1>
          <p className="text-sm" style={{ color: "#6b7280" }}>{leases.length} lease{leases.length !== 1 ? "s" : ""} total</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(true)}>
          <Plus size={16} /> New Lease
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "#1a3c2e", borderTopColor: "transparent" }} /></div>
      ) : leases.length === 0 ? (
        <div className="card p-16 text-center">
          <FileText size={40} className="mx-auto mb-4" style={{ color: "#d1d5db" }} />
          <p className="font-semibold mb-1" style={{ color: "#6b7280" }}>No leases yet</p>
          <button className="btn-primary mt-3" onClick={() => setShowForm(true)}>Create Lease</button>
        </div>
      ) : (
        <div className="space-y-3">
          {leases.map(l => (
            <div key={l.id} className="card p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#e8f5ef" }}>
                  <FileText size={18} style={{ color: "#1a3c2e" }} />
                </div>
                <div>
                  <div className="font-semibold text-sm mb-1" style={{ color: "#1a3c2e" }}>Lease #{l.id} — Unit {l.unit_id}</div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: "#6b7280" }}>
                    <Calendar size={11} />
                    {fmt(l.start_date)} → {fmt(l.end_date)}
                  </div>
                  <div className="text-xs mt-1 font-mono" style={{ color: "#2d6a4f" }}>R {l.monthly_rent.toLocaleString()}/mo</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {statusBadge(l.status)}
                {l.status === "active" && (
                  <button onClick={() => terminate(l)} className="text-xs text-red-400 hover:text-red-600 border border-red-200 px-3 py-1 rounded-lg transition-colors">
                    Terminate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Modal title="New Lease" onClose={() => setShowForm(false)}>
          <LeaseForm onSave={(l) => { setLeases([...leases, l]); setShowForm(false); }} onClose={() => setShowForm(false)} />
        </Modal>
      )}
    </div>
  );
}
