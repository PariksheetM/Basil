import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, Info, ChevronDown, Leaf, Users, ShoppingCart, Plus, Minus, X, Drumstick } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const CustomizeMealPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { addToCart } = useCart();
    
    // Check if this is occasion menu customization
    const { mealItem, guestCount: initialGuestCount } = location.state || {};
    const isOccasionMenu = !!mealItem;
    
    // For traditional meal boxes
    const { preference, boxSize } = location.state || { preference: 'non-veg', boxSize: 6 };
    
    // Guest count for occasion menus
    const [guestCount, setGuestCount] = useState(initialGuestCount || 25);

    // Guest count for occasion menus
    const [guestCount, setGuestCount] = useState(initialGuestCount || 25);

    // State for dual configuration (Veg & Non-Veg)
    const [activeGuestType, setActiveGuestType] = useState(preference === 'both' ? 'veg' : preference);
    const [activeTab, setActiveTab] = useState('mains');

    // For occasion menu: Track selected items and additions/removals
    const [selectedItems, setSelectedItems] = useState([]);
    const [removedItems, setRemovedItems] = useState([]);
    const [addedItems, setAddedItems] = useState([]);

    // Initialize selected items from meal plan
    useEffect(() => {
        if (isOccasionMenu && mealItem?.items) {
            setSelectedItems(mealItem.items.map((name, index) => ({
                id: `original-${index}`,
                name,
                type: mealItem.type || 'both',
                price: 0,
                isOriginal: true
            })));
        }
    }, [isOccasionMenu, mealItem]);

    // Store independent configurations
    const [boxConfigurations, setBoxConfigurations] = useState({
        veg: { mains: [], sides: [], drinks: [] },
        'non-veg': { mains: [], sides: [], drinks: [] }
    });

    // Helper to get current configuration
    const currentConfig = boxConfigurations[activeGuestType] || boxConfigurations[preference];

    // Base Mock Data (Default)
    const defaultItems = {
        mains: [
            { id: 'm1', name: 'Grilled Chicken Breast', img: '/grilled-chicken.png', type: 'non-veg', price: 0, isPremium: false },
            { id: 'm2', name: 'Peri Peri Chicken', img: '/grilled-chicken.png', type: 'non-veg', price: 50, isPremium: true },
            { id: 'm3', name: 'Paneer Butter Masala', img: '/meal-box-salad.png', type: 'veg', price: 0, isPremium: false },
            { id: 'm4', name: 'Tofu Steak', img: '/vegan-falafel.png', type: 'veg', price: 40, isPremium: true },
        ],
        sides: [
            { id: 's1', name: 'Quinoa Salad', img: '/meal-box-salad.png', type: 'veg', price: 0 },
            { id: 's2', name: 'Steamed Veggies', img: '/vegan-falafel.png', type: 'veg', price: 0 },
            { id: 's3', name: 'Mashed Potato', img: '/meal-box-salad.png', type: 'veg', price: 0 },
            { id: 's4', name: 'Brown Rice', img: '/meal-box-salad.png', type: 'veg', price: 0 },
        ],
        drinks: [
            { id: 'd1', name: 'Fresh Lime Water', img: '/samosa-juice.png', type: 'veg', price: 0 },
            { id: 'd2', name: 'Iced Tea', img: '/samosa-juice.png', type: 'veg', price: 20, isPremium: true },
        ]
    };

    // Satvik Menu Data (No Onion/Garlic)
    const satvikItems = {
        mains: [
            { id: 'sm1', name: 'Yellow Dal Tadka (Jain)', img: '/pooja-thali.png', type: 'veg', price: 0, isPremium: false },
            { id: 'sm2', name: 'Paneer Makhani (Satvik)', img: '/meal-box-salad.png', type: 'veg', price: 0, isPremium: false },
            { id: 'sm3', name: 'Aloo Jeera', img: '/vegan-falafel.png', type: 'veg', price: 0, isPremium: false },
            { id: 'sm4', name: 'Kashmiri Dum Aloo', img: '/meal-box-salad.png', type: 'veg', price: 40, isPremium: true },
        ],
        sides: [
            { id: 'ss1', name: 'Basmati Rice', img: '/white-rice.png', type: 'veg', price: 0 },
            { id: 'ss2', name: 'Phulka (Ghee)', img: '/hero-catering.png', type: 'veg', price: 0 },
            { id: 'ss3', name: 'Cucumber Kosambari', img: '/meal-box-salad.png', type: 'veg', price: 0 },
            { id: 'ss4', name: 'Sabudana Khichdi', img: '/pooja-thali.png', type: 'veg', price: 30, isPremium: true },
        ],
        drinks: [
            { id: 'sd1', name: 'Panakam', img: '/samosa-juice.png', type: 'veg', price: 0 },
            { id: 'sd2', name: 'Sweet Lassi', img: '/samosa-juice.png', type: 'veg', price: 20, isPremium: true },
            { id: 'sd3', name: 'Butter Milk (Chaas)', img: '/samosa-juice.png', type: 'veg', price: 0 },
        ]
    };

    const isSatvik = location.state?.boxName === 'Pure Satvik Feast';
    const items = isSatvik ? satvikItems : defaultItems;

    // Additional items available for occasion menu customization
    const occasionMenuItems = {
        mains: [
            { id: 'om1', name: 'Butter Chicken', type: 'non-veg', price: 60, isPremium: true },
            { id: 'om2', name: 'Chicken Tikka Masala', type: 'non-veg', price: 70, isPremium: true },
            { id: 'om3', name: 'Fish Curry', type: 'non-veg', price: 80, isPremium: true },
            { id: 'om4', name: 'Mutton Rogan Josh', type: 'non-veg', price: 100, isPremium: true },
            { id: 'om5', name: 'Paneer Tikka', type: 'veg', price: 40, isPremium: false },
            { id: 'om6', name: 'Dal Makhani', type: 'veg', price: 30, isPremium: false },
            { id: 'om7', name: 'Chole Bhature', type: 'veg', price: 35, isPremium: false },
            { id: 'om8', name: 'Veg Biryani', type: 'veg', price: 50, isPremium: true },
            { id: 'om9', name: 'Chicken Biryani', type: 'non-veg', price: 70, isPremium: true },
            { id: 'om10', name: 'Mutton Biryani', type: 'non-veg', price: 90, isPremium: true },
        ],
        sides: [
            { id: 'os1', name: 'Jeera Rice', type: 'veg', price: 20 },
            { id: 'os2', name: 'Garlic Naan', type: 'veg', price: 25 },
            { id: 'os3', name: 'Butter Naan', type: 'veg', price: 20 },
            { id: 'os4', name: 'Raita', type: 'veg', price: 15 },
            { id: 'os5', name: 'Green Salad', type: 'veg', price: 15 },
            { id: 'os6', name: 'Papad', type: 'veg', price: 10 },
            { id: 'os7', name: 'Pickle', type: 'veg', price: 10 },
            { id: 'os8', name: 'Masala Papad', type: 'veg', price: 15 },
        ],
        desserts: [
            { id: 'od1', name: 'Gulab Jamun', type: 'veg', price: 30 },
            { id: 'od2', name: 'Rasmalai', type: 'veg', price: 35 },
            { id: 'od3', name: 'Ice Cream', type: 'veg', price: 40 },
            { id: 'od4', name: 'Kheer', type: 'veg', price: 30 },
            { id: 'od5', name: 'Gajar Halwa', type: 'veg', price: 35 },
        ],
        drinks: [
            { id: 'odr1', name: 'Mango Lassi', type: 'veg', price: 40 },
            { id: 'odr2', name: 'Sweet Lassi', type: 'veg', price: 30 },
            { id: 'odr3', name: 'Masala Chaas', type: 'veg', price: 25 },
            { id: 'odr4', name: 'Fresh Lime Soda', type: 'veg', price: 30 },
            { id: 'odr5', name: 'Cold Coffee', type: 'veg', price: 50 },
            { id: 'odr6', name: 'Soft Drink', type: 'veg', price: 30 },
        ]
    };

    const getLimits = (size) => {
        // Simple logic to distribute items based on size
        if (size === 2) return { mains: 1, sides: 1, drinks: 0 };
        if (size === 3) return { mains: 1, sides: 1, drinks: 1 };
        if (size === 5) return { mains: 2, sides: 2, drinks: 1 };
        if (size === 6) return { mains: 2, sides: 3, drinks: 1 };
        if (size === 8) return { mains: 3, sides: 3, drinks: 2 };
        return { mains: 1, sides: 2, drinks: 1 };
    };

    const limits = getLimits(boxSize);

    // Occasion menu handlers
    const toggleOccasionItem = (item) => {
        const isSelected = selectedItems.find(i => i.id === item.id || i.name === item.name);
        
        if (isSelected) {
            // Remove item
            setSelectedItems(prev => prev.filter(i => i.id !== item.id && i.name !== item.name));
            if (isSelected.isOriginal) {
                setRemovedItems(prev => [...prev, isSelected]);
            }
            if (!isSelected.isOriginal) {
                setAddedItems(prev => prev.filter(i => i.id !== item.id));
            }
        } else {
            // Add item
            setSelectedItems(prev => [...prev, item]);
            if (!item.isOriginal) {
                setAddedItems(prev => [...prev, item]);
            }
        }
    };

    const calculateOccasionPrice = () => {
        let basePrice = mealItem?.price || 0;
        let additionalCost = 0;
        
        // Add cost of newly added premium items
        addedItems.forEach(item => {
            additionalCost += item.price || 0;
        });
        
        return (basePrice + additionalCost) * guestCount;
    };

    const toggleItem = (category, item) => {
        setBoxConfigurations(prev => {
            const currentList = prev[activeGuestType][category];
            const isSelected = currentList.find(i => i.id === item.id);
            let newList;

            if (isSelected) {
                newList = currentList.filter(i => i.id !== item.id);
            } else {
                if (currentList.length >= limits[category]) {
                    if (limits[category] === 1) {
                        newList = [item];
                    } else {
                        newList = currentList; // Limit reached for multi-select
                    }
                } else {
                    newList = [...currentList, item];
                }
            }

            return {
                ...prev,
                [activeGuestType]: {
                    ...prev[activeGuestType],
                    [category]: newList
                }
            };
        });
    };

    const calculatePriceForConfig = (config) => {
        let basePrice = 549;
        let extra = 0;
        if (!config) return basePrice;
        Object.keys(config).forEach(cat => {
            config[cat].forEach(item => extra += item.price);
        });
        return basePrice + extra;
    };

    const calculateTotal = () => {
        // Show price for currently active view
        return calculatePriceForConfig(boxConfigurations[activeGuestType]);
    };

    const categories = Object.keys(items);

    const handleNext = () => {
        // Handle occasion menu customization
        if (isOccasionMenu) {
            const customizedMeal = {
                id: `${mealItem.id}-${guestCount}-${Date.now()}`,
                name: mealItem.name,
                price: mealItem.price,
                quantity: 1,
                guestCount: guestCount,
                image: mealItem.image,
                type: mealItem.type,
                customizations: {
                    selectedItems: selectedItems.map(i => i.name || i),
                    addedItems: addedItems,
                    removedItems: removedItems
                },
                totalPrice: calculateOccasionPrice()
            };
            
            addToCart(customizedMeal);
            navigate(-1); // Go back to occasion menu page
            return;
        }
        
        // Handle traditional meal box flow
        const currentIndex = categories.indexOf(activeTab);
        if (currentIndex < categories.length - 1) {
            setActiveTab(categories[currentIndex + 1]);
        } else {
            if (preference === 'both' && activeGuestType === 'veg') {
                setActiveGuestType('non-veg');
                setActiveTab('mains');
                window.scrollTo(0, 0);
                return;
            }

            const vegPrice = calculatePriceForConfig(boxConfigurations.veg);
            const nonVegPrice = calculatePriceForConfig(boxConfigurations['non-veg']);
            const finalPrice = preference === 'veg' ? vegPrice : (preference === 'non-veg' ? nonVegPrice : Math.max(vegPrice, nonVegPrice));

            navigate('/order-details', {
                state: {
                    boxName: location.state?.type === 'buffet' ? "Grand Buffet Spread" : "Corporate Power Lunch",
                    boxImage: location.state?.type === 'buffet' ? "/buffet-catering.png" : "/grilled-chicken.png",
                    boxConfigurations: preference === 'both' ? boxConfigurations : { [preference]: boxConfigurations[preference] },
                    preference: preference,
                    price: finalPrice,
                    isBuffet: location.state?.type === 'buffet',
                    guestCount: location.state?.guestCount || 1,
                    pricing: { veg: vegPrice, nonVeg: nonVegPrice }
                }
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
                <header className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center gap-4 mb-2">
                        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:text-gray-900">
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 leading-tight">{location.state?.boxName || "Corporate Power Lunch"}</h1>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                <span>Customize your box</span>
                            </div>
                        </div>
                    </div>

                    {/* Guest Type Toggle (Only for 'both' preference) */}
                    {preference === 'both' && (
                        <div className="flex bg-gray-100 p-1 rounded-xl mb-1 max-w-md mx-auto">
                            <button
                                onClick={() => setActiveGuestType('veg')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${activeGuestType === 'veg' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
                            >
                                <Leaf size={14} /> Veg Guests
                            </button>
                            <button
                                onClick={() => setActiveGuestType('non-veg')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${activeGuestType === 'non-veg' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
                            >
                                Non-Veg Guests
                            </button>
                        </div>
                    )}
                </header>
            </div>

            <div className="max-w-7xl mx-auto">
                {/* Category Tabs */}
                <div className="bg-white px-4 pt-2 pb-0 mb-4 border-b border-gray-100 flex gap-6 overflow-x-auto no-scrollbar md:justify-center">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveTab(cat)}
                            className={`pb-3 text-sm font-medium capitalize whitespace-nowrap border-b-2 transition-colors flex flex-col items-center gap-1 min-w-[60px] ${activeTab === cat ? 'border-green-600 text-green-700' : 'border-transparent text-gray-400'}`}
                        >
                            {/* Circle Indicator */}
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-1 ${activeTab === cat ? 'bg-green-50' : 'bg-gray-50'}`}>
                                <img
                                    src={cat === 'mains' ? "/grilled-chicken.png" : cat === 'sides' ? "/meal-box-salad.png" : "/samosa-juice.png"}
                                    className="w-8 h-8 object-cover rounded-full"
                                />
                            </div>
                            {cat}
                            <span className="text-[10px] text-gray-400 font-normal">
                                {currentConfig[cat].length}/{limits[cat]}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="px-4 pb-4 md:max-w-5xl md:mx-auto">
                    {(() => {
                        // Filter logic: 
                        // If activeGuestType is 'veg', show ONLY veg items.
                        // If activeGuestType is 'non-veg', show NON-VEG items (and maybe veg items too, 
                        // but typically for non-veg box users want meat. 
                        // The previous logic was: "if preference='non-veg' && mains, return 'non-veg'". 
                        // Let's stick to strict filtering for 'mains' to keep it clean.

                        const filteredItems = items[activeTab].filter(item => {
                            if (activeGuestType === 'veg') return item.type === 'veg';
                            if (activeGuestType === 'non-veg' && activeTab === 'mains') return item.type === 'non-veg';
                            return true;
                        });

                        const baseItems = filteredItems.filter(i => !i.isPremium);
                        const premiumItems = filteredItems.filter(i => i.isPremium);

                        const renderItemCard = (item) => {
                            const isSelected = currentConfig[activeTab].find(i => i.id === item.id);
                            return (
                                <div key={item.id} className={`bg-white rounded-2xl p-2 border shadow-sm relative overflow-hidden flex flex-col cursor-pointer transition-all hover:shadow-md ${isSelected ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-100 hover:border-gray-300'}`}>
                                    <div className="aspect-square rounded-xl bg-gray-100 mb-2 overflow-hidden relative">
                                        <img src={item.img} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" alt={item.name} />
                                        {item.type === 'veg' ? (
                                            <div className="absolute top-1 left-1 w-3 h-3 bg-white rounded-sm border border-green-600 flex items-center justify-center">
                                                <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                                            </div>
                                        ) : (
                                            <div className="absolute top-1 left-1 w-3 h-3 bg-white rounded-sm border border-red-600 flex items-center justify-center">
                                                <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-gray-900 text-xs leading-tight mb-1 line-clamp-2">{item.name}</h3>
                                    {item.isPremium && (
                                        <span className="text-[10px] text-amber-600 font-bold mb-1">+ ₹{item.price}</span>
                                    )}

                                    <button
                                        onClick={() => toggleItem(activeTab, item)}
                                        className={`mt-auto w-full py-1.5 rounded-lg text-[10px] font-bold transition-all ${isSelected ? 'bg-green-600 text-white' : 'bg-white border border-green-600 text-green-600 hover:bg-green-50'}`}
                                    >
                                        {isSelected ? 'ADDED' : 'ADD'}
                                    </button>
                                </div>
                            );
                        };

                        return (
                            <div className="space-y-6">
                                {/* Base Items */}
                                {baseItems.length > 0 && (
                                    <div>
                                        <h2 className="text-sm font-bold text-gray-700 mb-3 capitalize">Base items</h2>
                                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                                            {baseItems.map(renderItemCard)}
                                        </div>
                                    </div>
                                )}

                                {/* Upgrade Items */}
                                {premiumItems.length > 0 && (
                                    <div className="bg-amber-50 -mx-4 px-4 py-4 md:rounded-2xl md:mx-0">
                                        <div className="flex items-center gap-2 mb-3">
                                            <h2 className="text-sm font-bold text-gray-900">Upgrade items</h2>
                                            <span className="text-lg">✨</span>
                                        </div>
                                        <p className="text-[10px] text-gray-500 mb-3">More choices to substitute regular items</p>
                                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                                            {premiumItems.map(renderItemCard)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-lg z-50 md:sticky md:bottom-0 md:border-t-0">
                <div className="max-w-7xl mx-auto flex justify-between items-center bg-white md:bg-transparent md:border md:border-gray-100 md:shadow-sm md:rounded-2xl md:p-4 md:mb-4">
                    <div>
                        <div className="flex items-center gap-1 cursor-pointer">
                            <span className="text-xl font-bold text-gray-900">₹{calculateTotal()}</span>
                            <ChevronDown size={16} className="text-gray-400" />
                        </div>
                        <span className="text-xs text-gray-400">per plate ({activeGuestType})</span>
                    </div>
                    <button
                        onClick={handleNext}
                        className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-green-700 transition-colors shadow-lg shadow-green-200"
                    >
                        {/* If both and on veg, say "Next: Non-Veg" */}
                        {preference === 'both' && activeGuestType === 'veg' ? 'Next: Non-Veg >' : (activeTab === categories[categories.length - 1] ? 'Review Order' : 'Next')}
                    </button>
                </div>
            </div>

        </div>
    );
};

export default CustomizeMealPage;
