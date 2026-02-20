import React, { useState } from 'react';
import { ArrowLeft, ShoppingCart, User, PartyPopper, Briefcase, Heart, Flower2, Phone, MessageCircle, HelpCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BrandLogo from './BrandLogo';

const BuffetPage = () => {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [selectedOccasion, setSelectedOccasion] = useState(null);
    const [showSupport, setShowSupport] = useState(false);

    const occasions = [
        {
            id: 1,
            title: "Wedding Feast",
            description: "A grand culinary experience for your special day. Extensive spread with live counters.",
            image: "/buffet-catering.png",
            items: "25+ Items",
            price: "899",
            icon: <Heart className="w-5 h-5 text-rose-500" />,
            color: "bg-rose-50",
            borderColor: "hover:border-rose-200"
        },
        {
            id: 2,
            title: "Corporate Event",
            description: "Professional and balanced menu perfect for seminars, AGMs, and team gatherings.",
            image: "/hero-catering.png",
            items: "15+ Items",
            price: "499",
            icon: <Briefcase className="w-5 h-5 text-blue-600" />,
            color: "bg-blue-50",
            borderColor: "hover:border-blue-200"
        },
        {
            id: 3,
            title: "Birthday Bash",
            description: "Fun and delicious spread with kid-friendly options and live fast food counters.",
            image: "/sandwich-platter.png",
            items: "18+ Items",
            price: "599",
            icon: <PartyPopper className="w-5 h-5 text-amber-500" />,
            color: "bg-amber-50",
            borderColor: "hover:border-amber-200"
        },
        {
            id: 4,
            title: "Pooja / Satvik",
            description: "Pure vegetarian, no onion/garlic options prepared with traditional sanctity.",
            image: "/white-rice.png", // Using generic veg image
            items: "12+ Items",
            price: "399",
            icon: <Flower2 className="w-5 h-5 text-orange-500" />,
            color: "bg-orange-50",
            borderColor: "hover:border-orange-200"
        }
    ];

    const handleOccasionClick = (occasion) => {
        // If Pooja, skip modal and go direct to Veg
        if (occasion.title.includes("Pooja")) {
            navigate('/customize-meal', {
                state: {
                    type: 'buffet',
                    preference: 'veg',
                    boxSize: 99,
                    guestCount: 50,
                    price: occasion.price
                }
            });
            return;
        }

        // Else open modal
        setSelectedOccasion(occasion);
        setShowModal(true);
    };

    const handlePreferenceSelect = (pref) => {
        if (!selectedOccasion) return;

        navigate('/customize-meal', {
            state: {
                type: 'buffet',
                preference: pref, // 'veg' or 'both'
                boxSize: 99,
                guestCount: 50,
                price: selectedOccasion.price
            }
        });
        setShowModal(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
                <header className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/home')} className="p-2 -ml-2 text-gray-600 hover:text-gray-900 md:hidden">
                            <ArrowLeft size={24} />
                        </button>
                        <BrandLogo
                            className="flex items-center gap-2"
                            imgClassName="h-8 w-auto"
                            labelClassName="hidden md:inline text-lg font-bold text-slate-900"
                        />
                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex gap-6 ml-4">
                            <button onClick={() => navigate('/home')} className="text-sm font-medium text-gray-500 hover:text-green-600">Home</button>
                            <button onClick={() => navigate('/orders')} className="text-sm font-medium text-gray-500 hover:text-green-600">Orders</button>
                            <button onClick={() => navigate('/account')} className="text-sm font-medium text-gray-500 hover:text-green-600">Account</button>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <ShoppingCart size={24} className="text-gray-600" />
                            <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">0</span>
                        </div>
                        <button className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                            <User size={18} />
                            <span>Account</span>
                        </button>
                    </div>
                </header>
            </div>

            <div className="max-w-7xl mx-auto">
                {/* Hero / Title */}
                <div className="px-4 py-8 md:text-center">
                    <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-2">Buffet Services</h1>
                    <p className="text-gray-500 text-sm md:text-base max-w-2xl mx-auto">
                        Premium catering setups for your special occasions.
                        Customize your menu with live counters, desserts, and more.
                    </p>
                </div>

                {/* Occasion Cards */}
                <div className="px-4 pb-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
                    {occasions.map((occasion) => (
                        <div
                            key={occasion.id}
                            onClick={() => handleOccasionClick(occasion)}
                            className={`bg-white rounded-3xl p-4 shadow-sm border border-gray-100 cursor-pointer transition-all duration-300 hover:shadow-lg ${occasion.borderColor} hover:-translate-y-1 group`}
                        >
                            <div className="flex gap-4">
                                {/* Image */}
                                <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden flex-shrink-0 relative">
                                    <img src={occasion.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={occasion.title} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 flex flex-col justify-between py-1">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className={`p-1.5 rounded-full ${occasion.color}`}>
                                                {occasion.icon}
                                            </div>
                                            <h3 className="font-bold text-lg text-gray-900">{occasion.title}</h3>
                                        </div>
                                        <p className="text-xs text-gray-500 line-clamp-2 md:line-clamp-none mb-2">
                                            {occasion.description}
                                        </p>
                                    </div>

                                    <div className="flex items-end justify-between">
                                        <span className="bg-gray-100 px-2 py-1 rounded text-[10px] font-bold text-gray-600 uppercase tracking-wide">
                                            {occasion.items}
                                        </span>
                                        <div className="text-right">
                                            <span className="text-[10px] text-gray-400 block">Starts @</span>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-lg font-bold text-gray-900">₹{occasion.price}</span>
                                                <span className="text-xs text-gray-500">/head</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Support FAB */}
            <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
                {/* Expanded Options */}
                <div className={`flex flex-col gap-3 transition-all duration-300 origin-bottom-right ${showSupport ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                    <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                        <span className="text-sm font-bold text-gray-700">Call Us</span>
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            <Phone size={18} />
                        </div>
                    </button>
                    <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                        <span className="text-sm font-bold text-gray-700">Message</span>
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <MessageCircle size={18} />
                        </div>
                    </button>
                </div>

                {/* Main Trigger Button */}
                <button
                    onClick={() => setShowSupport(!showSupport)}
                    className={`p-4 rounded-full shadow-xl transition-all duration-300 ${showSupport ? 'bg-gray-800 text-white rotate-45' : 'bg-green-600 text-white hover:scale-110 hover:shadow-green-200'}`}
                >
                    {showSupport ? <X size={24} /> : <HelpCircle size={24} />}
                </button>
            </div>

            {/* Preference Selection Modal */}
            {showModal && selectedOccasion && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                    <div className="bg-white rounded-3xl w-full max-w-sm relative z-10 overflow-hidden animate-scale-up">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <div className="p-2 bg-green-100 rounded-full">
                                    <img src={selectedOccasion.image} className="w-8 h-8 object-cover rounded-full" alt="" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Select Food Preference</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Choose the type of menu you'd like to explore for your <span className="font-semibold text-gray-800">{selectedOccasion.title}</span>.
                            </p>

                            <div className="space-y-3">
                                <button
                                    onClick={() => handlePreferenceSelect('veg')}
                                    className="w-full py-4 border-2 border-green-600 bg-green-50 rounded-2xl flex items-center justify-center gap-3 hover:bg-green-100 transition-colors group"
                                >
                                    <div className="w-4 h-4 border border-green-600 flex items-center justify-center p-[2px]">
                                        <div className="w-full h-full bg-green-600 rounded-full"></div>
                                    </div>
                                    <span className="font-bold text-green-800 group-hover:text-green-900">Pure Veg</span>
                                </button>

                                <button
                                    onClick={() => handlePreferenceSelect('both')}
                                    className="w-full py-4 border border-gray-200 bg-white rounded-2xl flex items-center justify-center gap-3 hover:border-red-200 hover:bg-red-50 transition-colors group"
                                >
                                    <div className="w-4 h-4 border border-red-600 flex items-center justify-center p-[2px]">
                                        <div className="w-full h-full bg-red-600 rounded-full"></div>
                                    </div>
                                    <span className="font-bold text-gray-700 group-hover:text-red-700">Non-Veg (scales to Both)</span>
                                </button>
                            </div>

                            <button onClick={() => setShowModal(false)} className="mt-6 text-xs font-bold text-gray-400 hover:text-gray-600">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BuffetPage;
