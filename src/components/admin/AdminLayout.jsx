import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Utensils, Calendar, Users, BarChart3, LogOut, Package, ChevronRight } from 'lucide-react';
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

    const menuGroups = [
        {
            label: 'Main',
            items: [
                { icon: LayoutDashboard, label: 'Overview',       path: '/admin' },
                { icon: ShoppingBag,     label: 'Orders',         path: '/admin/orders' },
            ],
        },
        {
            label: 'Menu',
            items: [
                { icon: Utensils,  label: 'Meal Plans',     path: '/admin/meal-plans' },
                { icon: Package,   label: 'Dish Catalogue', path: '/admin/dishes' },
                { icon: Calendar,  label: 'Occasions',      path: '/admin/occasions' },
            ],
        },
        {
            label: 'Insights',
            items: [
                { icon: Users,     label: 'Customers',  path: '/admin/customers' },
                { icon: BarChart3, label: 'Analytics',  path: '/admin/analytics' },
            ],
        },
    ];

    const isActive = (path) =>
        path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(path);

    const currentPageLabel = () => {
        for (const group of menuGroups) {
            for (const item of group.items) {
                if (isActive(item.path)) return item.label;
            }
        }
        return 'Admin Panel';
    };

    return (
        <div className="admin-bg flex min-h-screen">
            {/* ── Sidebar ──────────────────────────────────────────────────── */}
            <aside className="nav-rail fixed top-0 left-0 h-full w-60 flex flex-col z-40">
                {/* Logo */}
                <div className="px-5 py-5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                            <Utensils size={16} className="text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900 leading-tight">Basil Admin</p>
                            <p className="text-xs text-slate-400">Management Portal</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
                    {menuGroups.map((group) => (
                        <div key={group.label}>
                            <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                {group.label}
                            </p>
                            <div className="space-y-0.5">
                                {group.items.map((item) => (
                                    <button
                                        key={item.path}
                                        onClick={() => navigate(item.path)}
                                        className={`nav-item w-full text-left ${isActive(item.path) ? 'active' : ''}`}
                                    >
                                        <item.icon size={16} className="shrink-0" />
                                        <span className="flex-1">{item.label}</span>
                                        {isActive(item.path) && <ChevronRight size={14} className="opacity-50" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* User profile */}
                <div className="px-3 pb-4 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-default">
                        <div className="avatar shrink-0">A</div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">Administrator</p>
                            <p className="text-xs text-slate-400 truncate">admin</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            title="Sign out"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                        >
                            <LogOut size={15} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* ── Main area ────────────────────────────────────────────────── */}
            <div className="flex-1 ml-60 flex flex-col min-h-screen">
                {/* Top header */}
                <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
                    <div className="flex items-center justify-between px-6 h-14">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span className="font-semibold text-slate-800">{currentPageLabel()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200 text-green-700 text-xs font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                                Live
                            </span>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
