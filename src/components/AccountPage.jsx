import React from 'react';
import { ArrowLeft, User, Mail, Phone, MapPin, LogOut, ChevronRight, Home, ClipboardList, Settings, CreditCard, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AccountPage = () => {
    const navigate = useNavigate();

    const menuItems = [
        { icon: ClipboardList, label: 'Your Orders', sub: 'Track, return, or buy again', action: () => navigate('/orders') },
        { icon: MapPin, label: 'Address Book', sub: 'Manage delivery addresses', action: () => { } },
        { icon: CreditCard, label: 'Payments', sub: 'Manage cards and wallets', action: () => { } },
        { icon: Heart, label: 'Favorites', sub: 'Your favorite meals', action: () => { } },
        { icon: Settings, label: 'Settings', sub: 'Notifications, password', action: () => { } },
    ];



    const Footer = () => (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50 shadow-lg md:hidden">
            <div onClick={() => navigate('/home')} className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors">
                <Home size={24} />
                <span className="text-[10px] font-medium">Home</span>
            </div>
            <div onClick={() => navigate('/orders')} className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors">
                <ClipboardList size={24} />
                <span className="text-[10px] font-medium">Orders</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-green-600">
                <User size={24} />
                <span className="text-[10px] font-medium">Account</span>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <div className="bg-white pb-6 pt-4 rounded-b-3xl shadow-sm mb-6">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="flex justify-end mb-4">
                        <button className="text-gray-500 hover:text-gray-900">
                            <Settings size={20} />
                        </button>
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-20 h-20 rounded-full bg-green-100 border-4 border-white shadow-sm flex items-center justify-center text-green-600 text-2xl font-bold">
                            AJ
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Alex Johnson</h1>
                            <p className="text-gray-500 text-sm">alex.johnson@company.com</p>
                            <p className="text-gray-500 text-sm">+91 98765 43210</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="flex-1 bg-green-50 rounded-xl p-3 flex flex-col items-center justify-center border border-green-100">
                            <span className="text-green-700 font-bold text-lg">12</span>
                            <span className="text-green-600 text-[10px] uppercase font-bold tracking-wide">Orders</span>
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-xl p-3 flex flex-col items-center justify-center border border-gray-100">
                            <span className="text-gray-700 font-bold text-lg">₹4.5k</span>
                            <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wide">Saved</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 space-y-3">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1 mb-2">QUICK ACTIONS</h2>
                {menuItems.map((item, index) => (
                    <button
                        key={index}
                        onClick={item.action}
                        className="w-full bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm border border-gray-100 hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-green-50 group-hover:text-green-600 transition-colors">
                                <item.icon size={20} />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-gray-900 text-sm">{item.label}</p>
                                <p className="text-xs text-gray-500">{item.sub}</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-500" />
                    </button>
                ))}

                <button
                    onClick={() => navigate('/')}
                    className="w-full mt-6 bg-red-50 p-4 rounded-2xl flex items-center justify-center gap-2 text-red-600 font-bold text-sm hover:bg-red-100 transition-colors"
                >
                    <LogOut size={18} />
                    Sign Out
                </button>
            </div>

            <Footer />
        </div>
    );
};

export default AccountPage;
