import React, { useState, useEffect } from 'react';
import { TrendingUp, ShoppingBag, DollarSign, Clock, Users, Star, ArrowUpRight } from 'lucide-react';

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        stats: { totalOrders: 0, todayOrders: 0, revenue: 0, pendingOrders: 0 },
        recentOrders: [],
        popularMeals: [],
        occasionStats: []
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/admin/dashboard.php');
            const result = await response.json();
            if (result.success) {
                setDashboardData(result.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        {
            label: 'Total Revenue',
            value: `₹${(dashboardData.stats.revenue || 0).toLocaleString()}`,
            change: '+12.5% vs last month',
            icon: DollarSign,
            accent: 'text-emerald-600'
        },
        {
            label: 'Total Orders',
            value: dashboardData.stats.totalOrders.toLocaleString(),
            change: '-2.4% vs last week',
            icon: ShoppingBag,
            accent: 'text-blue-600'
        },
        {
            label: 'Today Orders',
            value: dashboardData.stats.todayOrders.toLocaleString(),
            change: '+8.1% vs yesterday',
            icon: Clock,
            accent: 'text-indigo-600'
        },
        {
            label: 'Pending Orders',
            value: dashboardData.stats.pendingOrders.toLocaleString(),
            change: '-5.0% vs last week',
            icon: TrendingUp,
            accent: 'text-amber-600'
        }
    ];

    const occasionStats = dashboardData.occasionStats.map(stat => ({
        occasion: stat.occasion,
        count: stat.count,
        percentage: stat.percentage
    }));

    const statusClass = (status) => {
        const normalized = (status || '').toLowerCase();
        if (normalized.includes('pending')) return 'status-pill pending';
        if (normalized.includes('confirm')) return 'status-pill confirmed';
        if (normalized.includes('deliver')) return 'status-pill delivered';
        return 'status-pill processing';
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatCurrency = (val) => `₹${Number(val || 0).toLocaleString()}`;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 text-slate-500">Loading dashboard...</div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Metric cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <div key={stat.label} className="glass-card metric-card p-5 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center">
                                <stat.icon className={`${stat.accent}`} size={20} />
                            </div>
                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">Live</span>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">{stat.label}</p>
                            <p className="text-2xl font-extrabold text-slate-900 mt-1">{stat.value}</p>
                        </div>
                        <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                            <ArrowUpRight size={14} />
                            {stat.change}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                {/* Recent Orders */}
                <div className="xl:col-span-2 glass-card p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-lg font-bold text-slate-900">Recent Orders</p>
                            <p className="text-xs text-slate-500">Manage and track customer orders in real-time.</p>
                        </div>
                        <button className="admin-chip primary">View All Orders</button>
                    </div>

                    <table className="table-soft">
                        <thead>
                            <tr>
                                <th>ORDER ID</th>
                                <th>CUSTOMER</th>
                                <th>OCCASION</th>
                                <th>AMOUNT</th>
                                <th>STATUS</th>
                                <th>DATE</th>
                            </tr>
                        </thead>
                        <tbody className="space-y-3">
                            {dashboardData.recentOrders.map((order) => (
                                <tr key={order.order_number}>
                                    <td className="font-bold">#{order.order_number}</td>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="avatar text-xs">{(order.customer_name || 'G')[0]}</div>
                                            <div>
                                                <p className="font-semibold text-slate-900">{order.customer_name}</p>
                                                <p className="text-xs text-slate-500">{order.customer_email || ''}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-sm text-slate-700">{order.occasion || '—'}</td>
                                    <td className="font-semibold">{formatCurrency(order.total_amount)}</td>
                                    <td>
                                        <span className={statusClass(order.status)}>{order.status}</span>
                                    </td>
                                    <td className="text-sm text-slate-600">{formatDate(order.created_at)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Popular meals */}
                <div className="glass-card p-5 flex flex-col gap-4">
                    <div>
                        <p className="text-lg font-bold text-slate-900 flex items-center gap-2"><Star className="text-amber-400" size={18} /> Popular Meals</p>
                        <p className="text-xs text-slate-500">Top performing packages by revenue.</p>
                    </div>
                    <div className="space-y-4">
                        {dashboardData.popularMeals.map((meal, index) => (
                            <div key={index} className="flex items-center justify-between pb-3 border-b last:border-0 border-slate-100">
                                <div>
                                    <p className="font-semibold text-slate-900">{meal.meal_plan_name}</p>
                                    <p className="text-xs text-slate-500">{meal.order_count} orders</p>
                                </div>
                                <span className="text-sm font-bold text-emerald-600">{formatCurrency(meal.revenue)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Occasion distribution */}
            <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-lg font-bold text-slate-900">Orders by Occasion</p>
                    <span className="text-xs font-semibold text-slate-500">Live</span>
                </div>
                <div className="space-y-4">
                    {occasionStats.map((occasion) => (
                        <div key={occasion.occasion}>
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-semibold text-slate-800">{occasion.occasion}</span>
                                <span className="text-slate-600">{occasion.count} orders</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-100 mt-2 overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${occasion.percentage}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
