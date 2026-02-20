import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Utensils, Calendar, Users, BarChart3, Settings, Bell, LogOut, Search, ChevronDown } from 'lucide-react';
import AuthService from '../../services/authService';

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const ensureAdminSession = async () => {
            const token = localStorage.getItem('session_token');
            if (!token) {
                navigate('/admin/login');
                return;
            }

            const result = await AuthService.verifySession();
            const role = result?.data?.role || 'user';
            if (!result.success || role !== 'admin') {
                await AuthService.logout();
                navigate('/admin/login');
            }
        };

        ensureAdminSession();
    }, [navigate]);

    const handleLogout = async () => {
        await AuthService.logout();
        navigate('/admin/login');
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Overview', path: '/admin' },
        { icon: ShoppingBag, label: 'Orders', path: '/admin/orders' },
        { icon: Utensils, label: 'Meal Management', path: '/admin/meal-plans' },
        { icon: Calendar, label: 'Occasions', path: '/admin/occasions' },
        { icon: Users, label: 'Customers', path: '/admin/customers' },
        { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
        { icon: Settings, label: 'Settings', path: '/admin/settings' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="admin-bg">
            <div className="flex min-h-screen">
                {/* Sidebar */}
                <aside className="nav-rail fixed top-0 left-0 h-full w-64 px-4 py-6 z-40">
                    <div className="flex items-center gap-3 px-2 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                            <Utensils size={18} />
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">FoodDash</p>
                            <p className="text-base font-extrabold text-slate-900">Executive Suite</p>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        {menuItems.map((item) => (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`nav-item ${isActive(item.path) ? 'active' : ''} w-full`}
                            >
                                <item.icon size={18} />
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    <div className="mt-10 glass-card p-4 flex items-center gap-3">
                        <div className="avatar text-sm">JW</div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-900">James Wilson</p>
                            <p className="text-xs text-slate-500">Head Administrator</p>
                        </div>
                        <button onClick={handleLogout} className="text-slate-500 hover:text-slate-900" title="Logout">
                            <LogOut size={16} />
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 ml-64">
                    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200">
                        <div className="flex items-center justify-between px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        className="soft-input pl-10 pr-12 w-80"
                                        placeholder="Search for orders, meals, or analytics..."
                                    />
                                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">⌘K</button>
                                </div>
                                <div className="admin-chip primary">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                                    System Sync OK
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-slate-900">James Wilson</p>
                                    <p className="text-xs text-slate-500">Head Administrator</p>
                                </div>
                                <div className="avatar">JW</div>
                                <button className="text-slate-400 hover:text-slate-700">
                                    <Bell size={18} />
                                </button>
                                <button className="text-slate-400 hover:text-slate-700">
                                    <ChevronDown size={18} />
                                </button>
                            </div>
                        </div>
                    </header>

                    <main className="p-6 space-y-6">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
