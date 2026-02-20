import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, RefreshCw, Utensils, ArrowRight, Plus } from 'lucide-react';

const occasionLabels = {
    corporate: 'Corporate Event',
    wedding: 'Wedding',
    birthday: 'Birthday Party',
    houseParty: 'House Party',
    pooja: 'Pooja / Religious',
    other: 'Custom'
};

const AdminOccasions = () => {
    const navigate = useNavigate();
    const [meals, setMeals] = useState([]);
    const [occasions, setOccasions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newOccasion, setNewOccasion] = useState({ name: '', description: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchOccasionMenus();
        fetchOccasionList();
    }, []);

    const fetchOccasionList = async () => {
        try {
            const token = localStorage.getItem('session_token');
            if (!token) { setLoading(false); navigate('/admin/login'); return; }
            const response = await fetch('http://localhost:8000/api/admin/occasions.php', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.status === 401 || response.status === 403) { setLoading(false); navigate('/admin/login'); return; }
            const result = await response.json();
            if (result.success) {
                setOccasions(result.data || []);
            }
        } catch (err) {
            console.error('Error loading occasions:', err);
        }
    };

    const fetchOccasionMenus = async () => {
        try {
            const token = localStorage.getItem('session_token');
            if (!token) {
                setLoading(false);
                navigate('/');
                return;
            }

            const response = await fetch('http://localhost:8000/api/admin/meals.php', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 401 || response.status === 403) {
                setLoading(false);
                navigate('/');
                return;
            }

            const result = await response.json();
            if (result.success) {
                setMeals(result.data || []);
                setError('');
            } else {
                setError(result.message || 'Failed to load occasion menus');
            }
        } catch (err) {
            console.error('Error loading occasion menus:', err);
            setError('Unable to load occasion menus. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const grouped = useMemo(() => {
        return meals.reduce((acc, meal) => {
            const key = meal.occasion || 'other';
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(meal);
            return acc;
        }, {});
    }, [meals]);

    const handleCreateOccasion = async () => {
        if (!newOccasion.name.trim()) return;
        try {
            setSaving(true);
            const token = localStorage.getItem('session_token');
            if (!token) { navigate('/admin/login'); return; }
            const response = await fetch('http://localhost:8000/api/admin/occasions.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ name: newOccasion.name.trim(), description: newOccasion.description })
            });
            if (response.status === 401 || response.status === 403) { navigate('/admin/login'); return; }
            const result = await response.json();
            if (result.success) {
                setNewOccasion({ name: '', description: '' });
                fetchOccasionList();
            } else {
                setError(result.message || 'Unable to create occasion');
            }
        } catch (err) {
            console.error('Error creating occasion:', err);
            setError('Unable to create occasion.');
        } finally {
            setSaving(false);
        }
    };

    const renderOccasionCard = (occasionKey, items) => {
        const title = occasionLabels[occasionKey] || occasionKey;
        const priceRange = () => {
            const prices = items.map((m) => Number(m.price) || 0);
            const min = Math.min(...prices);
            const max = Math.max(...prices);
            if (!prices.length || Number.isNaN(min) || Number.isNaN(max)) {
                return 'Pricing TBD';
            }
            return min === max ? `₹${min}` : `₹${min} - ₹${max}`;
        };

        return (
            <div key={occasionKey} className="glass-card p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <span className="admin-pill">{title}</span>
                    <span className="text-xs font-semibold text-emerald-600">Active</span>
                </div>
                <p className="text-xs text-slate-500">{items.length} meal plans • {priceRange()}</p>
                <div className="flex flex-wrap gap-2">
                    {items.slice(0, 5).map((meal) => (
                        <span key={meal.id} className="px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-700">{meal.name}</span>
                    ))}
                    {items.length > 5 && (
                        <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-700">+{items.length - 5} more</span>
                    )}
                </div>
                <button
                    onClick={() => navigate('/admin/meal-plans')}
                    className="soft-input text-center font-semibold text-emerald-700"
                >
                    Manage Meal Plans
                </button>
            </div>
        );
    };

    return (
        <div className="space-y-5">
            <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Occasion Management</p>
                    <h1 className="text-2xl font-extrabold text-slate-900">Configure, monitor and scale your occasions</h1>
                    <p className="text-sm text-slate-500">Create new occasions and link meal plans.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={fetchOccasionMenus} className="admin-chip"><RefreshCw size={14} /> Refresh</button>
                    <button onClick={() => navigate('/admin/meal-plans')} className="admin-chip primary">Go to Meal Plans</button>
                </div>
            </div>

            {error && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm">
                    {error}
                </div>
            )}

            <div className="glass-card p-4 space-y-3">
                <p className="text-sm font-bold text-slate-900">Create New Occasion</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                        type="text"
                        value={newOccasion.name}
                        onChange={(e) => setNewOccasion({ ...newOccasion, name: e.target.value })}
                        className="soft-input"
                        placeholder="e.g., Annual Tech Summit 2024"
                    />
                    <input
                        type="text"
                        value={newOccasion.description}
                        onChange={(e) => setNewOccasion({ ...newOccasion, description: e.target.value })}
                        className="soft-input"
                        placeholder="Category or short description"
                    />
                </div>
                <button
                    onClick={handleCreateOccasion}
                    disabled={saving}
                    className="admin-chip primary w-fit"
                >
                    <Plus size={14} /> Save Occasion
                </button>
            </div>

            {loading ? (
                <div className="glass-card p-6 text-slate-600">Loading occasion menus...</div>
            ) : Object.keys(grouped).length === 0 ? (
                <div className="glass-card p-6 text-slate-600">No meal plans found yet. Add a meal plan to start mapping occasions.</div>
            ) : (
                <div className="card-grid">
                    {Object.entries(grouped).map(([key, items]) => renderOccasionCard(key, items))}
                </div>
            )}
        </div>
    );
};

export default AdminOccasions;
