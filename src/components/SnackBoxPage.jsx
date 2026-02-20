import React from 'react';
import { ArrowLeft, ShoppingCart, Filter, Plus, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MenuPreferenceModal from './MenuPreferenceModal';
import BrandLogo from './BrandLogo';

const SnackBoxPage = () => {
    const navigate = useNavigate();
    const [showPreferenceModal, setShowPreferenceModal] = React.useState(false);

    const handleCardClick = () => {
        setShowPreferenceModal(true);
    };

    const handlePreferenceSelect = (preference) => {
        console.log("Selected preference:", preference);
        setShowPreferenceModal(false);
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
                            <button onClick={() => navigate('/meal-box')} className="text-sm font-medium text-green-600">Menu</button>
                            <button onClick={() => navigate('/orders')} className="text-sm font-medium text-gray-500 hover:text-green-600">Orders</button>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <ShoppingCart size={24} className="text-gray-600" />
                            <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">0</span>
                        </div>
                        <button className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                            <User size={18} /> // User icon needs to be imported or available
                            <span>Account</span>
                        </button>
                    </div>
                </header>
            </div>

            <div className="max-w-7xl mx-auto">
                {/* Quick Nav Options */}
                <div className="pt-6 px-4">
                    <div className="flex gap-4 overflow-x-auto no-scrollbar md:justify-center md:gap-8 pb-2">
                        {/* MealBox Nav */}
                        <div
                            onClick={() => navigate('/meal-box')}
                            className={`flex flex-col items-center gap-1.5 cursor-pointer min-w-[80px] group opacity-60 hover:opacity-100 transition-opacity`}
                        >
                            <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-sm border border-gray-100 relative group-hover:border-gray-300 transition-all">
                                <img src="/meal-box-salad.png" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Meal Box" />
                            </div>
                            <span className="text-xs font-bold text-gray-500 group-hover:text-gray-900 transition-colors">MealBox</span>
                        </div>

                        {/* SnackBox Nav */}
                        <div
                            onClick={() => navigate('/snack-box')}
                            className={`flex flex-col items-center gap-1.5 cursor-pointer min-w-[80px] group`}
                        >
                            <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-sm border border-green-600 ring-2 ring-green-600 relative scale-105 transition-all">
                                <img src="/snack-box-coffee.png" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Snack Box" />
                            </div>
                            <span className="text-xs font-bold text-gray-900 transition-colors">SnackBox</span>
                        </div>

                        {/* Bowls Nav */}
                        <div
                            onClick={() => navigate('/bowls')}
                            className="flex flex-col items-center gap-1.5 cursor-pointer min-w-[80px] group opacity-60 hover:opacity-100 transition-opacity"
                        >
                            <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-sm border border-gray-100 relative group-hover:border-gray-300 transition-all">
                                <img src="/fried-rice.png" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Bowls" />
                            </div>
                            <span className="text-xs font-bold text-gray-500 group-hover:text-gray-900 transition-colors">Bowls</span>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white px-4 py-6 mb-4 md:text-center">
                    <div className="flex justify-between items-center mb-4 md:justify-center md:gap-8">
                        <h1 className="text-2xl font-bold text-gray-900">Snack Boxes</h1>
                        <span className="text-xs text-gray-400 md:hidden">Min. order 10 per item</span>
                        <span className="text-sm text-gray-500 hidden md:block">Minimum order 10 per item for bulk events</span>
                    </div>
                </div>

                {/* Snack Box Cards */}
                <div className="px-4 space-y-6 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8 md:pb-12">

                    {/* Card 1: Classical Indian Snack */}
                    <div onClick={handleCardClick} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all group">
                        <div className="relative h-56 overflow-hidden">
                            <img src="/samosa-juice.png" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Samosa Juice" />
                            <span className="absolute bottom-4 left-4 bg-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                                2 Items
                            </span>
                        </div>
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-xl font-bold text-gray-900 leading-tight w-2/3 group-hover:text-green-700 transition-colors">Classical Indian Snack</h2>
                                <div className="text-right">
                                    <span className="text-xs text-gray-400 block mb-1">Starts @</span>
                                    <span className="text-xl font-bold text-gray-900">₹129</span>
                                    <span className="text-[10px] text-gray-400 block">/Box</span>
                                </div>
                            </div>

                            <div className="border-t border-dashed border-gray-200 pt-4">
                                <h3 className="text-[10px] font-bold text-green-600 uppercase tracking-wider mb-3">WHAT'S IN THE BOX</h3>
                                <div className="flex justify-start gap-8 px-2">
                                    <div className="text-center flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100 shadow-sm">
                                            <img src="/samosa-juice.png" className="w-full h-full object-cover scale-150" alt="Samosa" />
                                        </div>
                                        <span className="text-[10px] text-gray-500 font-medium leading-tight">2 Crispy<br />Samosas</span>
                                    </div>
                                    <div className="text-center flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100 shadow-sm">
                                            <div className="w-full h-full bg-yellow-100 flex items-center justify-center text-yellow-600 text-xs">🧃</div>
                                        </div>
                                        <span className="text-[10px] text-gray-500 font-medium leading-tight">1 Mango<br />Juice</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Western Snack Combo */}
                    <div onClick={handleCardClick} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all group">
                        <div className="relative h-56 overflow-hidden">
                            <img src="/fries-juice.png" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Fries Juice" />
                            <span className="absolute bottom-4 left-4 bg-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                                2 Items
                            </span>
                        </div>
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-xl font-bold text-gray-900 leading-tight w-2/3 group-hover:text-green-700 transition-colors">Western Snack Combo</h2>
                                <div className="text-right">
                                    <span className="text-xs text-gray-400 block mb-1">Starts @</span>
                                    <span className="text-xl font-bold text-gray-900">₹149</span>
                                    <span className="text-[10px] text-gray-400 block">/Box</span>
                                </div>
                            </div>

                            <div className="border-t border-dashed border-gray-200 pt-4">
                                <h3 className="text-[10px] font-bold text-green-600 uppercase tracking-wider mb-3">WHAT'S IN THE BOX</h3>
                                <div className="flex justify-start gap-8 px-2">
                                    <div className="text-center flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100 shadow-sm">
                                            <img src="/fries-juice.png" className="w-full h-full object-cover scale-150" alt="Fries" />
                                        </div>
                                        <span className="text-[10px] text-gray-500 font-medium leading-tight">Peri Peri<br />Fries</span>
                                    </div>
                                    <div className="text-center flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100 shadow-sm">
                                            <div className="w-full h-full bg-orange-100 flex items-center justify-center text-orange-600 text-xs">🍊</div>
                                        </div>
                                        <span className="text-[10px] text-gray-500 font-medium leading-tight">Fresh Orange<br />Juice</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Office Coffee Break */}
                    <div onClick={handleCardClick} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all group">
                        <div className="relative h-56 overflow-hidden">
                            <img src="/sandwich-coffee.png" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Coffee Break" />
                            <span className="absolute bottom-4 left-4 bg-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                                2 Items
                            </span>
                        </div>
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-xl font-bold text-gray-900 leading-tight w-2/3 group-hover:text-green-700 transition-colors">Office Coffee Break</h2>
                                <div className="text-right">
                                    <span className="text-xs text-gray-400 block mb-1">Starts @</span>
                                    <span className="text-xl font-bold text-gray-900">₹199</span>
                                    <span className="text-[10px] text-gray-400 block">/Box</span>
                                </div>
                            </div>

                            <div className="border-t border-dashed border-gray-200 pt-4">
                                <h3 className="text-[10px] font-bold text-green-600 uppercase tracking-wider mb-3">WHAT'S IN THE BOX</h3>
                                <div className="flex justify-start gap-8 px-2">
                                    <div className="text-center flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100 shadow-sm">
                                            <img src="/sandwich-coffee.png" className="w-full h-full object-cover scale-150" alt="Sandwich" />
                                        </div>
                                        <span className="text-[10px] text-gray-500 font-medium leading-tight">1 Club<br />Sandwich</span>
                                    </div>
                                    <div className="text-center flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100 shadow-sm">
                                            <div className="w-full h-full bg-amber-100 flex items-center justify-center text-amber-800 text-xs">☕</div>
                                        </div>
                                        <span className="text-[10px] text-gray-500 font-medium leading-tight">1 Hot<br />Coffee</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Preference Modal */}
            {showPreferenceModal && (
                <MenuPreferenceModal
                    onClose={() => setShowPreferenceModal(false)}
                    onSelect={handlePreferenceSelect}
                />
            )}

        </div>
    );
};

export default SnackBoxPage;
