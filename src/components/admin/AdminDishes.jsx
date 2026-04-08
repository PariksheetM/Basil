import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, X, Save, Search, ChevronDown, ChevronUp, Package, ImagePlus } from 'lucide-react';
import { API_BASE_URL } from '../../utils/api.js';

const PRESET_CATEGORIES = [
    'Dal & Lentils', 'Rice & Biryani', 'Breads', 'Vegetables',
    'Paneer & Dairy', 'Non-Veg', 'Desserts', 'Beverages', 'Salads', 'Snacks', 'Other',
];

const empty = () => ({
    name: '', category: '', description: '', is_active: true, image: '', type: 'veg',
});

// ── Modal for create / edit ──────────────────────────────────────────────────
const DishModal = ({ initial, categories, onClose, onSave, saving, error }) => {
    const [form, setForm] = useState(initial ?? empty());
    const [customCategory, setCustomCategory] = useState('');
    const [showCustom, setShowCustom] = useState(false);
    const fileRef = useRef();

    // Merge preset + saved categories (no duplicates)
    const allCategories = [
        ...PRESET_CATEGORIES,
        ...(categories || []).filter(c => !PRESET_CATEGORIES.includes(c)),
    ];

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleCategory = (v) => {
        if (v === '__custom__') { setShowCustom(true); return; }
        setShowCustom(false);
        set('category', v);
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => set('image', ev.target.result);
        reader.readAsDataURL(file);
    };

    const submit = (e) => {
        e.preventDefault();
        const cat = showCustom ? customCategory.trim() : form.category;
        onSave({ ...form, category: cat });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-5 flex items-center justify-between text-white rounded-t-3xl">
                    <div>
                        <h2 className="text-xl font-bold">{initial ? 'Edit Dish' : 'Add New Dish'}</h2>
                        <p className="text-sm text-emerald-100 mt-0.5">Add dishes to your catalogue for use in meal plans</p>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={submit} className="p-6 space-y-5">
                    {error && (
                        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
                    )}

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Dish Name *</label>
                        <input required value={form.name} onChange={e => set('name', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
                            placeholder="e.g., Dal Tadka" />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Category *</label>
                        <select
                            value={showCustom ? '__custom__' : (form.category || '')}
                            onChange={e => handleCategory(e.target.value)}
                            required={!showCustom}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        >
                            <option value="" disabled>Select category</option>
                            {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                            <option value="__custom__">+ Custom category</option>
                        </select>
                        {showCustom && (
                            <input value={customCategory} onChange={e => setCustomCategory(e.target.value)}
                                required className="mt-2 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                placeholder="Enter custom category" />
                        )}
                    </div>

                    {/* Veg / Non-Veg */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Dish Type *</label>
                        <div className="flex gap-4">
                            {[{ v: 'veg', label: '🟢 Vegetarian' }, { v: 'non-veg', label: '🔴 Non-Vegetarian' }].map(({ v, label }) => (
                                <label key={v} className="flex items-center gap-2 cursor-pointer select-none">
                                    <input type="radio" name="dish_type" value={v}
                                        checked={form.type === v}
                                        onChange={() => set('type', v)}
                                        className="w-4 h-4" />
                                    <span className="text-sm font-semibold text-gray-700">{label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Description</label>
                        <textarea rows={2} value={form.description} onChange={e => set('description', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
                            placeholder="Optional notes about this dish" />
                    </div>

                    {/* Image upload */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Dish Image</label>
                        {form.image ? (
                            <div className="relative w-full h-36 rounded-xl overflow-hidden border border-gray-200 mb-2">
                                <img src={form.image} alt="Dish preview" className="w-full h-full object-cover" />
                                <button type="button" onClick={() => set('image', '')}
                                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <button type="button" onClick={() => fileRef.current?.click()}
                                className="w-full h-28 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-emerald-400 hover:text-emerald-500 transition-colors">
                                <ImagePlus size={24} />
                                <span className="text-sm font-medium">Upload dish image</span>
                                <span className="text-xs">JPG, PNG, WEBP</span>
                            </button>
                        )}
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        <input type="text" value={form.image?.startsWith('data:') ? '' : (form.image || '')}
                            onChange={e => set('image', e.target.value)}
                            className="mt-2 w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm"
                            placeholder="Or paste image URL" />
                    </div>

                    {/* Active toggle */}
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                        <div
                            onClick={() => set('is_active', !form.is_active)}
                            className={`w-10 h-5 rounded-full transition-colors flex items-center ${form.is_active ? 'bg-emerald-500' : 'bg-gray-300'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full shadow mx-0.5 transition-transform ${form.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">Active</span>
                    </label>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 px-4 py-3 bg-gray-100 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                            <Save size={16} />
                            {saving ? 'Saving…' : 'Save Dish'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ── Main component ───────────────────────────────────────────────────────────
const AdminDishes = () => {
    const navigate  = useNavigate();
    const [dishes,   setDishes]   = useState([]);
    const [cats,     setCats]     = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [error,    setError]    = useState('');
    const [modal,    setModal]    = useState(null);   // null | { mode: 'add'|'edit', item }
    const [saving,   setSaving]   = useState(false);
    const [saveErr,  setSaveErr]  = useState('');
    const [search,   setSearch]   = useState('');
    const [catFilter, setCatFilter] = useState('');
    const [sortField, setSortField] = useState('name');
    const [sortAsc,   setSortAsc]   = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    const token = () => localStorage.getItem('session_token');

    const authHeaders = () => ({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token()}`,
    });

    const redirect401 = (status) => {
        if (status === 401 || status === 403) { navigate('/admin/login'); return true; }
        return false;
    };

    const fetchDishes = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/dishes.php`, { headers: authHeaders() });
            if (redirect401(res.status)) return;
            const json = await res.json();
            if (json.success) { setDishes(json.data); setCats(json.categories || []); setError(''); }
            else setError(json.message);
        } catch { setError('Failed to load dishes.'); }
        finally { setLoading(false); }
    }, []); // eslint-disable-line

    useEffect(() => { fetchDishes(); }, [fetchDishes]);

    const handleSave = async (formData) => {
        setSaving(true); setSaveErr('');
        try {
            const isEdit = modal.mode === 'edit';
            const body   = isEdit ? { ...formData, id: modal.item.id } : formData;
            const res    = await fetch(`${API_BASE_URL}/admin/dishes.php`, {
                method: isEdit ? 'PUT' : 'POST',
                headers: authHeaders(),
                body: JSON.stringify(body),
            });
            if (redirect401(res.status)) return;
            const json = await res.json();
            if (json.success) { setModal(null); fetchDishes(); }
            else setSaveErr(json.message || 'Save failed.');
        } catch { setSaveErr('Network error.'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this dish? This cannot be undone.')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/admin/dishes.php`, {
                method: 'DELETE', headers: authHeaders(), body: JSON.stringify({ id }),
            });
            if (redirect401(res.status)) return;
            const json = await res.json();
            if (json.success) fetchDishes();
            else alert(json.message);
        } catch { alert('Delete failed.'); }
    };

    // ── Derived filtered/sorted list ─────────────────────────────────────────
    const visible = dishes
        .filter(d => {
            const q = search.toLowerCase();
            return (!search || d.name.toLowerCase().includes(q) || d.category.toLowerCase().includes(q))
                && (!catFilter || d.category === catFilter);
        })
        .sort((a, b) => {
            const av = a[sortField]; const bv = b[sortField];
            if (typeof av === 'string') return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
            return sortAsc ? av - bv : bv - av;
        });

    const toggleSort = (field) => {
        if (sortField === field) setSortAsc(p => !p); else { setSortField(field); setSortAsc(true); }
    };

    const SortIcon = ({ field }) => (
        <span className="ml-1 opacity-50">
            {sortField === field ? (sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : <ChevronDown size={12} />}
        </span>
    );

    // ── Summary stats ─────────────────────────────────────────────────────────
    const totalDishes = dishes.length;
    const activeDishes = dishes.filter(d => d.is_active).length;

    return (
        <div className="space-y-5">
            {/* Page title */}
            <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Dish Management</p>
                    <h1 className="text-2xl font-extrabold text-slate-900">Dish Catalogue</h1>
                    <p className="text-sm text-slate-500">{activeDishes} active of {totalDishes} dishes</p>
                </div>
                <button onClick={() => { setModal({ mode: 'add', item: null }); setSaveErr(''); }}
                    className="admin-chip primary flex items-center gap-1.5">
                    <Plus size={16} /> Add Dish
                </button>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                    { label: 'Total Dishes', value: totalDishes,  color: 'text-slate-900' },
                    { label: 'Active',       value: activeDishes, color: 'text-emerald-700' },
                    { label: 'Categories',   value: cats.length,  color: 'text-teal-700' },
                ].map(c => (
                    <div key={c.label} className="glass-card p-4">
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">{c.label}</p>
                        <p className={`text-2xl font-extrabold mt-1 ${c.color}`}>{c.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="glass-card p-4 flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        placeholder="Search dishes…" />
                </div>
                <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                    <option value="">All Categories</option>
                    {cats.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            {/* Error */}
            {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}

            {/* Table */}
            {loading ? (
                <div className="glass-card p-8 text-center text-slate-500">Loading dishes…</div>
            ) : visible.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <Package size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-semibold">No dishes found</p>
                    <p className="text-slate-400 text-sm mt-1">Add your first dish to get started</p>
                </div>
            ) : (
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50">
                                    {[
                                        { label: 'Dish', field: 'name' },
                                        { label: 'Category',  field: 'category' },
                                        { label: 'Type',      field: 'type' },
                                        { label: 'Status',    field: 'is_active' },
                                    ].map(h => (
                                        <th key={h.field} onClick={() => toggleSort(h.field)}
                                            className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-slate-800 select-none whitespace-nowrap">
                                            <span className="flex items-center">{h.label}<SortIcon field={h.field} /></span>
                                        </th>
                                    ))}
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visible.map(d => (
                                    <React.Fragment key={d.id}>
                                        <tr className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors">
                                            <td className="px-4 py-3 font-semibold text-slate-900">
                                                <div className="flex items-center gap-3">
                                                    {d.image ? (
                                                        <img src={d.image} alt={d.name} className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-100" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-slate-400 text-base">🍽️</div>
                                                    )}
                                                    <button className="flex items-center gap-1.5 text-left hover:text-emerald-700 transition-colors"
                                                        onClick={() => setExpandedId(expandedId === d.id ? null : d.id)}>
                                                        {d.name}
                                                        {expandedId === d.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="admin-chip text-xs py-1 px-2">{d.category}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`admin-chip text-xs py-1 px-2 ${d.type === 'non-veg' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
                                                    {d.type === 'non-veg' ? '🔴 Non-Veg' : '🟢 Veg'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`admin-chip text-xs py-1 px-2 ${d.is_active ? 'primary' : 'opacity-50'}`}>
                                                    {d.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => { setModal({ mode: 'edit', item: d }); setSaveErr(''); }}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
                                                        <Edit2 size={15} />
                                                    </button>
                                                    <button onClick={() => handleDelete(d.id)}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedId === d.id && (
                                            <tr className="bg-emerald-50/50">
                                                <td colSpan={4} className="px-6 py-3 text-sm">
                                                    <span className="text-slate-500 font-semibold">Description: </span>
                                                    <span className="text-slate-700">{d.description || '—'}</span>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            {modal && (
                <DishModal
                    initial={modal.item ? { ...modal.item } : null}
                    categories={cats}
                    onClose={() => setModal(null)}
                    onSave={handleSave}
                    saving={saving}
                    error={saveErr}
                />
            )}
        </div>
    );
};

export default AdminDishes;
