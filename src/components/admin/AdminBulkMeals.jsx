import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, X, Save, ChevronDown, ChevronUp,
         UtensilsCrossed, Users, IndianRupee, Calculator } from 'lucide-react';
import { API_BASE_URL } from '../../utils/api.js';

const OCCASIONS = [
    'Wedding', 'Birthday Party', 'Corporate Event', 'Festival',
    'Pooja / Religious', 'House Party', 'Anniversary', 'Other',
];
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Hi-Tea', 'Brunch'];

const emptyMeal = () => ({
    name: '', occasion: '', meal_type: 'Lunch', num_people: '', notes: '',
    dishes: [],   // [{ dish_id, num_people, _dish (local ref) }]
});

// ── Format helpers ────────────────────────────────────────────────────────────
const fmt  = (n) => Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });
const fmtQ = (n, unit) => `${Number(n).toFixed(4)} ${unit}`;

// ── Per-dish calculation (live) ───────────────────────────────────────────────
function calcLine(dish, numPeople) {
    if (!dish || !numPeople) return { required_quantity: 0, total_cost: 0 };
    const qpp = dish.bulk_quantity / dish.serves_people;
    const ppp = dish.bulk_price    / dish.serves_people;
    return {
        required_quantity: +(qpp * numPeople).toFixed(4),
        total_cost:        +(ppp * numPeople).toFixed(2),
    };
}

function grandTotal(lines) {
    return lines.reduce((s, l) => s + (l.total_cost || 0), 0);
}

// ── Dish picker row ───────────────────────────────────────────────────────────
const DishRow = ({ line, allDishes, onChange, onRemove }) => {
    const d   = line._dish;
    const cl  = calcLine(d, parseInt(line.num_people) || 0);

    return (
        <div className="grid grid-cols-12 gap-2 items-start bg-gray-50 rounded-xl p-3">
            {/* Dish selector */}
            <div className="col-span-12 sm:col-span-4">
                <select
                    value={line.dish_id || ''}
                    onChange={e => onChange('dish_id', e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                    <option value="" disabled>Select dish…</option>
                    {allDishes.filter(d => d.is_active).map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.category})</option>
                    ))}
                </select>
            </div>

            {/* People count */}
            <div className="col-span-6 sm:col-span-2">
                <input
                    type="number" min="1" step="1" value={line.num_people} required
                    onChange={e => onChange('num_people', e.target.value)}
                    placeholder="People"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
            </div>

            {/* Calculated read-only fields */}
            <div className="col-span-6 sm:col-span-3 text-xs text-gray-600 space-y-0.5 pt-2">
                {d && parseInt(line.num_people) > 0 ? (
                    <>
                        <div>Qty: <span className="font-bold text-teal-700">{fmtQ(cl.required_quantity, d.unit)}</span></div>
                        <div>Cost: <span className="font-bold text-emerald-700">₹{fmt(cl.total_cost)}</span></div>
                        <div className="text-gray-400">
                            (₹{(d.bulk_price / d.serves_people).toFixed(2)}/person × {line.num_people})
                        </div>
                    </>
                ) : (
                    <span className="text-gray-400 italic">Select dish & people</span>
                )}
            </div>

            {/* Remove */}
            <div className="col-span-12 sm:col-span-3 flex justify-end items-start pt-1">
                <button type="button" onClick={onRemove}
                    className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <X size={14} />
                </button>
            </div>
        </div>
    );
};

// ── Modal: create / edit meal plan ────────────────────────────────────────────
const MealModal = ({ initial, allDishes, onClose, onSave, saving, error }) => {
    const [form, setForm] = useState(initial ?? emptyMeal());

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const addDish = () => setForm(p => ({
        ...p, dishes: [...p.dishes, { _id: Date.now(), dish_id: '', num_people: p.num_people || '', _dish: null }],
    }));

    const updateDishLine = (idx, field, value) => {
        setForm(p => ({
            ...p,
            dishes: p.dishes.map((l, i) => {
                if (i !== idx) return l;
                const updated = { ...l, [field]: value };
                if (field === 'dish_id') updated._dish = allDishes.find(d => d.id === parseInt(value)) ?? null;
                return updated;
            }),
        }));
    };

    const removeDishLine = (idx) => setForm(p => ({ ...p, dishes: p.dishes.filter((_, i) => i !== idx) }));

    const lines = form.dishes.map(l => ({
        ...l, ...calcLine(l._dish, parseInt(l.num_people) || 0),
    }));
    const total = grandTotal(lines);

    const submit = (e) => {
        e.preventDefault();
        const payload = {
            ...form,
            num_people: parseInt(form.num_people),
            dishes: form.dishes
                .filter(l => l.dish_id && parseInt(l.num_people) > 0)
                .map(l => ({ dish_id: parseInt(l.dish_id), num_people: parseInt(l.num_people) })),
        };
        onSave(payload);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-5 flex items-center justify-between text-white rounded-t-3xl z-10">
                    <div>
                        <h2 className="text-xl font-bold">{initial?.id ? 'Edit Meal Plan' : 'Create Meal Plan'}</h2>
                        <p className="text-sm text-indigo-200 mt-0.5">Select dishes — quantities & costs are calculated automatically</p>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={submit} className="p-6 space-y-5">
                    {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Plan Name *</label>
                        <input required value={form.name} onChange={e => set('name', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            placeholder="e.g., Wedding Reception Dinner" />
                    </div>

                    {/* Occasion + Meal Type + People */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Occasion *</label>
                            <select required value={form.occasion} onChange={e => set('occasion', e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400">
                                <option value="" disabled>Select…</option>
                                {OCCASIONS.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Meal Type *</label>
                            <select required value={form.meal_type} onChange={e => set('meal_type', e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400">
                                {MEAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">No. of People *</label>
                            <input required type="number" min="1" value={form.num_people}
                                onChange={e => set('num_people', e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                placeholder="e.g., 250" />
                        </div>
                    </div>

                    {/* Dishes section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-bold text-gray-700">Dishes in this plan</label>
                            <button type="button" onClick={addDish}
                                className="admin-chip primary text-xs flex items-center gap-1">
                                <Plus size={12} /> Add Dish
                            </button>
                        </div>

                        {form.dishes.length === 0 && (
                            <p className="text-sm text-gray-400 italic py-3 text-center">
                                No dishes added yet — click "Add Dish" above.
                            </p>
                        )}

                        {/* Column headers */}
                        {form.dishes.length > 0 && (
                            <div className="grid grid-cols-12 gap-2 px-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                                <span className="col-span-12 sm:col-span-4">Dish</span>
                                <span className="col-span-6 sm:col-span-2">People</span>
                                <span className="col-span-6 sm:col-span-3">Calculated</span>
                                <span className="col-span-12 sm:col-span-3" />
                            </div>
                        )}

                        {form.dishes.map((line, idx) => (
                            <DishRow
                                key={line._id ?? idx}
                                line={line}
                                allDishes={allDishes}
                                onChange={(f, v) => updateDishLine(idx, f, v)}
                                onRemove={() => removeDishLine(idx)}
                            />
                        ))}

                        {/* Grand total preview */}
                        {form.dishes.some(l => l.dish_id && parseInt(l.num_people) > 0) && (
                            <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3">
                                <span className="text-sm font-bold text-indigo-700 flex items-center gap-2">
                                    <Calculator size={16} /> Estimated Grand Total
                                </span>
                                <span className="text-xl font-extrabold text-indigo-900">₹{fmt(total)}</span>
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Notes</label>
                        <textarea rows={2} value={form.notes} onChange={e => set('notes', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                            placeholder="Optional notes / special instructions" />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 px-4 py-3 bg-gray-100 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                            <Save size={16} />
                            {saving ? 'Saving…' : (initial?.id ? 'Save Changes' : 'Create Plan')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ── Detail card (expanded meal) ────────────────────────────────────────────────
const MealDetailPanel = ({ meal }) => (
    <div className="bg-indigo-50/60 rounded-b-2xl border-t border-indigo-100 px-5 py-4 space-y-3">
        {meal.notes && (
            <p className="text-sm text-indigo-700 italic">📝 {meal.notes}</p>
        )}
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-xs font-bold text-gray-500 uppercase tracking-wide text-left">
                        <th className="py-1.5 pr-4">Dish</th>
                        <th className="py-1.5 pr-4">Category</th>
                        <th className="py-1.5 pr-4 text-right">People</th>
                        <th className="py-1.5 pr-4 text-right">Req. Qty</th>
                        <th className="py-1.5 pr-4 text-right">₹/Person</th>
                        <th className="py-1.5 text-right">Total Cost</th>
                    </tr>
                </thead>
                <tbody>
                    {(meal.dishes ?? []).map((dl, i) => (
                        <tr key={i} className="border-t border-indigo-100">
                            <td className="py-2 pr-4 font-semibold text-slate-900">{dl.dish_name}</td>
                            <td className="py-2 pr-4">
                                <span className="admin-chip text-xs py-0.5 px-2">{dl.category}</span>
                            </td>
                            <td className="py-2 pr-4 text-right tabular-nums">{dl.num_people}</td>
                            <td className="py-2 pr-4 text-right tabular-nums text-teal-700 font-semibold">
                                {dl.required_quantity} {dl.unit}
                            </td>
                            <td className="py-2 pr-4 text-right tabular-nums">₹{dl.price_per_person}</td>
                            <td className="py-2 text-right tabular-nums font-bold text-emerald-700">
                                ₹{fmt(dl.total_cost)}
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="border-t-2 border-indigo-200">
                        <td colSpan={5} className="py-2 text-right font-bold text-indigo-800 pr-4">Grand Total</td>
                        <td className="py-2 text-right font-extrabold text-indigo-900 text-base">
                            ₹{fmt(meal.grand_total)}
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    </div>
);

// ── Main component ─────────────────────────────────────────────────────────────
const AdminBulkMeals = () => {
    const navigate   = useNavigate();
    const [meals,    setMeals]    = useState([]);
    const [allDishes, setAllDishes] = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [error,    setError]    = useState('');
    const [modal,    setModal]    = useState(null);   // null | { mode, item }
    const [saving,   setSaving]   = useState(false);
    const [saveErr,  setSaveErr]  = useState('');
    const [expanded, setExpanded] = useState(null);
    const [occFilter, setOccFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    const token    = () => localStorage.getItem('session_token');
    const authHdrs = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` });
    const redir401 = (s) => { if (s === 401 || s === 403) { navigate('/admin/login'); return true; } return false; };

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [mRes, dRes] = await Promise.all([
                fetch(`${API_BASE_URL}/admin/bulk_meals.php`, { headers: authHdrs() }),
                fetch(`${API_BASE_URL}/admin/dishes.php`,     { headers: authHdrs() }),
            ]);
            if (redir401(mRes.status) || redir401(dRes.status)) return;
            const [mJson, dJson] = await Promise.all([mRes.json(), dRes.json()]);
            if (mJson.success) setMeals(mJson.data);
            if (dJson.success) setAllDishes(dJson.data);
            if (!mJson.success) setError(mJson.message);
        } catch { setError('Failed to load data.'); }
        finally { setLoading(false); }
    }, []); // eslint-disable-line

    useEffect(() => { fetchAll(); }, [fetchAll]);

    // When opening edit modal, fetch the detailed plan (with dishes)
    const openEdit = async (meal) => {
        setSaveErr('');
        try {
            const res = await fetch(`${API_BASE_URL}/admin/bulk_meals.php?id=${meal.id}`, { headers: authHdrs() });
            if (redir401(res.status)) return;
            const json = await res.json();
            if (!json.success) { alert(json.message); return; }
            const detail = json.data;
            // Attach _dish refs and _id
            const dishLines = (detail.dishes ?? []).map(dl => ({
                _id:       dl.id,
                dish_id:   dl.dish_id,
                num_people: dl.num_people,
                _dish:     allDishes.find(d => d.id === dl.dish_id) ?? null,
            }));
            setModal({ mode: 'edit', item: { ...detail, dishes: dishLines } });
        } catch { alert('Failed to load plan details.'); }
    };

    const handleSave = async (payload) => {
        setSaving(true); setSaveErr('');
        try {
            const isEdit = modal.mode === 'edit';
            const body   = isEdit ? { ...payload, id: modal.item.id } : payload;
            const res    = await fetch(`${API_BASE_URL}/admin/bulk_meals.php`, {
                method: isEdit ? 'PUT' : 'POST',
                headers: authHdrs(), body: JSON.stringify(body),
            });
            if (redir401(res.status)) return;
            const json = await res.json();
            if (json.success) { setModal(null); fetchAll(); }
            else setSaveErr(json.message || 'Save failed.');
        } catch { setSaveErr('Network error.'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this meal plan?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/admin/bulk_meals.php`, {
                method: 'DELETE', headers: authHdrs(), body: JSON.stringify({ id }),
            });
            if (redir401(res.status)) return;
            const json = await res.json();
            if (json.success) fetchAll(); else alert(json.message);
        } catch { alert('Delete failed.'); }
    };

    const handleExpand = async (meal) => {
        if (expanded?.id === meal.id) { setExpanded(null); return; }
        try {
            const res  = await fetch(`${API_BASE_URL}/admin/bulk_meals.php?id=${meal.id}`, { headers: authHdrs() });
            const json = await res.json();
            if (json.success) setExpanded(json.data);
        } catch { /* leave as-is */ }
    };

    // ── Filtered list ─────────────────────────────────────────────────────────
    const visible = meals.filter(m =>
        (!occFilter  || m.occasion  === occFilter)  &&
        (!typeFilter || m.meal_type === typeFilter)
    );

    const occasions  = [...new Set(meals.map(m => m.occasion))].sort();
    const mealTypes  = [...new Set(meals.map(m => m.meal_type))].sort();
    const grandSum   = meals.reduce((s, m) => s + m.grand_total, 0);
    const totalPeople = meals.reduce((s, m) => s + m.num_people, 0);

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Meal Management</p>
                    <h1 className="text-2xl font-extrabold text-slate-900">Bulk Meal Plans</h1>
                    <p className="text-sm text-slate-500">{meals.length} plan{meals.length !== 1 ? 's' : ''} across {occasions.length} occasions</p>
                </div>
                <button
                    onClick={() => { setSaveErr(''); setModal({ mode: 'add', item: null }); }}
                    className="admin-chip primary flex items-center gap-1.5"
                    disabled={allDishes.length === 0}
                    title={allDishes.length === 0 ? 'Add dishes first before creating a meal plan' : ''}
                >
                    <Plus size={16} /> New Meal Plan
                </button>
            </div>

            {allDishes.length === 0 && !loading && (
                <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm font-semibold">
                    ⚠️ You have no dishes yet. Add dishes in <strong>Dish Management</strong> before creating meal plans.
                </div>
            )}

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Total Plans',   value: meals.length,          icon: UtensilsCrossed, color: 'text-slate-900' },
                    { label: 'Total People',  value: totalPeople.toLocaleString(), icon: Users,  color: 'text-indigo-700' },
                    { label: 'Total Revenue', value: `₹${fmt(grandSum)}`,  icon: IndianRupee,     color: 'text-emerald-700' },
                    { label: 'Avg Cost',      value: meals.length ? `₹${fmt(grandSum/meals.length)}` : '—', icon: Calculator, color: 'text-teal-700' },
                ].map(c => (
                    <div key={c.label} className="glass-card p-4 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                            <c.icon size={16} className="text-slate-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">{c.label}</p>
                            <p className={`text-xl font-extrabold mt-0.5 ${c.color}`}>{c.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="glass-card p-4 flex flex-wrap gap-3">
                <select value={occFilter} onChange={e => setOccFilter(e.target.value)}
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                    <option value="">All Occasions</option>
                    {occasions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                    <option value="">All Meal Types</option>
                    {mealTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {(occFilter || typeFilter) && (
                    <button onClick={() => { setOccFilter(''); setTypeFilter(''); }}
                        className="admin-chip text-xs">Clear filters</button>
                )}
            </div>

            {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}

            {loading ? (
                <div className="glass-card p-8 text-center text-slate-500">Loading meal plans…</div>
            ) : visible.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <UtensilsCrossed size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-semibold">No meal plans found</p>
                    {meals.length > 0 && <p className="text-slate-400 text-sm mt-1">Try clearing filters</p>}
                </div>
            ) : (
                <div className="space-y-3">
                    {visible.map(meal => (
                        <div key={meal.id} className="glass-card overflow-hidden">
                            {/* Plan row */}
                            <div className="flex items-center gap-4 p-4 flex-wrap">
                                <button
                                    onClick={() => handleExpand(meal)}
                                    className="flex items-center gap-2 text-left flex-1 min-w-0 hover:text-indigo-700 transition-colors"
                                >
                                    <div className={`transition-transform ${expanded?.id === meal.id ? 'rotate-180' : ''}`}>
                                        <ChevronDown size={18} className="text-slate-400 flex-shrink-0" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-slate-900 truncate">{meal.name}</p>
                                        <p className="text-xs text-slate-500">{meal.occasion} · {meal.meal_type}</p>
                                    </div>
                                </button>

                                {/* Meta chips */}
                                <div className="flex flex-wrap gap-2 items-center">
                                    <span className="admin-chip text-xs flex items-center gap-1">
                                        <Users size={11} /> {meal.num_people.toLocaleString()} people
                                    </span>
                                    <span className="admin-chip primary text-xs flex items-center gap-1">
                                        <IndianRupee size={11} /> ₹{fmt(meal.grand_total)}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button onClick={() => openEdit(meal)}
                                        className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(meal.id)}
                                        className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Expanded detail */}
                            {expanded?.id === meal.id && <MealDetailPanel meal={expanded} />}
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {modal && (
                <MealModal
                    initial={modal.item}
                    allDishes={allDishes}
                    onClose={() => setModal(null)}
                    onSave={handleSave}
                    saving={saving}
                    error={saveErr}
                />
            )}
        </div>
    );
};

export default AdminBulkMeals;
