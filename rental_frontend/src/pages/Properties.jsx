import { useEffect, useState } from "react";
import { getProperties, createProperty, deleteProperty, getUnits, createUnit } from "../api";
import { Plus, Building2, MapPin, Bed, Bath, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
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

function PropertyForm({ onSave, onClose }) {
  const [form, setForm] = useState({ name: "", address: "", city: "", province: "", postal_code: "", property_type: "apartment", bedrooms: 1, bathrooms: 1, size_sqm: "", notes: "" });
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await createProperty({ ...form, bedrooms: +form.bedrooms, bathrooms: +form.bathrooms, size_sqm: form.size_sqm ? +form.size_sqm : null });
      toast.success("Property created!");
      onSave(data);
    } catch { toast.error("Failed to create property"); }
    finally { setLoading(false); }
  };

  const f = (k) => ({ value: form[k], onChange: e => setForm({ ...form, [k]: e.target.value }) });

  return (
    <form onSubmit={handle} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2"><label>Property Name</label><input placeholder="Sandton Flat 4B" {...f("name")} required /></div>
        <div className="col-span-2"><label>Address</label><input placeholder="12 Rivonia Road" {...f("address")} required /></div>
        <div><label>City</label><input placeholder="Johannesburg" {...f("city")} required /></div>
        <div><label>Province</label><input placeholder="Gauteng" {...f("province")} required /></div>
        <div><label>Postal Code</label><input placeholder="2196" {...f("postal_code")} /></div>
        <div><label>Type</label>
          <select {...f("property_type")}>
            {["apartment","house","flat","commercial","townhouse"].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div><label>Bedrooms</label><input type="number" min="0" {...f("bedrooms")} /></div>
        <div><label>Bathrooms</label><input type="number" min="0" step="0.5" {...f("bathrooms")} /></div>
        <div><label>Size (m²)</label><input type="number" placeholder="85" {...f("size_sqm")} /></div>
        <div className="col-span-2"><label>Notes</label><textarea rows={2} {...f("notes")} /></div>
      </div>
      <div className="flex gap-3 pt-2">
        <button className="btn-primary flex-1" type="submit" disabled={loading}>{loading ? "Saving..." : "Create Property"}</button>
        <button className="btn-ghost" type="button" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
}

function UnitForm({ propertyId, onSave, onClose }) {
  const [form, setForm] = useState({ unit_number: "", monthly_rent: "", deposit: "" });
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await createUnit(propertyId, { ...form, monthly_rent: +form.monthly_rent, deposit: +form.deposit || 0 });
      toast.success("Unit added!");
      onSave(data);
    } catch { toast.error("Failed to add unit"); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handle} className="space-y-4">
      <div><label>Unit Number</label><input placeholder="1A, Flat 3, etc." value={form.unit_number} onChange={e => setForm({ ...form, unit_number: e.target.value })} required /></div>
      <div><label>Monthly Rent (R)</label><input type="number" placeholder="8000" value={form.monthly_rent} onChange={e => setForm({ ...form, monthly_rent: e.target.value })} required /></div>
      <div><label>Deposit (R)</label><input type="number" placeholder="16000" value={form.deposit} onChange={e => setForm({ ...form, deposit: e.target.value })} /></div>
      <div className="flex gap-3">
        <button className="btn-primary flex-1" type="submit" disabled={loading}>{loading ? "Saving..." : "Add Unit"}</button>
        <button className="btn-ghost" type="button" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
}

function PropertyCard({ property, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [units, setUnits] = useState([]);
  const [showUnitForm, setShowUnitForm] = useState(false);

  const loadUnits = async () => {
    const { data } = await getUnits(property.id);
    setUnits(data);
  };

  const toggle = () => {
    if (!expanded) loadUnits();
    setExpanded(!expanded);
  };

  return (
    <div className="card overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#e8f5ef" }}>
              <Building2 size={22} style={{ color: "#1a3c2e" }} />
            </div>
            <div>
              <h3 className="font-semibold text-base mb-1" style={{ color: "#1a3c2e" }}>{property.name}</h3>
              <div className="flex items-center gap-1 text-xs" style={{ color: "#6b7280" }}>
                <MapPin size={12} />{property.address}, {property.city}
              </div>
              <div className="flex gap-3 mt-2">
                <span className="flex items-center gap-1 text-xs" style={{ color: "#6b7280" }}><Bed size={12} />{property.bedrooms} bed</span>
                <span className="flex items-center gap-1 text-xs" style={{ color: "#6b7280" }}><Bath size={12} />{property.bathrooms} bath</span>
                <span className="badge-gray capitalize">{property.property_type}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onDelete(property.id)} className="text-gray-300 hover:text-red-400 transition-colors p-1">
              <Trash2 size={16} />
            </button>
            <button onClick={toggle} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
              {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t px-6 py-4" style={{ borderColor: "#ede9e1", background: "#f7f5f0" }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold" style={{ color: "#1a3c2e" }}>Units ({units.length})</span>
            <button className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1" onClick={() => setShowUnitForm(true)}>
              <Plus size={13} /> Add Unit
            </button>
          </div>
          {units.length === 0 ? (
            <p className="text-xs text-center py-4" style={{ color: "#9ca3af" }}>No units yet. Add one above.</p>
          ) : (
            <div className="space-y-2">
              {units.map(u => (
                <div key={u.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-3">
                  <div>
                    <span className="text-sm font-semibold" style={{ color: "#1a3c2e" }}>Unit {u.unit_number}</span>
                    <span className="text-xs ml-3" style={{ color: "#6b7280" }}>R {u.monthly_rent.toLocaleString()}/mo</span>
                  </div>
                  <span className={u.is_occupied ? "badge-green" : "badge-gray"}>
                    {u.is_occupied ? "Occupied" : "Vacant"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showUnitForm && (
        <Modal title="Add Unit" onClose={() => setShowUnitForm(false)}>
          <UnitForm propertyId={property.id} onSave={(u) => { setUnits([...units, u]); setShowUnitForm(false); }} onClose={() => setShowUnitForm(false)} />
        </Modal>
      )}
    </div>
  );
}

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProperties().then(r => setProperties(r.data)).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this property?")) return;
    try {
      await deleteProperty(id);
      setProperties(properties.filter(p => p.id !== id));
      toast.success("Property deleted");
    } catch { toast.error("Failed to delete"); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1" style={{ color: "#1a3c2e" }}>Properties</h1>
          <p className="text-sm" style={{ color: "#6b7280" }}>{properties.length} propert{properties.length !== 1 ? "ies" : "y"} in your portfolio</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Add Property
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "#1a3c2e", borderTopColor: "transparent" }} /></div>
      ) : properties.length === 0 ? (
        <div className="card p-16 text-center">
          <Building2 size={40} className="mx-auto mb-4" style={{ color: "#d1d5db" }} />
          <p className="font-semibold mb-1" style={{ color: "#6b7280" }}>No properties yet</p>
          <p className="text-sm mb-4" style={{ color: "#9ca3af" }}>Add your first property to get started</p>
          <button className="btn-primary" onClick={() => setShowForm(true)}>Add Property</button>
        </div>
      ) : (
        <div className="space-y-4">
          {properties.map(p => <PropertyCard key={p.id} property={p} onDelete={handleDelete} />)}
        </div>
      )}

      {showForm && (
        <Modal title="Add Property" onClose={() => setShowForm(false)}>
          <PropertyForm onSave={(p) => { setProperties([...properties, p]); setShowForm(false); }} onClose={() => setShowForm(false)} />
        </Modal>
      )}
    </div>
  );
}
