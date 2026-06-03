import { useEffect, useState } from "react";
import { getTenants, createTenant, deleteTenant } from "../api";
import { Plus, Users, Phone, Mail, Trash2, User } from "lucide-react";
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

function TenantForm({ onSave, onClose }) {
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", id_number: "", employer: "", emergency_contact_name: "", emergency_contact_phone: "", notes: "" });
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await createTenant(form);
      toast.success("Tenant added!");
      onSave(data);
    } catch { toast.error("Failed to add tenant"); }
    finally { setLoading(false); }
  };

  const f = (k) => ({ value: form[k], onChange: e => setForm({ ...form, [k]: e.target.value }) });

  return (
    <form onSubmit={handle} className="space-y-4">
      <div><label>Full Name *</label><input placeholder="John Smith" {...f("full_name")} required /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label>Email</label><input type="email" placeholder="john@example.com" {...f("email")} /></div>
        <div><label>Phone</label><input placeholder="+27 82 000 0000" {...f("phone")} /></div>
        <div><label>SA ID / Passport</label><input placeholder="8801015009087" {...f("id_number")} /></div>
        <div><label>Employer</label><input placeholder="Acme Corp" {...f("employer")} /></div>
        <div><label>Emergency Contact</label><input placeholder="Jane Smith" {...f("emergency_contact_name")} /></div>
        <div><label>Emergency Phone</label><input placeholder="+27 82 111 1111" {...f("emergency_contact_phone")} /></div>
      </div>
      <div><label>Notes</label><textarea rows={2} {...f("notes")} /></div>
      <div className="flex gap-3 pt-2">
        <button className="btn-primary flex-1" type="submit" disabled={loading}>{loading ? "Saving..." : "Add Tenant"}</button>
        <button className="btn-ghost" type="button" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
}

export default function Tenants() {
  const [tenants, setTenants] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getTenants().then(r => setTenants(r.data)).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this tenant?")) return;
    try {
      await deleteTenant(id);
      setTenants(tenants.filter(t => t.id !== id));
      toast.success("Tenant removed");
    } catch { toast.error("Failed to delete"); }
  };

  const filtered = tenants.filter(t =>
    t.full_name.toLowerCase().includes(search.toLowerCase()) ||
    t.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1" style={{ color: "#1a3c2e" }}>Tenants</h1>
          <p className="text-sm" style={{ color: "#6b7280" }}>{tenants.length} tenant{tenants.length !== 1 ? "s" : ""} registered</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Add Tenant
        </button>
      </div>

      <div className="mb-5">
        <input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "#1a3c2e", borderTopColor: "transparent" }} /></div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <Users size={40} className="mx-auto mb-4" style={{ color: "#d1d5db" }} />
          <p className="font-semibold mb-1" style={{ color: "#6b7280" }}>{search ? "No tenants found" : "No tenants yet"}</p>
          {!search && <button className="btn-primary mt-3" onClick={() => setShowForm(true)}>Add Tenant</button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(t => (
            <div key={t.id} className="card p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm"
                    style={{ background: "#1a3c2e" }}>
                    {t.full_name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: "#1a3c2e" }}>{t.full_name}</div>
                    {t.employer && <div className="text-xs" style={{ color: "#9ca3af" }}>{t.employer}</div>}
                  </div>
                </div>
                <button onClick={() => handleDelete(t.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
              <div className="space-y-1.5">
                {t.email && <div className="flex items-center gap-2 text-xs" style={{ color: "#6b7280" }}><Mail size={12} />{t.email}</div>}
                {t.phone && <div className="flex items-center gap-2 text-xs" style={{ color: "#6b7280" }}><Phone size={12} />{t.phone}</div>}
                {t.id_number && <div className="flex items-center gap-2 text-xs" style={{ color: "#6b7280" }}><User size={12} />ID: {t.id_number}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Modal title="Add Tenant" onClose={() => setShowForm(false)}>
          <TenantForm onSave={(t) => { setTenants([...tenants, t]); setShowForm(false); }} onClose={() => setShowForm(false)} />
        </Modal>
      )}
    </div>
  );
}
