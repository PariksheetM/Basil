import React from 'react';
import { ArrowLeft, ShoppingCart, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BowlPage = () => {
    const navigate = useNavigate();

    // Data for Bowls
    const bowls = [
        {
            id: 5,
            name: "Classic Fried Rice Bowl",
            image: "/fried-rice.png",
            itemsCount: 1,
            price: 299,
            category: "Bowls",
            type: "veg",
            description: "Aromatic fried rice with fresh veggies and chef's special spice mix.",
            items: [
                { img: "/fried-rice.png", name: "Fried Rice" },
                { img: "/meal-box-salad.png", name: "Salad" }
            ]
        },
        {
            id: 6,
            name: "Hyderabadi Veg Biryani Bowl",
            image: "/biryani.webp",
            itemsCount: 1,
            price: 349,
            category: "Bowls",
            type: "veg",
            description: "Authentic dum biryani served with raita and salan.",
            items: [
                { img: "/biryani.webp", name: "Veg Biryani" },
                { img: "/meal-box-salad.png", name: "Raita" }
            ]
        },
        {
            id: 7,
            name: "Plain Rice & Dal Combo",
            image: "/white-rice.png",
            itemsCount: 2,
            price: 199,
            category: "Bowls",
            type: "veg",
            description: "Comfort food at its best. Steamed rice with creamy dal fry.",
            items: [
                { img: "/white-rice.png", name: "Steamed Rice" },
                { img: "/meal-box-salad.png", name: "Dal Fry" }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
                <header className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <button onClick={() => navigate('/home')} className="p-2 -ml-2 text-gray-600 hover:text-gray-900 transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <div className="relative">
                        <ShoppingCart size={24} className="text-gray-600" />
                        <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">0</span>
                    </div>
                </header>
            </div>

            <div className="max-w-7xl mx-auto">
                {/* Quick Nav Options */}
                <div className="pt-6 px-4">
                    <div className="flex gap-4 overflow-x-auto no-scrollbar md:justify-center md:gap-8 pb-2">
                        {[
                            { name: 'MealBox', img: '/meal-box-salad.png', price: '249', route: '/meal-box', active: false },
                            { name: 'SnackBox', img: '/snack-box-coffee.png', price: '129', route: '/snack-box', active: false },
                            { name: 'Bowls', img: '/fried-rice.png', price: '299', route: '/bowls', active: true },
                        ].map((item) => (
                            <div
                                key={item.name}
                                onClick={() => navigate(item.route)}
                                className="flex flex-col items-center gap-2 cursor-pointer min-w-[80px] group"
                            >
                                <div className={`w-20 h-20 rounded-2xl overflow-hidden relative shadow-sm border transition-all duration-300 ${item.active ? 'border-green-600 ring-2 ring-green-600 scale-105' : 'border-gray-100 group-hover:border-gray-300'}`}>
                                    <img src={item.img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={item.name} />
                                    <div className="absolute bottom-1.5 left-1.5 bg-blue-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-md">
                                        Starts @ ₹{item.price}
                                    </div>
                                </div>
                                <span className={`text-xs font-bold transition-colors ${item.active ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                    {item.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Title */}
                <div className="px-4 py-6 md:text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Bowls</h1>
                    <span className="text-sm text-gray-500 mt-1 block">Wholesome single-bowl meals for a quick delight</span>
                </div>

                {/* Content Area */}
                <div className="px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pb-10">
                    {bowls.map((box) => (
                        <div key={box.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow duration-300 group">
                            <div className="relative h-56 overflow-hidden">
                                <img src={box.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={box.name} />
                                <span className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold shadow-md">
                                    {box.itemsCount} Items
                                </span>
                            </div>
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="text-xl font-bold text-gray-900 leading-tight w-2/3 group-hover:text-green-700 transition-colors">{box.name}</h2>
                                    <div className="text-right">
                                        <span className="text-xs text-gray-400 block mb-1">Starts @</span>
                                        <span className="text-xl font-bold text-gray-900">₹{box.price}</span>
                                        <span className="text-[10px] text-gray-400 block">/Plate</span>
                                    </div>
                                </div>

                                <div className="border-t border-dashed border-gray-200 pt-4">
                                    <h3 className="text-[10px] font-bold text-green-600 uppercase tracking-wider mb-3">WHAT'S IN THE BOWL</h3>
                                    <div className="flex justify-start gap-4 overflow-x-auto no-scrollbar px-2 pb-2">
                                        {box.items.map((item, index) => (
                                            <div key={index} className="text-center flex flex-col items-center gap-2 min-w-[60px]">
                                                <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100 shadow-sm">
                                                    <img src={item.img} className="w-full h-full object-cover scale-150" alt={item.name} />
                                                </div>
                                                <span className="text-[10px] text-gray-500 font-medium leading-tight">{item.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BowlPage;
