import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Copy, X, Save, ArrowLeft, GripVertical, Tag, ImagePlus, Search } from 'lucide-react';
import { API_BASE_URL } from '../../utils/api.js';

const getCategoryIcon = (name = '') => {
    const n = name.toLowerCase();
    if (n.includes('starter') || n.includes('appetizer')) return '🥗';
    if (n.includes('main') || n.includes('curry') || n.includes('gravy')) return '🍛';
    if (n.includes('bread') || n.includes('base') || n.includes('roti') || n.includes('naan')) return '🫓';
    if (n.includes('rice') || n.includes('biryani') || n.includes('pulao')) return '🍚';
    if (n.includes('drink') || n.includes('beverage') || n.includes('juice') || n.includes('sherbet')) return '🥤';
    if (n.includes('dessert') || n.includes('sweet') || n.includes('ice cream')) return '🍮';
    if (n.includes('snack') || n.includes('fries')) return '🥨';
    if (n.includes('salad') || n.includes('raita')) return '🥙';
    if (n.includes('soup')) return '🍲';
    if (n.includes('dal') || n.includes('lentil')) return '🫘';
    if (n.includes('include')) return '✅';
    return '🍽️';
};

const emptyForm = () => ({
    name: '',
    occasion: 'corporate',
    price: '',
    type: 'veg',
    image: '',
    cuisine: 'Multi-cuisine',
    recommended: false,
    popular: false,
    is_active: true,
});

// ── Drag-and-Drop Meal Plan Builder ─────────────────────────────────────────
const MealPlanBuilder = ({
    editingMeal,
    occasions,
    availableDishes,
    onBack,
    onSaved,
}) => {
    const [formData, setFormData] = useState(() =>
        editingMeal
            ? {
                  name: editingMeal.name,
                  occasion: editingMeal.occasion,
                  price: editingMeal.price,
                  type: editingMeal.type,
                  image: editingMeal.image || '',
                  cuisine: editingMeal.cuisine || 'Multi-cuisine',
                  recommended: editingMeal.recommended,
                  popular: editingMeal.popular,
                  is_active: editingMeal.is_active !== false,
              }
            : emptyForm()
    );

    // Main dish IDs (included in plan)
    const [mainDishIds, setMainDishIds] = useState(() => {
        if (!editingMeal) return new Set();
        const names = new Set();
        const items = Array.isArray(editingMeal.items) ? editingMeal.items : [];
        items.forEach((cat) => {
            if (cat.items) cat.items.forEach((i) => names.add(i.name.toLowerCase()));
        });
        return new Set(
            availableDishes.filter((d) => names.has(d.name.toLowerCase())).map((d) => d.id)
        );
    });

    // Add-ons: [{dishId, name, category, image, pricePerPerson}]
    const [addons, setAddons] = useState(() => {
        if (!editingMeal || !Array.isArray(editingMeal.addons)) return [];
        return editingMeal.addons.map((a) => ({
            dishId: a.id,
            name: a.name,
            category: a.category,
            image: a.image || '',
            pricePerPerson: String(a.pricePerPerson || ''),
        }));
    });

    const [dishSearch, setDishSearch] = useState('');
    const [dragOver, setDragOver] = useState(null); // 'main' | 'addons' | null
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const fileRef = useRef();
    const navigate = useNavigate();

    const token = () => localStorage.getItem('session_token');

    // ── Derived: grouped by category ────────────────────────────────────────
    const filteredDishes = availableDishes.filter(
        (d) =>
            !dishSearch ||
            d.name.toLowerCase().includes(dishSearch.toLowerCase()) ||
            d.category.toLowerCase().includes(dishSearch.toLowerCase())
    );
    const groupedDishes = filteredDishes.reduce((acc, d) => {
        if (!acc[d.category]) acc[d.category] = [];
        acc[d.category].push(d);
        return acc;
    }, {});

    const mainDishes = availableDishes.filter((d) => mainDishIds.has(d.id));
    const mainByCategory = mainDishes.reduce((acc, d) => {
        if (!acc[d.category]) acc[d.category] = [];
        acc[d.category].push(d);
        return acc;
    }, {});

    // ── Drag handlers ────────────────────────────────────────────────────────
    const onDragStart = (e, dish) => {
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('text/plain', JSON.stringify({ id: dish.id, name: dish.name, category: dish.category, image: dish.image || '' }));
    };

    const onDragOver = (e, zone) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        setDragOver(zone);
    };

    const onDragLeave = () => setDragOver(null);

    const onDropMain = (e) => {
        e.preventDefault();
        setDragOver(null);
        try {
            const dish = JSON.parse(e.dataTransfer.getData('text/plain'));
            setMainDishIds((prev) => new Set([...prev, dish.id]));
            // If it was an addon, remove from addons
            setAddons((prev) => prev.filter((a) => a.dishId !== dish.id));
        } catch {}
    };

    const onDropAddons = (e) => {
        e.preventDefault();
        setDragOver(null);
        try {
            const dish = JSON.parse(e.dataTransfer.getData('text/plain'));
            // Remove from main if present
            setMainDishIds((prev) => { const n = new Set(prev); n.delete(dish.id); return n; });
            // Add to addons if not already there
            setAddons((prev) => {
                if (prev.some((a) => a.dishId === dish.id)) return prev;
                return [...prev, { dishId: dish.id, name: dish.name, category: dish.category, image: dish.image || '', pricePerPerson: '' }];
            });
        } catch {}
    };

    const removeMainDish = (id) => setMainDishIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
    const removeAddon = (dishId) => setAddons((prev) => prev.filter((a) => a.dishId !== dishId));
    const updateAddonPrice = (dishId, price) =>
        setAddons((prev) => prev.map((a) => (a.dishId === dishId ? { ...a, pricePerPerson: price } : a)));

    // ── Image upload ─────────────────────────────────────────────────────────
    const handleImageFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setFormData((p) => ({ ...p, image: ev.target.result }));
        reader.readAsDataURL(file);
    };

    // ── Build payload ────────────────────────────────────────────────────────
    const buildCategoryItems = () => {
        const selected = availableDishes.filter((d) => mainDishIds.has(d.id));
        const byCategory = selected.reduce((acc, dish) => {
            if (!acc[dish.category]) acc[dish.category] = [];
            acc[dish.category].push(dish);
            return acc;
        }, {});
        return Object.entries(byCategory).map(([cat, dishes], i) => ({
            id: `cat-${i}`,
            name: cat,
            items: dishes.map((d) => ({ id: `item-${d.id}`, name: d.name, type: formData.type === 'non-veg' ? 'non-veg' : 'veg', image: d.image || '' })),
        }));
    };

    const buildAddonPayload = () =>
        addons.map((a) => ({
            id: a.dishId,
            name: a.name,
            category: a.category,
            image: a.image,
            pricePerPerson: Number(a.pricePerPerson) || 0,
        }));

    // ── Save ─────────────────────────────────────────────────────────────────
    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) { setSaveError('Plan name is required.'); return; }
        if (!formData.price) { setSaveError('Price is required.'); return; }
        setSaving(true);
        setSaveError('');
        try {
            const payload = {
                name: formData.name,
                occasion: formData.occasion,
                price: Number(formData.price),
                type: formData.type,
                items: buildCategoryItems(),
                addons: buildAddonPayload(),
                image: formData.image,
                cuisine: formData.cuisine,
                recommended: formData.recommended,
                popular: formData.popular,
                is_active: formData.is_active !== false,
            };
            if (editingMeal) payload.id = editingMeal.id;

            const res = await fetch(`${API_BASE_URL}/admin/meals.php`, {
                method: editingMeal ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
                body: JSON.stringify(payload),
            });
            if (res.status === 401 || res.status === 403) { navigate('/admin/login'); return; }
            const result = await res.json();
            if (result.success) {
                onSaved();
            } else {
                setSaveError(result.message || 'Save failed.');
            }
        } catch {
            setSaveError('Network error.');
        } finally {
            setSaving(false);
        }
    };

    const addonDishIds = new Set(addons.map((a) => a.dishId));
    const isInPlan = (id) => mainDishIds.has(id) || addonDishIds.has(id);

    return (
        <form onSubmit={handleSave} className="flex flex-col h-full">
            {/* ── Top bar ─────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100 sticky top-0 z-20 shadow-sm">
                <div className="flex items-center gap-3">
                    <button type="button" onClick={onBack}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-semibold">
                        <ArrowLeft size={16} /> Back
                    </button>
                    <div className="w-px h-5 bg-slate-200" />
                    <div>
                        <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Meal Plan Builder</p>
                        <p className="text-base font-extrabold text-slate-900 leading-tight">
                            {editingMeal ? `Editing: ${editingMeal.name}` : 'Create New Meal Plan'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {saveError && <p className="text-sm text-red-600 font-semibold max-w-xs text-right">{saveError}</p>}
                    <button type="button" onClick={onBack}
                        className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={saving}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-sm hover:shadow-lg transition-all disabled:opacity-60">
                        <Save size={15} />
                        {saving ? 'Saving…' : (editingMeal ? 'Update Plan' : 'Save Plan')}
                    </button>
                </div>
            </div>

            {/* ── Two-column layout ───────────────────────────────────────── */}
            <div className="flex flex-1 overflow-hidden">

                {/* ── LEFT: Dish Palette ─────────────────────────────────── */}
                <aside className="w-80 shrink-0 border-r border-slate-100 bg-slate-50 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-white">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Dish Catalogue</p>
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={dishSearch}
                                onChange={(e) => setDishSearch(e.target.value)}
                                placeholder="Search dishes…"
                                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                            />
                        </div>
                        <p className="text-xs text-slate-400 mt-2">Drag dishes to the plan or add-ons zone →</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {Object.entries(groupedDishes).length === 0 && (
                            <div className="text-center py-8 text-slate-400 text-sm">
                                <p className="font-semibold">No dishes found</p>
                                <p>Add dishes in the Dish Catalogue first</p>
                            </div>
                        )}
                        {Object.entries(groupedDishes).map(([category, dishes]) => (
                            <div key={category} className="rounded-xl bg-white border border-slate-100 overflow-hidden">
                                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border-b border-slate-100">
                                    <span className="text-sm leading-none">{getCategoryIcon(category)}</span>
                                    <span className="text-xs font-bold text-slate-700 flex-1">{category}</span>
                                    <span className="text-xs text-slate-400 tabular-nums">
                                        {dishes.filter((d) => isInPlan(d.id)).length}/{dishes.length}
                                    </span>
                                </div>
                                <div className="p-2 space-y-1">
                                    {dishes.map((dish) => {
                                        const inMain = mainDishIds.has(dish.id);
                                        const inAddon = addonDishIds.has(dish.id);
                                        return (
                                            <div
                                                key={dish.id}
                                                draggable
                                                onDragStart={(e) => onDragStart(e, dish)}
                                                className={`flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-grab active:cursor-grabbing transition-all text-sm group
                                                    ${inMain ? 'bg-emerald-50 border border-emerald-200' : inAddon ? 'bg-amber-50 border border-amber-200' : 'bg-slate-50 border border-transparent hover:border-slate-200 hover:bg-white'}`}
                                            >
                                                <GripVertical size={13} className="text-slate-300 group-hover:text-slate-400 shrink-0" />
                                                {dish.image ? (
                                                    <img src={dish.image} alt={dish.name} className="w-7 h-7 rounded-md object-cover shrink-0" />
                                                ) : (
                                                    <div className="w-7 h-7 rounded-md bg-slate-200 flex items-center justify-center text-xs shrink-0">🍽️</div>
                                                )}
                                                <span className="flex-1 font-medium text-slate-700 truncate">{dish.name}</span>
                                                {inMain && <span className="text-xs text-emerald-600 font-bold shrink-0">✓</span>}
                                                {inAddon && <span className="text-xs text-amber-600 font-bold shrink-0">+</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* ── RIGHT: Plan Form + Drop Zones ────────────────────────── */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-3xl mx-auto p-6 space-y-8">

                        {/* ── Plan Details ──────────────────────────────────── */}
                        <div className="glass-card p-5 space-y-5">
                            <p className="text-sm font-extrabold text-slate-700 uppercase tracking-widest">Plan Details</p>

                            {/* Name */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Plan Name *</label>
                                <input required type="text" value={formData.name}
                                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 font-semibold"
                                    placeholder="e.g., Premium Corporate Lunch" />
                            </div>

                            {/* Occasion + Price */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Occasion *</label>
                                    <select required value={formData.occasion}
                                        onChange={(e) => setFormData((p) => ({ ...p, occasion: e.target.value }))}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400">
                                        {occasions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Base Price / Person (₹) *</label>
                                    <input required type="number" min="0" value={formData.price}
                                        onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 font-semibold"
                                        placeholder="299" />
                                </div>
                            </div>

                            {/* Meal Type */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Meal Type *</label>
                                <div className="flex gap-4">
                                    {[{ v: 'veg', label: '🟢 Vegetarian' }, { v: 'non-veg', label: '🔴 Non-Vegetarian' }].map(({ v, label }) => (
                                        <label key={v} className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="type" value={v}
                                                checked={formData.type === v}
                                                onChange={() => setFormData((p) => ({ ...p, type: v }))}
                                                className="w-4 h-4 text-green-500" />
                                            <span className="text-sm font-semibold text-slate-700">{label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Cuisine */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Cuisine</label>
                                <input type="text" value={formData.cuisine}
                                    onChange={(e) => setFormData((p) => ({ ...p, cuisine: e.target.value }))}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                    placeholder="Multi-cuisine" />
                            </div>

                            {/* Image */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Plan Cover Image</label>
                                {formData.image ? (
                                    <div className="relative w-full h-40 rounded-xl overflow-hidden border border-slate-200 mb-2">
                                        <img src={formData.image} alt="Plan" className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => setFormData((p) => ({ ...p, image: '' }))}
                                            className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <button type="button" onClick={() => fileRef.current?.click()}
                                        className="w-full h-24 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:border-emerald-400 hover:text-emerald-500 transition-colors">
                                        <ImagePlus size={22} />
                                        <span className="text-xs font-medium">Upload cover image</span>
                                    </button>
                                )}
                                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
                                <input type="text" value={formData.image?.startsWith('data:') ? '' : (formData.image || '')}
                                    onChange={(e) => setFormData((p) => ({ ...p, image: e.target.value }))}
                                    className="mt-2 w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm"
                                    placeholder="Or paste image URL" />
                            </div>

                            {/* Flags */}
                            <div className="flex gap-4">
                                {[
                                    { key: 'is_active', label: '✅ Published (visible on site)' },
                                    { key: 'recommended', label: '⭐ Recommended' },
                                    { key: 'popular', label: '🔥 Popular' },
                                ].map(({ key, label }) => (
                                    <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                                        <div onClick={() => setFormData((p) => ({ ...p, [key]: !p[key] }))}
                                            className={`w-9 h-5 rounded-full transition-colors flex items-center ${formData[key] ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                            <div className={`w-4 h-4 bg-white rounded-full shadow mx-0.5 transition-transform ${formData[key] ? 'translate-x-4' : 'translate-x-0'}`} />
                                        </div>
                                        <span className="text-sm font-semibold text-slate-700">{label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* ── Menu Dishes Drop Zone ─────────────────────────── */}
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm font-extrabold text-slate-900">Menu Dishes (Included)</p>
                                <p className="text-xs text-slate-500 mt-0.5">Drag dishes from the left panel here. These are included in the base price.</p>
                            </div>

                            <div
                                onDragOver={(e) => onDragOver(e, 'main')}
                                onDragLeave={onDragLeave}
                                onDrop={onDropMain}
                                className={`min-h-[120px] rounded-2xl border-2 border-dashed transition-all p-4 ${
                                    dragOver === 'main'
                                        ? 'border-emerald-400 bg-emerald-50'
                                        : mainDishes.length
                                        ? 'border-slate-200 bg-white'
                                        : 'border-slate-200 bg-slate-50'
                                }`}
                            >
                                {mainDishes.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-20 text-slate-400 gap-2">
                                        <GripVertical size={20} />
                                        <p className="text-sm font-medium">Drop dishes here</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {Object.entries(mainByCategory).map(([cat, dishes]) => (
                                            <div key={cat}>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-sm">{getCategoryIcon(cat)}</span>
                                                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">{cat}</span>
                                                    <span className="text-xs text-slate-400">({dishes.length})</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {dishes.map((dish) => (
                                                        <div key={dish.id}
                                                            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800 font-semibold">
                                                            {dish.image && <img src={dish.image} alt={dish.name} className="w-5 h-5 rounded object-cover" />}
                                                            {dish.name}
                                                            <button type="button" onClick={() => removeMainDish(dish.id)}
                                                                className="w-4 h-4 rounded-full bg-emerald-200 hover:bg-red-200 hover:text-red-700 flex items-center justify-center transition-colors ml-1">
                                                                <X size={10} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Add-ons Drop Zone ────────────────────────────── */}
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm font-extrabold text-slate-900">Add-ons (Optional Upgrades)</p>
                                <p className="text-xs text-slate-500 mt-0.5">Drag dishes here and set an extra price per person. Customers can swap them in for an added charge.</p>
                            </div>

                            <div
                                onDragOver={(e) => onDragOver(e, 'addons')}
                                onDragLeave={onDragLeave}
                                onDrop={onDropAddons}
                                className={`min-h-[120px] rounded-2xl border-2 border-dashed transition-all p-4 ${
                                    dragOver === 'addons'
                                        ? 'border-amber-400 bg-amber-50'
                                        : addons.length
                                        ? 'border-slate-200 bg-white'
                                        : 'border-slate-200 bg-slate-50'
                                }`}
                            >
                                {addons.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-20 text-slate-400 gap-2">
                                        <Tag size={20} />
                                        <p className="text-sm font-medium">Drop add-on dishes here</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {addons.map((addon) => (
                                            <div key={addon.dishId}
                                                className="flex items-center gap-3 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                                                {addon.image && <img src={addon.image} alt={addon.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-slate-800 truncate">{addon.name}</p>
                                                    <p className="text-xs text-slate-500">{addon.category}</p>
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <span className="text-xs font-semibold text-slate-500">+₹</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={addon.pricePerPerson}
                                                        onChange={(e) => updateAddonPrice(addon.dishId, e.target.value)}
                                                        className="w-20 px-2 py-1.5 bg-white border border-amber-200 rounded-lg text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-amber-400"
                                                        placeholder="0"
                                                    />
                                                    <span className="text-xs text-slate-400">/guest</span>
                                                </div>
                                                <button type="button" onClick={() => removeAddon(addon.dishId)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Save summary ────────────────────────────────── */}
                        <div className="glass-card p-4 flex items-center justify-between">
                            <div className="text-sm text-slate-600">
                                <span className="font-bold text-slate-900">{mainDishIds.size}</span> main dishes &nbsp;·&nbsp;
                                <span className="font-bold text-slate-900">{addons.length}</span> add-ons
                            </div>
                            <button type="submit" disabled={saving}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-sm hover:shadow-lg transition-all disabled:opacity-60">
                                <Save size={15} />
                                {saving ? 'Saving…' : (editingMeal ? 'Update Plan' : 'Save Plan')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
};

// ── Main AdminMealPlans ───────────────────────────────────────────────────────
const AdminMealPlans = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [occasionFilter, setOccasionFilter] = useState('all');
    const [meals, setMeals] = useState([]);
    const [availableDishes, setAvailableDishes] = useState([]);

    // Base occasions always match frontend OccasionSelectionPage keys
    const BASE_OCCASIONS = [
        { value: 'wedding',    label: 'Wedding Celebration' },
        { value: 'corporate',  label: 'Corporate Event' },
        { value: 'birthday',   label: 'Birthday Party' },
        { value: 'pooja',      label: 'Pooja / Religious' },
        { value: 'houseParty', label: 'House Party' },
        { value: 'other',      label: 'Custom Event' },
    ];

    const [occasions, setOccasions] = useState(BASE_OCCASIONS);
    const [error, setError] = useState('');
    const [creatingOccasion, setCreatingOccasion] = useState(false);
    const [newOccasion, setNewOccasion] = useState({ name: '', description: '' });

    // Builder mode: false = list view, 'add' = add, meal object = edit
    const [builderMode, setBuilderMode] = useState(false);

    const token = () => localStorage.getItem('session_token');

    useEffect(() => {
        fetchMeals();
        fetchOccasions();
        fetchAvailableDishes();
    }, []);

    // Slugify: mirrors the logic in OccasionSelectionPage
    const slugify = (v) =>
        (v || '').toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    // normalizeOcc for filtering: strips separators + lowercases
    const normalizeOcc = (v) => (v || '').toLowerCase().replace(/[\s\-_]+/g, '');

    const fetchOccasions = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/occasions.php`, {
                headers: { Authorization: `Bearer ${token()}` },
            });
            if (res.status === 401 || res.status === 403) { navigate('/admin/login'); return; }
            const result = await res.json();
            if (result.success) {
                // Convert API occasions → slug values (matches OccasionSelectionPage keys)
                const apiOccs = (result.data || []).map((o) => ({
                    value: slugify(o.name),
                    label: o.name,
                }));
                // Merge: keep all base occasions, then append API-only ones
                const merged = [...BASE_OCCASIONS];
                apiOccs.forEach((occ) => {
                    if (!merged.some((b) => normalizeOcc(b.value) === normalizeOcc(occ.value))) {
                        merged.push(occ);
                    }
                });
                setOccasions(merged);
            }
        } catch {}
    };

    const fetchMeals = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/meals.php`, {
                headers: { Authorization: `Bearer ${token()}` },
            });
            if (res.status === 401 || res.status === 403) { setLoading(false); navigate('/admin/login'); return; }
            const result = await res.json();
            if (result.success) { setMeals(result.data); setError(''); }
            else setError(result.message || 'Failed to load meal plans');
        } catch {
            setError('Unable to load meal plans.');
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableDishes = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/dishes.php`, {
                headers: { Authorization: `Bearer ${token()}` },
            });
            if (!res.ok) return;
            const result = await res.json();
            if (result.success) setAvailableDishes(result.data.filter((d) => d.is_active));
        } catch {}
    };

    const deleteMeal = async (id) => {
        if (!window.confirm('Delete this meal plan?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/admin/meals.php`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
                body: JSON.stringify({ id }),
            });
            if (res.status === 401 || res.status === 403) { navigate('/admin/login'); return; }
            const result = await res.json();
            if (result.success) fetchMeals();
        } catch {}
    };

    const duplicateMeal = async (meal) => {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/meals.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
                body: JSON.stringify({
                    name: `${meal.name} (Copy)`,
                    occasion: meal.occasion,
                    price: meal.price,
                    type: meal.type,
                    items: meal.items,
                    addons: meal.addons || [],
                    image: meal.image,
                    cuisine: meal.cuisine,
                    recommended: meal.recommended,
                    popular: meal.popular,
                }),
            });
            if (res.status === 401 || res.status === 403) { navigate('/admin/login'); return; }
            const result = await res.json();
            if (result.success) fetchMeals();
        } catch {}
    };

    const toggleFlag = async (meal, flag) => {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/meals.php`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
                body: JSON.stringify({ ...meal, image: meal.image || '', addons: meal.addons || [], [flag]: !meal[flag] }),
            });
            if (res.status === 401 || res.status === 403) { navigate('/admin/login'); return; }
            const result = await res.json();
            if (result.success) fetchMeals();
        } catch {}
    };

    const getPriceTier = (price) => {
        const p = Number(price) || 0;
        if (p < 200) return 'Budget';
        if (p < 350) return 'Classic';
        if (p < 500) return 'Premium';
        return 'Luxury';
    };

    const deriveMealItems = (meal) => {
        if (!Array.isArray(meal.items)) return typeof meal.items === 'string' ? meal.items.split(',').map((s) => s.trim()).filter(Boolean) : [];
        if (meal.items.length && meal.items[0]?.items) return meal.items.flatMap((cat) => (cat.items || []).map((i) => i.name).filter(Boolean));
        return meal.items;
    };

    const filteredMeals = meals.filter((m) =>
        occasionFilter === 'all' || normalizeOcc(m.occasion) === normalizeOcc(occasionFilter)
    );
    const occasionOptions = [{ value: 'all', label: 'All Occasions' }, ...occasions];

    // ── If builder mode is on, render full-page builder ──────────────────────
    if (builderMode !== false) {
        return (
            <div className="fixed inset-0 z-40 bg-slate-50 flex flex-col" style={{ top: 0, left: 0, right: 0, bottom: 0 }}>
                <MealPlanBuilder
                    editingMeal={builderMode === 'add' ? null : builderMode}
                    occasions={occasions}
                    availableDishes={availableDishes}
                    onBack={() => setBuilderMode(false)}
                    onSaved={() => { setBuilderMode(false); fetchMeals(); }}
                />
            </div>
        );
    }

    // ── List view ────────────────────────────────────────────────────────────
    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Meal Plans</p>
                    <h1 className="text-2xl font-extrabold text-slate-900">Manage Meal Plans</h1>
                    <p className="text-sm text-slate-500">{filteredMeals.length} of {meals.length} plans</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setCreatingOccasion(true)} className="admin-chip">+ Add Occasion</button>
                    <button onClick={() => setBuilderMode('add')} className="admin-chip primary flex items-center gap-1.5">
                        <Plus size={16} /> Add New Meal Plan
                    </button>
                </div>
            </div>

            {error && <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm">{error}</div>}

            {/* Create occasion inline form */}
            {creatingOccasion && (
                <div className="glass-card p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-slate-900">Create Occasion</p>
                            <p className="text-xs text-slate-500">Add a new occasion to map meal plans.</p>
                        </div>
                        <button onClick={() => setCreatingOccasion(false)} className="text-sm text-slate-500 hover:text-slate-900">Cancel</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input type="text" value={newOccasion.name}
                            onChange={(e) => setNewOccasion({ ...newOccasion, name: e.target.value })}
                            className="soft-input" placeholder="Occasion name" />
                        <input type="text" value={newOccasion.description}
                            onChange={(e) => setNewOccasion({ ...newOccasion, description: e.target.value })}
                            className="soft-input" placeholder="Short description (optional)" />
                    </div>
                    <button type="button"
                        onClick={async () => {
                            if (!newOccasion.name.trim()) return;
                            try {
                                const res = await fetch(`${API_BASE_URL}/admin/occasions.php`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
                                    body: JSON.stringify({ name: newOccasion.name.trim(), description: newOccasion.description }),
                                });
                                if (res.status === 401 || res.status === 403) { navigate('/admin/login'); return; }
                                const result = await res.json();
                                if (result.success) {
                                    setNewOccasion({ name: '', description: '' });
                                    setCreatingOccasion(false);
                                    fetchOccasions();
                                }
                            } catch {}
                        }}
                        className="admin-chip primary">
                        Save Occasion
                    </button>
                </div>
            )}

            {/* Occasion filters */}
            <div className="glass-card p-4 flex flex-wrap gap-2 items-center">
                {occasionOptions.map((option) => (
                    <button key={option.value} type="button"
                        onClick={() => setOccasionFilter(option.value)}
                        className={`admin-chip ${occasionFilter === option.value ? 'primary' : ''}`}>
                        {option.label}
                    </button>
                ))}
            </div>

            {/* Meal plan cards */}
            {loading ? (
                <div className="glass-card p-6 text-slate-600">Loading meal plans...</div>
            ) : (
                <div className="card-grid">
                    <button onClick={() => setBuilderMode('add')}
                        className="glass-card border-dashed border-2 border-slate-200 p-5 flex flex-col items-center justify-center text-slate-500 hover:text-emerald-600 hover:border-emerald-300 min-h-[200px]">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                            <Plus size={20} />
                        </div>
                        <p className="font-semibold">Create New Plan</p>
                        <p className="text-xs">Drag-and-drop builder</p>
                    </button>

                    {filteredMeals.length === 0 && (
                        <div className="glass-card p-6 text-slate-600">No meal plans for this occasion.</div>
                    )}

                    {filteredMeals.map((meal) => {
                        const mealItems = deriveMealItems(meal);
                        const isActive = meal.is_active !== false;
                        return (
                            <div key={meal.id} className={`glass-card overflow-hidden flex flex-col transition-opacity ${isActive ? '' : 'opacity-50'}`}>
                                <div className="relative h-40 overflow-hidden bg-slate-100">
                                    {meal.image && <img src={meal.image} alt={meal.name} className="w-full h-full object-cover" />}
                                    <div className="absolute top-3 left-3 admin-pill">{meal.type === 'veg' ? 'VEG' : 'NON-VEG'}</div>
                                    {!isActive && (
                                        <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-slate-700 text-white text-xs font-bold">Draft</span>
                                    )}
                                    {isActive && meal.recommended && <span className="absolute top-3 right-3 admin-chip primary text-xs">Recommended</span>}
                                    {isActive && meal.popular && <span className="absolute top-12 right-3 admin-chip text-xs">Popular</span>}
                                    {Array.isArray(meal.addons) && meal.addons.length > 0 && (
                                        <span className="absolute bottom-3 left-3 admin-chip text-xs flex items-center gap-1">
                                            <Tag size={11} /> {meal.addons.length} add-on{meal.addons.length > 1 ? 's' : ''}
                                        </span>
                                    )}
                                </div>

                                <div className="p-4 flex-1 flex flex-col gap-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="text-sm text-slate-500 capitalize">{meal.occasion}</p>
                                            <h3 className="text-lg font-bold text-slate-900">{meal.name}</h3>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-extrabold text-slate-900">₹{meal.price}</p>
                                            <p className="text-xs text-slate-500">per person</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 text-xs">
                                        <span className="admin-chip">{meal.cuisine || 'Multi-cuisine'}</span>
                                        <span className="admin-chip">{getPriceTier(meal.price)}</span>
                                    </div>

                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 mb-1">Includes</p>
                                        <div className="flex flex-wrap gap-1">
                                            {mealItems.slice(0, 4).map((item, idx) => (
                                                <span key={idx} className="px-2 py-1 bg-slate-100 text-xs rounded-lg text-slate-700">{item}</span>
                                            ))}
                                            {mealItems.length > 4 && (
                                                <span className="px-2 py-1 bg-slate-100 text-xs rounded-lg text-slate-700">+{mealItems.length - 4} more</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 mt-auto">
                                        <button onClick={() => setBuilderMode(meal)} className="soft-input text-center font-semibold text-slate-700 text-sm py-2">Edit</button>
                                        <button onClick={() => duplicateMeal(meal)} className="soft-input text-center font-semibold text-slate-700 text-sm py-2">Copy</button>
                                        <button onClick={() => deleteMeal(meal.id)} className="soft-input text-center font-semibold text-red-600 text-sm py-2">Delete</button>
                                    </div>

                                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                                        <button onClick={() => toggleFlag(meal, 'is_active')}
                                            className={`admin-chip flex-1 justify-center font-bold ${isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-slate-100 text-slate-500'}`}>
                                            {isActive ? '✅ Published' : '⬜ Draft — click to publish'}
                                        </button>
                                        <button onClick={() => toggleFlag(meal, 'recommended')}
                                            className={`admin-chip ${meal.recommended ? 'primary' : ''} flex-shrink-0`}>
                                            ⭐
                                        </button>
                                        <button onClick={() => toggleFlag(meal, 'popular')}
                                            className={`admin-chip ${meal.popular ? 'primary' : ''} flex-shrink-0`}>
                                            🔥
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AdminMealPlans;
