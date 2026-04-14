import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../utils/api.js';
import { CheckCircle2, SendHorizonal, X, ChevronDown, ChevronUp } from 'lucide-react';
import MainNavbar from './MainNavbar';

const DISH_FALLBACK = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&q=60';

// ── helpers ───────────────────────────────────────────────────────────────────
function groupByCategory(dishes) {
    const map = {};
    dishes.forEach((d) => {
        const cat = d.category || 'Other';
        if (!map[cat]) map[cat] = [];
        map[cat].push(d);
    });
    return Object.entries(map).map(([cat, items]) => ({ cat, items }));
}

// ── Quote modal ───────────────────────────────────────────────────────────────
const QuoteModal = ({ selectedDishes, onClose }) => {
    const [form, setForm] = useState({
        name: '',
        phone: '',
        email: '',
        event_date: '',
        guest_count: '',
        notes: '',
    });
    const [saving, setSaving] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState('');

    const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

    const submit = async () => {
        setError('');
        setSaving(true);
        try {
            const res = await fetch(`${API_BASE_URL}/quote_request.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    guest_count: parseInt(form.guest_count, 10) || 0,
                    dishes: selectedDishes.map((d) => ({ id: d.id, name: d.name, category: d.category })),
                }),
            });
            const result = await res.json();
            if (result.success) {
                setDone(true);
            } else {
                setError(result.message || 'Something went wrong.');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {done ? (
                    <div className="p-10 text-center">
                        <div className="w-16 h-16 rounded-full bg-[#154212]/10 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 size={32} className="text-[#154212]" />
                        </div>
                        <h2 className="text-xl font-extrabold text-[#1c1c19] mb-2">Request Submitted!</h2>
                        <p className="text-[#42493e] text-sm mb-6">
                            Thank you! We'll review your dish selection and get back to you with a custom price quote.
                        </p>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-8 py-2.5 rounded-full bg-[#154212] text-white font-bold text-sm"
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between p-5 border-b border-[#f0ede9]">
                            <div>
                                <h2 className="font-extrabold text-[#1c1c19] text-lg">Request a Price Quote</h2>
                                <p className="text-xs text-[#42493e] mt-0.5">{selectedDishes.length} dish{selectedDishes.length !== 1 ? 'es' : ''} selected</p>
                            </div>
                            <button type="button" onClick={onClose} className="p-1.5 rounded-full hover:bg-[#f0ede9] transition">
                                <X size={18} className="text-[#42493e]" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* Selected dishes summary */}
                            <div className="bg-[#f6f3ee] rounded-xl p-3">
                                <p className="text-xs font-semibold text-[#42493e] uppercase tracking-wide mb-2">Selected Dishes</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {selectedDishes.map((d) => (
                                        <span key={d.id} className="text-xs px-2.5 py-1 rounded-full bg-white border border-[#e8e3dd] text-[#1c1c19]">
                                            {d.name}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {error && (
                                <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</p>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold text-[#42493e] mb-1">Full Name *</label>
                                    <input
                                        value={form.name}
                                        onChange={update('name')}
                                        placeholder="Your name"
                                        className="w-full border border-[#e8e3dd] rounded-xl px-3 py-2 text-sm text-[#1c1c19] outline-none focus:border-[#154212] transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-[#42493e] mb-1">Phone *</label>
                                    <input
                                        value={form.phone}
                                        onChange={update('phone')}
                                        type="tel"
                                        placeholder="+91 98765 43210"
                                        className="w-full border border-[#e8e3dd] rounded-xl px-3 py-2 text-sm text-[#1c1c19] outline-none focus:border-[#154212] transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-[#42493e] mb-1">Email</label>
                                    <input
                                        value={form.email}
                                        onChange={update('email')}
                                        type="email"
                                        placeholder="you@email.com"
                                        className="w-full border border-[#e8e3dd] rounded-xl px-3 py-2 text-sm text-[#1c1c19] outline-none focus:border-[#154212] transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-[#42493e] mb-1">Event Date *</label>
                                    <input
                                        value={form.event_date}
                                        onChange={update('event_date')}
                                        type="date"
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full border border-[#e8e3dd] rounded-xl px-3 py-2 text-sm text-[#1c1c19] outline-none focus:border-[#154212] transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-[#42493e] mb-1">Guests *</label>
                                    <input
                                        value={form.guest_count}
                                        onChange={update('guest_count')}
                                        type="number"
                                        min="1"
                                        placeholder="50"
                                        className="w-full border border-[#e8e3dd] rounded-xl px-3 py-2 text-sm text-[#1c1c19] outline-none focus:border-[#154212] transition"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold text-[#42493e] mb-1">Additional Notes</label>
                                    <textarea
                                        value={form.notes}
                                        onChange={update('notes')}
                                        rows={3}
                                        placeholder="Any special requirements, allergies, preferences…"
                                        className="w-full border border-[#e8e3dd] rounded-xl px-3 py-2 text-sm text-[#1c1c19] outline-none focus:border-[#154212] transition resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-5 pt-0">
                            <button
                                type="button"
                                onClick={submit}
                                disabled={saving}
                                className="w-full py-3 rounded-full bg-gradient-to-r from-[#154212] to-[#2d5a27] text-white font-bold flex items-center justify-center gap-2 disabled:opacity-60 transition"
                            >
                                {saving ? (
                                    <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                                ) : (
                                    <SendHorizonal size={16} />
                                )}
                                {saving ? 'Submitting…' : 'Submit Quote Request'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const CustomEventPage = () => {
    const navigate = useNavigate();
    const [dishes, setDishes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState('');
    const [selected, setSelected] = useState(new Set());
    const [collapsed, setCollapsed] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [dietFilter, setDietFilter] = useState('all'); // all | veg | non-veg

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/dishes_public.php`);
                const result = await res.json();
                if (result.success) {
                    setDishes(result.data);
                } else {
                    setFetchError('Could not load dishes.');
                }
            } catch {
                setFetchError('Network error. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const filteredDishes = useMemo(() => {
        if (dietFilter === 'all') return dishes;
        return dishes.filter((d) => d.type === dietFilter);
    }, [dishes, dietFilter]);

    const sections = useMemo(() => groupByCategory(filteredDishes), [filteredDishes]);

    const toggle = (dish) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(dish.id)) next.delete(dish.id);
            else next.add(dish.id);
            return next;
        });
    };

    const toggleCollapse = (cat) =>
        setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));

    const selectedList = useMemo(
        () => dishes.filter((d) => selected.has(d.id)),
        [dishes, selected]
    );

    return (
        <div className="min-h-screen bg-[#fcf9f4] text-[#1c1c19] font-sans">
            <MainNavbar />

            <div className="max-w-5xl mx-auto px-4 pt-36 pb-6">
                {/* Hero */}
                <div className="mb-6">
                    <h1 className="text-2xl font-extrabold text-[#154212] mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        Build Your Custom Menu
                    </h1>
                    <p className="text-[#42493e] text-sm">
                        Select the dishes you want and we'll prepare a personalised price quote for your event.
                    </p>
                </div>

                {/* Diet filter */}
                <div className="flex items-center gap-2 mb-6">
                    {[
                        { value: 'all', label: 'All' },
                        { value: 'veg', label: '🟢 Veg' },
                        { value: 'non-veg', label: '🔴 Non-Veg' },
                    ].map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => setDietFilter(opt.value)}
                            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition ${
                                dietFilter === opt.value
                                    ? 'bg-[#154212] text-white border-[#154212]'
                                    : 'bg-white text-[#42493e] border-[#e8e3dd] hover:border-[#154212]'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {/* Loading / error */}
                {loading && (
                    <div className="text-center py-16 text-[#42493e]">
                        <div className="w-8 h-8 rounded-full border-2 border-[#154212]/20 border-t-[#154212] animate-spin mx-auto mb-3" />
                        Loading dishes…
                    </div>
                )}
                {fetchError && (
                    <div className="text-center py-16 text-red-600">{fetchError}</div>
                )}

                {/* Category sections */}
                {!loading && !fetchError && (
                    <div className="space-y-3 pb-32">
                        {sections.length === 0 ? (
                            <div className="text-center py-16 text-[#42493e]">No dishes available.</div>
                        ) : (
                            sections.map(({ cat, items }, idx) => {
                                const isOpen = !collapsed[cat];
                                const catSelected = items.filter((d) => selected.has(d.id)).length;
                                return (
                                    <div key={cat} className="bg-white rounded-2xl border border-[#f0ede9] overflow-hidden shadow-[0_2px_8px_rgba(28,28,25,0.04)]">
                                        {/* Section header */}
                                        <button
                                            type="button"
                                            onClick={() => toggleCollapse(cat)}
                                            className="w-full flex items-center gap-3 px-4 py-3 bg-[#f9f7f4] hover:bg-[#f4f0eb] transition text-left"
                                        >
                                            <span className="w-6 h-6 rounded-full bg-[#154212]/10 text-[#154212] text-xs font-bold flex items-center justify-center flex-shrink-0">
                                                {idx + 1}
                                            </span>
                                            <span className="flex-1 font-bold text-[#1c1c19] text-sm">{cat}</span>
                                            {catSelected > 0 && (
                                                <span className="text-xs bg-[#154212] text-white rounded-full px-2 py-0.5 font-semibold">
                                                    {catSelected}
                                                </span>
                                            )}
                                            {isOpen ? (
                                                <ChevronUp size={16} className="text-[#42493e]" />
                                            ) : (
                                                <ChevronDown size={16} className="text-[#42493e]" />
                                            )}
                                        </button>

                                        {/* Dish list */}
                                        {isOpen && (
                                            <div className="divide-y divide-[#f0ede9]">
                                                {items.map((dish) => {
                                                    const isSelected = selected.has(dish.id);
                                                    return (
                                                        <button
                                                            key={dish.id}
                                                            type="button"
                                                            onClick={() => toggle(dish)}
                                                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition ${
                                                                isSelected ? 'bg-[#f0f7f0]' : 'hover:bg-[#faf8f5]'
                                                            }`}
                                                        >
                                                            {/* Thumbnail */}
                                                            <img
                                                                src={dish.image || DISH_FALLBACK}
                                                                alt={dish.name}
                                                                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = DISH_FALLBACK; }}
                                                                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                                            />
                                                            {/* Veg dot */}
                                                            <span
                                                                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                                                    dish.type === 'non-veg' ? 'bg-red-500' : 'bg-green-500'
                                                                }`}
                                                            />
                                                            {/* Name + description */}
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-semibold text-[#1c1c19] truncate">{dish.name}</p>
                                                                {dish.description && (
                                                                    <p className="text-xs text-[#42493e] truncate">{dish.description}</p>
                                                                )}
                                                            </div>
                                                            {/* Selection circle */}
                                                            <div
                                                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${
                                                                    isSelected
                                                                        ? 'bg-[#154212] border-[#154212]'
                                                                        : 'border-[#d4cfc9]'
                                                                }`}
                                                            >
                                                                {isSelected && (
                                                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                                                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>

            {/* Floating bar */}
            {selected.size > 0 && (
                <div className="fixed bottom-6 left-0 right-0 z-40 flex justify-center px-4">
                    <div className="bg-[#154212] text-white rounded-full shadow-2xl px-5 py-3 flex items-center gap-4 max-w-lg w-full">
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-white/60 uppercase tracking-wide">SELECTED</p>
                            <p className="text-sm font-semibold truncate">
                                {selected.size} dish{selected.size !== 1 ? 'es' : ''}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 bg-gradient-to-r from-[#904b33] to-[#783922] text-white px-5 py-2 rounded-full font-bold text-sm shadow hover:shadow-lg hover:-translate-y-0.5 transition"
                        >
                            <SendHorizonal size={15} />
                            Request Quote
                        </button>
                    </div>
                </div>
            )}

            {showModal && (
                <QuoteModal
                    selectedDishes={selectedList}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
};

export default CustomEventPage;
