import { useEffect, useState } from "react";
import { getMaintenance, createMaintenance, updateMaintenance, getProperties, getUnits } from "../api";
import { Plus, Wrench, AlertTriangle, CheckCircle, Clock } from "lucide-react";
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

function MaintenanceForm({ onSave, onClose }) {
  const [properties, setProperties] = useState([]);
  const [units, setUnits] = useState([]);
  const [selectedProp, setSelectedProp] = useState("");
  const [form, setForm] = useState({ unit_id: "", title: "", description: "", priority: "medium", raised_by: "", assigned_to: "", estimated_cost: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => { getProperties().then(r => setProperties(r.data)); }, []);
  useEffect(() => { if (selectedProp) getUnits(selectedProp).then(r => setUnits(r.data)); }, [selectedProp]);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await createMaintenance({ ...form, unit_id: +form.unit_id, estimated_cost: form.estimated_cost ? +form.estimated_cost : null });
      toast.success("Request created!");
      onSave(data);
    } catch { toast.error("Failed to create request"); }
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
          {units.map(u => <option key={u.id} value={u.id}>Unit {u.unit_number}</option>)}
        </select>
      </div>
      <div><label>Title *</label><input placeholder="Leaking tap in bathroom" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
      <div><label>Description</label><textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label>Priority</label>
          <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
            {["low","medium","high","urgent"].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
        </div>
        <div><label>Est. Cost (R)</label><input type="number" value={form.estimated_cost} onChange={e => setForm({ ...form, estimated_cost: e.target.value })} /></div>
        <div><label>Raised By</label><input placeholder="Tenant name" value={form.raised_by} onChange={e => setForm({ ...form, raised_by: e.target.value })} /></div>
        <div><label>Assigned To</label><input placeholder="Contractor name" value={form.assigned_to} onChange={e => setForm({ ...form, assigned_to: e.target.value })} /></div>
      </div>
      <div className="flex gap-3 pt-2">
        <button className="btn-primary flex-1" type="submit" disabled={loading}>{loading ? "Saving..." : "Create Request"}</button>
        <button className="btn-ghost" type="button" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
}

const priorityBadge = (p) => {
  const map = { low: "badge-gray", medium: "badge-amber", high: "badge-red", urgent: "badge-red" };
  return <span className={map[p] || "badge-gray"}>{p}</span>;
};

const statusIcon = (s) => {
  if (s === "open") return <Clock size={16} style={{ color: "#b7791f" }} />;
  if (s === "in_progress") return <AlertTriangle size={16} style={{ color: "#2563eb" }} />;
  return <CheckCircle size={16} style={{ color: "#2d6a4f" }} />;
};

export default function Maintenance() {
  const [requests, setRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMaintenance().then(r => setRequests(r.data)).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (req, status) => {
    try {
      const { data } = await updateMaintenance(req.id, { status, resolved_at: status === "resolved" ? new Date().toISOString() : null });
      setRequests(requests.map(r => r.id === data.id ? data : r));
      toast.success("Status updated");
    } catch { toast.error("Failed"); }
  };

  const filtered = filter === "all" ? requests : requests.filter(r => r.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1" style={{ color: "#1a3c2e" }}>Maintenance</h1>
          <p className="text-sm" style={{ color: "#6b7280" }}>{requests.filter(r => r.status === "open").length} open requests</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(true)}>
          <Plus size={16} /> New Request
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {["all","open","in_progress","resolved"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f ? "text-white" : "text-gray-500 bg-white hover:bg-gray-50"}`}
            style={filter === f ? { background: "#1a3c2e" } : {}}>
            {f === "all" ? "All" : f === "in_progress" ? "In Progress" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "#1a3c2e", borderTopColor: "transparent" }} /></div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <Wrench size={40} className="mx-auto mb-4" style={{ color: "#d1d5db" }} />
          <p className="font-semibold" style={{ color: "#6b7280" }}>No requests found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <div key={r.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mt-0.5" style={{ background: "#f7f5f0" }}>
                    {statusIcon(r.status)}
                  </div>
                  <div>
                    <div className="font-semibold text-sm mb-1" style={{ color: "#1a3c2e" }}>{r.title}</div>
                    {r.description && <div className="text-xs mb-2" style={{ color: "#6b7280" }}>{r.description}</div>}
                    <div className="flex gap-2 flex-wrap">
                      {priorityBadge(r.priority)}
                      {r.raised_by && <span className="badge-gray">By: {r.raised_by}</span>}
                      {r.assigned_to && <span className="badge-green">→ {r.assigned_to}</span>}
                      {r.estimated_cost && <span className="badge-amber">Est. R{r.estimated_cost.toLocaleString()}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  {r.status === "open" && (
                    <button onClick={() => updateStatus(r, "in_progress")} className="text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors" style={{ borderColor: "#2563eb", color: "#2563eb" }}>
                      Start
                    </button>
                  )}
                  {r.status === "in_progress" && (
                    <button onClick={() => updateStatus(r, "resolved")} className="text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors" style={{ borderColor: "#2d6a4f", color: "#2d6a4f" }}>
                      Resolve
                    </button>
                  )}
                  {r.status === "resolved" && <span className="badge-green">Resolved</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Modal title="New Maintenance Request" onClose={() => setShowForm(false)}>
          <MaintenanceForm onSave={(req) => { setRequests([...requests, req]); setShowForm(false); }} onClose={() => setShowForm(false)} />
        </Modal>
      )}
    </div>
  );
}
