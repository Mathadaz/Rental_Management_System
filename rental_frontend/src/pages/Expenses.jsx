import { useEffect, useState } from "react";
import { getProperties, getExpenses, createExpense } from "../api";
import { Plus, TrendingDown, Receipt } from "lucide-react";
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

function ExpenseForm({ propertyId, onSave, onClose }) {
  const now = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({ category: "maintenance", amount: "", description: "", expense_date: now, notes: "" });
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await createExpense(propertyId, { ...form, amount: +form.amount });
      toast.success("Expense recorded!");
      onSave(data);
    } catch { toast.error("Failed to record expense"); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handle} className="space-y-4">
      <div><label>Category</label>
        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
          {["maintenance","utilities","insurance","rates","management","other"].map(c => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
      </div>
      <div><label>Amount (R)</label><input type="number" placeholder="1500" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required /></div>
      <div><label>Description</label><input placeholder="Geyser repair" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
      <div><label>Date</label><input type="date" value={form.expense_date} onChange={e => setForm({ ...form, expense_date: e.target.value })} /></div>
      <div><label>Notes</label><textarea rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
      <div className="flex gap-3 pt-2">
        <button className="btn-primary flex-1" type="submit" disabled={loading}>{loading ? "Saving..." : "Record Expense"}</button>
        <button className="btn-ghost" type="button" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
}

const categoryColor = { maintenance: "#b7791f", utilities: "#2563eb", insurance: "#7c3aed", rates: "#dc2626", management: "#059669", other: "#6b7280" };

export default function Expenses() {
  const [properties, setProperties] = useState([]);
  const [selectedProp, setSelectedProp] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProperties().then(r => {
      setProperties(r.data);
      if (r.data.length > 0) {
        setSelectedProp(r.data[0]);
        getExpenses(r.data[0].id).then(e => setExpenses(e.data));
      }
    }).finally(() => setLoading(false));
  }, []);

  const selectProp = async (p) => {
    setSelectedProp(p);
    const { data } = await getExpenses(p.id);
    setExpenses(data);
  };

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const fmt = (d) => new Date(d).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1" style={{ color: "#1a3c2e" }}>Expenses</h1>
          <p className="text-sm" style={{ color: "#6b7280" }}>Track costs per property</p>
        </div>
        {selectedProp && (
          <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Add Expense
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "#1a3c2e", borderTopColor: "transparent" }} /></div>
      ) : properties.length === 0 ? (
        <div className="card p-16 text-center">
          <TrendingDown size={40} className="mx-auto mb-4" style={{ color: "#d1d5db" }} />
          <p className="font-semibold" style={{ color: "#6b7280" }}>No properties yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-6">
          {/* Property selector */}
          <div className="col-span-1 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#9ca3af" }}>Properties</p>
            {properties.map(p => (
              <button key={p.id} onClick={() => selectProp(p)}
                className="w-full text-left p-3 rounded-xl bg-white text-sm transition-all border"
                style={{ borderColor: selectedProp?.id === p.id ? "#1a3c2e" : "transparent" }}>
                <div className="font-semibold text-xs truncate" style={{ color: "#1a3c2e" }}>{p.name}</div>
                <div className="text-xs" style={{ color: "#9ca3af" }}>{p.city}</div>
              </button>
            ))}
          </div>

          {/* Expenses list */}
          <div className="col-span-3">
            {expenses.length > 0 && (
              <div className="card p-4 mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold" style={{ color: "#1a3c2e" }}>Total expenses for {selectedProp?.name}</span>
                <span className="font-display font-bold text-xl" style={{ color: "#c53030" }}>R {total.toLocaleString()}</span>
              </div>
            )}

            {expenses.length === 0 ? (
              <div className="card p-12 text-center">
                <Receipt size={32} className="mx-auto mb-3" style={{ color: "#d1d5db" }} />
                <p className="text-sm" style={{ color: "#6b7280" }}>No expenses recorded for this property</p>
              </div>
            ) : (
              <div className="space-y-3">
                {expenses.map(e => (
                  <div key={e.id} className="card p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#f7f5f0" }}>
                        <Receipt size={16} style={{ color: categoryColor[e.category] || "#6b7280" }} />
                      </div>
                      <div>
                        <div className="font-semibold text-sm" style={{ color: "#1a3c2e" }}>{e.description || e.category}</div>
                        <div className="text-xs" style={{ color: "#9ca3af" }}>{fmt(e.expense_date)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="badge-gray capitalize">{e.category}</span>
                      <span className="font-display font-bold" style={{ color: "#c53030" }}>R {e.amount.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showForm && selectedProp && (
        <Modal title="Add Expense" onClose={() => setShowForm(false)}>
          <ExpenseForm propertyId={selectedProp.id} onSave={(e) => { setExpenses([...expenses, e]); setShowForm(false); }} onClose={() => setShowForm(false)} />
        </Modal>
      )}
    </div>
  );
}
