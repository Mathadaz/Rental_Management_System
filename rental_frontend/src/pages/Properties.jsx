import { useEffect, useState } from "react";
import { getProperties, createProperty, deleteProperty, getUnits, createUnit } from "../api";
import { Plus, Building2, MapPin, Bed, Bath, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const SA_PROVINCES = ["Eastern Cape","Free State","Gauteng","KwaZulu-Natal","Limpopo","Mpumalanga","Northern Cape","North West","Western Cape"];
const PROPERTY_TYPES = ["House","Apartment","Flat","Townhouse","Commercial","Guest House"];
const UNIT_TYPES = ["Room","Flat","Apartment","Studio","Bachelor","Cottage","Garage"];

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
      <div className="card w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
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
  const [step, setStep] = useState(1); // 1 = property details, 2 = configure units
  const [form, setForm] = useState({
    name: "", address: "", city: "", province: "",
    postal_code: "", property_type: "House",
    bedrooms: "", bathrooms: 1, size_sqm: "", notes: ""
  });
  const [unitType, setUnitType] = useState("Room");
  const [units, setUnits] = useState([]); // auto-generated units
  const [loading, setLoading] = useState(false);

  const f = (k) => ({ value: form[k], onChange: e => setForm({ ...form, [k]: e.target.value }) });

  // When number of bedrooms changes, auto-generate unit rows
  const handleBedroomsChange = (val) => {
    const num = parseInt(val) || 0;
    setForm({ ...form, bedrooms: val });
    const generated = Array.from({ length: num }, (_, i) => ({
      unit_number: `${unitType} ${i + 1}`,
      monthly_rent: "",
      deposit: "",
      notes: ""
    }));
    setUnits(generated);
  };

  const handleUnitTypeChange = (type) => {
    setUnitType(type);
    setUnits(units.map((u, i) => ({ ...u, unit_number: `${type} ${i + 1}` })));
  };

  const updateUnit = (index, field, value) => {
    const updated = [...units];
    updated[index] = { ...updated[index], [field]: value };
    setUnits(updated);
  };

  const goToStep2 = (e) => {
    e.preventDefault();
    if (!form.name || !form.address || !form.city || !form.province) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!form.bedrooms || +form.bedrooms < 1) {
      toast.error("Enter number of units/rooms");
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const missingRent = units.find(u => !u.monthly_rent);
    if (missingRent) {
      toast.error(`Enter rent for ${missingRent.unit_number}`);
      return;
    }
    setLoading(true);
    try {
      const { data: prop } = await createProperty({
        ...form,
        bedrooms: +form.bedrooms,
        bathrooms: +form.bathrooms,
        size_sqm: form.size_sqm ? +form.size_sqm : null
      });
      for (const u of units) {
        await createUnit(prop.id, {
          unit_number: u.unit_number,
          monthly_rent: +u.monthly_rent,
          deposit: +u.deposit || 0,
          notes: u.notes
        });
      }
      toast.success(`Property created with ${units.length} unit${units.length !== 1 ? "s" : ""}!`);
      onSave(prop);
    } catch { toast.error("Failed to create property"); }
    finally { setLoading(false); }
  };

  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-6">
        {[1, 2].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: step >= s ? "#1a3c2e" : "#ede9e1", color: step >= s ? "white" : "#9ca3af" }}>
              {s}
            </div>
            <span className="text-xs font-medium" style={{ color: step >= s ? "#1a3c2e" : "#9ca3af" }}>
              {s === 1 ? "Property Details" : "Configure Units"}
            </span>
            {s < 2 && <div className="w-8 h-px" style={{ background: "#ede9e1" }} />}
          </div>
        ))}
      </div>

      {/* Step 1: Property details */}
      {step === 1 && (
        <form onSubmit={goToStep2} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label>Property Name *</label>
              <input placeholder="e.g. Mamelodi 4-Room House" {...f("name")} required />
            </div>
            <div className="col-span-2">
              <label>Address *</label>
              <input placeholder="123 Main Street" {...f("address")} required />
            </div>
            <div>
              <label>City *</label>
              <input placeholder="Pretoria" {...f("city")} required />
            </div>
            <div>
              <label>Province *</label>
              <select {...f("province")} required>
                <option value="">Select province...</option>
                {SA_PROVINCES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label>Postal Code</label>
              <input placeholder="0122" {...f("postal_code")} />
            </div>
            <div>
              <label>Property Type</label>
              <select {...f("property_type")}>
                {PROPERTY_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label>Bathrooms</label>
              <input type="number" min="0" step="0.5" {...f("bathrooms")} />
            </div>
            <div>
              <label>Size (m²)</label>
              <input type="number" placeholder="120" {...f("size_sqm")} />
            </div>

            {/* KEY FIELD: number of units */}
            <div className="col-span-2 p-4 rounded-xl" style={{ background: "#e8f5ef" }}>
              <label style={{ color: "#1a3c2e" }}>How many rentable units / rooms does this property have? *</label>
              <div className="flex gap-3 mt-1">
                <input
                  type="number" min="1" max="50"
                  placeholder="e.g. 4"
                  value={form.bedrooms}
                  onChange={e => handleBedroomsChange(e.target.value)}
                  className="flex-1"
                  required
                />
                <select value={unitType} onChange={e => handleUnitTypeChange(e.target.value)} className="flex-1">
                  {UNIT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              {units.length > 0 && (
                <p className="text-xs mt-2" style={{ color: "#2d6a4f" }}>
                  Will create: {units.map(u => u.unit_number).join(", ")}
                </p>
              )}
            </div>

            <div className="col-span-2">
              <label>Notes</label>
              <input placeholder="Any additional notes" {...f("notes")} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button className="btn-primary flex-1" type="submit">
              Next: Set Rent Prices →
            </button>
            <button className="btn-ghost" type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      )}

      {/* Step 2: Configure each unit's rent */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm" style={{ color: "#6b7280" }}>
            Set the rent and deposit for each unit in <strong>{form.name}</strong>.
          </p>

          <div className="space-y-3">
            {units.map((u, i) => (
              <div key={i} className="p-4 rounded-xl border" style={{ borderColor: "#ede9e1", background: "#fafafa" }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: "#1a3c2e" }}>{i + 1}</div>
                  <span className="font-semibold text-sm" style={{ color: "#1a3c2e" }}>{u.unit_number}</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label>Monthly Rent (R) *</label>
                    <input type="number" placeholder="3500"
                      value={u.monthly_rent}
                      onChange={e => updateUnit(i, "monthly_rent", e.target.value)}
                      required />
                  </div>
                  <div>
                    <label>Deposit (R)</label>
                    <input type="number" placeholder="7000"
                      value={u.deposit}
                      onChange={e => updateUnit(i, "deposit", e.target.value)} />
                  </div>
                  <div>
                    <label>Notes</label>
                    <input placeholder="Ensuite, etc."
                      value={u.notes}
                      onChange={e => updateUnit(i, "notes", e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-ghost" onClick={() => setStep(1)}>← Back</button>
            <button className="btn-primary flex-1" type="submit" disabled={loading}>
              {loading ? "Creating..." : `Create Property + ${units.length} Unit${units.length !== 1 ? "s" : ""}`}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function PropertyCard({ property, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [units, setUnits] = useState([]);
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [newUnit, setNewUnit] = useState({ unit_number: "", monthly_rent: "", deposit: "", notes: "" });
  const [adding, setAdding] = useState(false);

  const loadUnits = async () => {
    const { data } = await getUnits(property.id);
    setUnits(data);
  };

  const toggle = () => {
    if (!expanded) loadUnits();
    setExpanded(!expanded);
  };

  const addUnit = async () => {
    if (!newUnit.unit_number || !newUnit.monthly_rent) { toast.error("Enter unit name and rent"); return; }
    setAdding(true);
    try {
      const { data } = await createUnit(property.id, {
        unit_number: newUnit.unit_number,
        monthly_rent: +newUnit.monthly_rent,
        deposit: +newUnit.deposit || 0,
        notes: newUnit.notes
      });
      setUnits([...units, data]);
      setNewUnit({ unit_number: "", monthly_rent: "", deposit: "", notes: "" });
      setShowAddUnit(false);
      toast.success(`${data.unit_number} added!`);
    } catch { toast.error("Failed"); }
    finally { setAdding(false); }
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
              <div className="flex items-center gap-1 text-xs mb-2" style={{ color: "#6b7280" }}>
                <MapPin size={12} />{property.address}, {property.city}, {property.province}
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className="flex items-center gap-1 text-xs" style={{ color: "#6b7280" }}><Bed size={12} />{property.bedrooms} units</span>
                <span className="flex items-center gap-1 text-xs" style={{ color: "#6b7280" }}><Bath size={12} />{property.bathrooms} bath</span>
                <span className="badge-gray">{property.property_type}</span>
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
            <button className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1"
              onClick={() => setShowAddUnit(!showAddUnit)}>
              <Plus size={13} /> Add Unit
            </button>
          </div>

          {showAddUnit && (
            <div className="mb-4 p-4 rounded-xl border-2 border-dashed" style={{ borderColor: "#c9a84c" }}>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="col-span-2">
                  <label>Unit Name</label>
                  <input placeholder="Room 5, Garage, etc." value={newUnit.unit_number}
                    onChange={e => setNewUnit({ ...newUnit, unit_number: e.target.value })} />
                </div>
                <div>
                  <label>Rent (R)</label>
                  <input type="number" placeholder="3500" value={newUnit.monthly_rent}
                    onChange={e => setNewUnit({ ...newUnit, monthly_rent: e.target.value })} />
                </div>
                <div>
                  <label>Deposit (R)</label>
                  <input type="number" placeholder="7000" value={newUnit.deposit}
                    onChange={e => setNewUnit({ ...newUnit, deposit: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={addUnit} disabled={adding} className="btn-primary flex-1 text-xs py-2">
                  {adding ? "Adding..." : "Save Unit"}
                </button>
                <button type="button" onClick={() => setShowAddUnit(false)} className="btn-ghost text-xs py-2 px-3">Cancel</button>
              </div>
            </div>
          )}

          {units.length === 0 ? (
            <p className="text-xs text-center py-4" style={{ color: "#9ca3af" }}>No units yet.</p>
          ) : (
            <div className="space-y-2">
              {units.map(u => (
                <div key={u.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-3">
                  <div>
                    <span className="text-sm font-semibold" style={{ color: "#1a3c2e" }}>{u.unit_number}</span>
                    <span className="text-xs ml-3" style={{ color: "#6b7280" }}>R {u.monthly_rent.toLocaleString()}/mo</span>
                    {u.notes && <span className="text-xs ml-2" style={{ color: "#9ca3af" }}>{u.notes}</span>}
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
    if (!confirm("Delete this property and all its units?")) return;
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
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "#1a3c2e", borderTopColor: "transparent" }} />
        </div>
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
          <PropertyForm
            onSave={(p) => { setProperties([...properties, p]); setShowForm(false); }}
            onClose={() => setShowForm(false)}
          />
        </Modal>
      )}
    </div>
  );
}