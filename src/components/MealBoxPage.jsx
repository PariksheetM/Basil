import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, MapPin, LogOut, ArrowRight, Leaf, Star, TrendingUp, Clock, Check } from 'lucide-react';
import { imgUrl } from '../utils/imgUrl.js';
import MenuPreferenceModal from './MenuPreferenceModal';
import AuthService from '../services/authService';
import BrandLogo from './BrandLogo';
import './MealBoxPage.css';

const ICON_MAP = { spa: Leaf, star: Star, trending_up: TrendingUp, timer: Clock, arrow_forward: ArrowRight, done: Check };
const MIcon = ({ name, size = 16 }) => { const C = ICON_MAP[name]; return C ? <C size={size} /> : null; };

const heroBanners = [
    {
        id: 'hero-meal-01',
        kicker: 'Culinary Craft',
        title: 'Premium Meal Boxes.',
        description: 'Chef-curated menus crafted with passion and delivered with absolute sophistication.',
        image: 'https://images.unsplash.com/photo-1481833761820-0509d3217039?auto=format&fit=crop&w=1600&q=80',
    },
    {
        id: 'hero-meal-02',
        kicker: 'Corporate Ready',
        title: 'Elevate Your Events.',
        description: 'Tailored perfectly for boardroom meetings, workshops, and executive off-sites.',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80',
    }
];

const dietBadgeStyles = {
    veg: { wrapper: 'diet-pill veg', label: 'Veg' },
    'non-veg': { wrapper: 'diet-pill non-veg', label: 'Non-Veg' },
    both: { wrapper: 'diet-pill both', label: 'Veg & Non-Veg' },
    satvik: { wrapper: 'diet-pill satvik', label: 'Satvik' },
};

const formatCurrency = (value) => `₹${value.toLocaleString('en-IN')}`;

// Re-using the same packages data...
const baseMealPackages = [
    {
        id: 'satvik-harmony-box',
        name: 'Satvik Harmony Box',
        cuisine: 'Satvik',
        diet: 'satvik',
        price: 275,
        description: 'Pure no onion, no garlic meal service crafted for pooja ceremonies.',
        image: '/pooja-thali.png',
        badge: { label: 'SATVIK ONLY', icon: 'spa', classes: 'badge satvik' },
        features: ['Kuttu Poori & Jeera Aloo', 'Moong Dal Tadka', 'Kesari Halwa Dessert'],
        isAvailable: true,
        highlighted: true,
        ctaVariant: 'primary',
        customization: {
            category: 'SATVIK', basePrice: 275,
            proteins: [
                { id: 'satvik-paneer', label: 'Paneer Makhani (Satvik)', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                { id: 'satvik-dal', label: 'Moong Dal Tadka', priceDelta: 0, includedLabel: 'Included' },
            ],
            bases: [
                { id: 'satvik-puri', label: 'Kuttu Poori', priceDelta: 0, includedLabel: 'Included', isDefault: true },
            ],
            addOns: [
                { id: 'satvik-ladoo', label: 'Besan Ladoo (2pc)', priceDelta: 25, description: 'Freshly prepared' },
            ],
        },
    },
    {
        id: 'north-indian-executive',
        name: 'North Indian Executive',
        cuisine: 'North Indian',
        diet: 'veg',
        price: 299,
        description: 'Perfect balance of flavors with premium paneer gravy and dal makhani.',
        image: '/meal-box-salad.png',
        badge: { label: 'BEST SELLER', icon: 'star', classes: 'badge bestseller' },
        prepLabel: { icon: 'timer', text: '45-60 min prep' },
        features: ['Paneer Butter Masala (150g)', 'Dal Makhani (150g)', 'Jeera Rice + 2 Butter Naan'],
        isAvailable: true,
        ctaVariant: 'outline',
        customization: {
            category: 'NORTH INDIAN', basePrice: 299,
            proteins: [
                { id: 'ni-paneer', label: 'Paneer Butter Masala', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                { id: 'ni-chicken', label: 'Butter Chicken', priceDelta: 40, includedLabel: '+ ₹40' },
            ],
            bases: [
                { id: 'ni-jeera', label: 'Jeera Rice', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                { id: 'ni-peas', label: 'Peas Pulao', priceDelta: 20, includedLabel: '+ ₹20' },
            ],
            addOns: [
                { id: 'ni-gulab', label: 'Gulab Jamun (2pc)', priceDelta: 30, description: 'Warm dessert to finish' },
            ],
        },
    },
    {
        id: 'asian-wellness-bowl',
        name: 'Asian Wellness Bowl',
        cuisine: 'Asian',
        diet: 'non-veg',
        price: 350,
        description: 'Light yet filling. Grilled chicken with quinoa and fresh greens.',
        image: '/vegan-falafel.png',
        badge: { label: 'TRENDING', icon: 'trending_up', classes: 'badge trending' },
        features: ['Teriyaki Glazed Chicken', 'Quinoa & Edamame Base', 'Sesame Broccoli Salad'],
        isAvailable: true,
        highlighted: true,
        ctaVariant: 'primary',
        customization: {
            category: 'ASIAN', basePrice: 350,
            proteins: [
                { id: 'asia-chicken', label: 'Teriyaki Glazed Chicken', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                { id: 'asia-tofu', label: 'Grilled Tofu & Mushroom', priceDelta: 0, includedLabel: 'Included' },
            ],
            bases: [
                { id: 'asia-quinoa', label: 'Quinoa & Edamame', priceDelta: 20, includedLabel: '+ ₹20', isDefault: true },
            ],
            addOns: [
                { id: 'asia-matcha', label: 'Matcha Green Tea', priceDelta: 40, description: 'Chilled beverage, 200ml' },
            ],
        },
    },
    {
        id: 'continental-deluxe',
        name: 'Continental Deluxe',
        cuisine: 'Continental',
        diet: 'veg',
        price: 420,
        description: 'Gourmet pasta selection with garlic bread and tiramisu.',
        image: '/continental-morning.png',
        features: ['Arrabbiata Penne Pasta', 'Cheese Garlic Bread (2pc)', 'Greek Salad Bowl'],
        isAvailable: true,
        ctaVariant: 'outline',
        customization: {
            category: 'CONTINENTAL', basePrice: 420,
            proteins: [
                { id: 'conti-veggie', label: 'Roasted Vegetable Medley', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                { id: 'conti-chicken', label: 'Herb Grilled Chicken', priceDelta: 40, includedLabel: '+ ₹40' },
            ],
            bases: [
                { id: 'conti-penne', label: 'Arrabbiata Penne', priceDelta: 0, includedLabel: 'Included', isDefault: true },
            ],
            addOns: [
                { id: 'conti-tiramisu', label: 'Mini Tiramisu Jar', priceDelta: 60, description: 'Authentic Italian dessert' },
            ],
        },
    },
];

const preferenceLabels = {
    veg: 'Pure Vegetarian',
    'non-veg': 'Mixed Menu',
    satvik: 'Satvik Only',
};

const MealBoxPage = () => {
    const navigate = useNavigate();
    const [guestCount, setGuestCount] = useState(50);
    const [budget, setBudget] = useState(450);
    const [selectedCuisine, setSelectedCuisine] = useState('All');
    const [selectedPackageId, setSelectedPackageId] = useState('');
    const [selectedProteinId, setSelectedProteinId] = useState('');
    const [selectedBaseId, setSelectedBaseId] = useState('');
    const [selectedAddOnIds, setSelectedAddOnIds] = useState([]);

    // Removing the modal state specifically for customization, as we are displaying it in the sidebar initially
    const [isPreferenceModalOpen, setIsPreferenceModalOpen] = useState(false);
    const [menuPreference, setMenuPreference] = useState('');
    const [occasionKey, setOccasionKey] = useState('');
    const [deliveryLocation, setDeliveryLocation] = useState('Mumbai Corporate Park');
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
        }, 8000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setOccasionKey(window.localStorage.getItem('selectedOccasionKey') || '');
            const storedCity = window.localStorage.getItem('selectedCity');
            if (storedCity) {
                setDeliveryLocation(`${storedCity} Corporate Park`);
            }
        }
    }, []);

    const isPoojaOccasion = occasionKey === 'pooja';

    const availablePackages = useMemo(() => {
        if (!isPoojaOccasion) return baseMealPackages.slice();
        return baseMealPackages.filter((pkg) => pkg.diet !== 'non-veg').sort((a, b) => a.diet === 'satvik' ? -1 : 1);
    }, [isPoojaOccasion]);

    useEffect(() => {
        if (!availablePackages.length) {
            setSelectedPackageId('');
            return;
        }
        if (!selectedPackageId || !availablePackages.some((pkg) => pkg.id === selectedPackageId)) {
            setSelectedPackageId(availablePackages[0].id);
        }
    }, [availablePackages, selectedPackageId]);

    const cuisineFilters = useMemo(() => ['All', ...Array.from(new Set(availablePackages.map((pkg) => pkg.cuisine)))], [availablePackages]);

    const filteredPackages = useMemo(() => {
        return availablePackages.filter((pkg) => {
            const matchesCuisine = selectedCuisine === 'All' || pkg.cuisine === selectedCuisine;
            const matchesBudget = pkg.price <= budget + 50;
            return matchesCuisine && matchesBudget;
        });
    }, [availablePackages, selectedCuisine, budget]);

    const selectedPackage = useMemo(() => availablePackages.find((pkg) => pkg.id === selectedPackageId) ?? null, [availablePackages, selectedPackageId]);

    useEffect(() => {
        if (!selectedPackage?.customization) {
            setSelectedProteinId('');
            setSelectedBaseId('');
            setSelectedAddOnIds([]);
            return;
        }
        const defaults = selectedPackage.customization;
        setSelectedProteinId(defaults.proteins.find((opt) => opt.isDefault)?.id || defaults.proteins[0]?.id || '');
        setSelectedBaseId(defaults.bases.find((opt) => opt.isDefault)?.id || defaults.bases[0]?.id || '');
        setSelectedAddOnIds([]);
    }, [selectedPackageId, selectedPackage]);

    const selectedProtein = selectedPackage?.customization?.proteins.find((opt) => opt.id === selectedProteinId);
    const selectedBase = selectedPackage?.customization?.bases.find((opt) => opt.id === selectedBaseId);
    const addOnOptions = selectedPackage?.customization?.addOns ?? [];
    const selectedAddOns = addOnOptions.filter((opt) => selectedAddOnIds.includes(opt.id));

    const basePrice = selectedPackage?.customization?.basePrice ?? selectedPackage?.price ?? 0;
    const proteinDelta = selectedProtein?.priceDelta ?? 0;
    const baseDelta = selectedBase?.priceDelta ?? 0;
    const addOnsDelta = selectedAddOns.reduce((total, opt) => total + (opt.priceDelta || 0), 0);
    const updatedPricePerPlate = basePrice + proteinDelta + baseDelta + addOnsDelta;
    const estimateTotal = Math.round(updatedPricePerPlate * guestCount);

    const adjustGuests = (delta) => setGuestCount((prev) => Math.max(1, prev + delta));
    const toggleAddOn = (id) => setSelectedAddOnIds((prev) => prev.includes(id) ? prev.filter((adId) => adId !== id) : [...prev, id]);

    const handlePackageSelection = (pkg) => {
        if (pkg.isAvailable) {
            setSelectedPackageId(pkg.id);
            // Scroll logic could go here to snap sidebar into view on mobile
        }
    };

    const handleCheckout = () => {
        setIsPreferenceModalOpen(true);
    };

    const handlePreferenceConfirm = (preference) => {
        if (!selectedPackage) return setIsPreferenceModalOpen(false);
        const resolvedPreference = isPoojaOccasion ? 'satvik' : preference;
        setMenuPreference(resolvedPreference);
        setIsPreferenceModalOpen(false);

        // Simulating routing to deeper customize page...
        navigate('/customize-meal', {
            state: {
                package: { ...selectedPackage, basePrice: selectedPackage.customization?.basePrice ?? selectedPackage.price, minGuests: Math.max(25, guestCount) },
                guestCount,
                preference: resolvedPreference,
                occasionKey,
            },
        });
    };

    const handleLogout = async () => {
        try { await AuthService.logout(); }
        finally {
            if (typeof window !== 'undefined') {
                ['selectedCity', 'selectedOccasion', 'selectedOccasionKey', 'selectedOccasionLabel'].forEach(k => window.localStorage.removeItem(k));
            }
            navigate('/');
        }
    };

    return (
        <div className="menu-page">
            <header className="menu-nav">
                <div className="nav-inner">
                    <div className="nav-left">
                        <BrandLogo labelClassName="brandmark-label" imgClassName="brandmark-image" />
                    </div>
                    <div className="nav-right">
                        <div className="delivery-chip">
                            <MapPin size={14} />
                            <span>{deliveryLocation}</span>
                        </div>
                        <button type="button" className="ghost-link" onClick={handleLogout}>
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main>
                <section className="menu-hero">
                    <div className="shell">
                        <div className="hero-banner">
                            <img className="hero-banner__bg" src={imgUrl(heroBanners[currentSlide].image)} alt="Hero Banner" />
                            <div className="hero-banner__overlay"></div>
                            <div className="hero-banner__content">
                                <p className="hero-banner__kicker">{heroBanners[currentSlide].kicker}</p>
                                <h1>{heroBanners[currentSlide].title}</h1>
                                <p>{heroBanners[currentSlide].description}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="menu-controls">
                    <div className="shell">
                        <div className="controls-dashboard">
                            <div className="control-group">
                                <span className="control-label">Guest Count</span>
                                <div className="stepper">
                                    <button type="button" onClick={() => adjustGuests(-5)}>
                                        <Minus size={16} />
                                    </button>
                                    <span>{guestCount}</span>
                                    <button type="button" onClick={() => adjustGuests(5)}>
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="control-group">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span className="control-label">Budget Per Plate</span>
                                    <span className="budget-scale highlight">₹{budget}</span>
                                </div>
                                <div className="budget-control">
                                    <input type="range" min={200} max={600} step={25} value={budget} onChange={(e) => setBudget(Number(e.target.value))} />
                                    <div className="budget-scale">
                                        <span>₹200</span>
                                        <span>₹600+</span>
                                    </div>
                                </div>
                            </div>

                            <div className="control-group" style={{ alignItems: 'flex-start' }}>
                                <span className="control-label">Cuisine Focus</span>
                                <div className="chip-row">
                                    {cuisineFilters.map((filter) => (
                                        <button key={filter} type="button" className={`chip ${selectedCuisine === filter ? 'is-active' : ''}`} onClick={() => setSelectedCuisine(filter)}>
                                            {filter}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="menu-content">
                    <div className="shell menu-layout">

                        {/* FLIPPED: Sidebar is now on the LEFT */}
                        <aside className="menu-aside">
                            <div className="aside-panel">
                                <header className="aside-header">
                                    <div>
                                        <h3>Your Box</h3>
                                        <p>{selectedPackage?.name || 'Select a box to begin.'}</p>
                                    </div>
                                    {selectedPackage?.customization?.category && (
                                        <span className="category-pill">{selectedPackage.customization.category}</span>
                                    )}
                                </header>

                                <div className="price-tile">
                                    <span>Base</span>
                                    <strong>{formatCurrency(basePrice)}</strong>
                                </div>

                                <div className="aside-scroll">
                                    {selectedPackage?.customization ? (
                                        <>
                                            <section>
                                                <div className="section-heading">
                                                    <span>01</span>
                                                    <h4>Protein / Main</h4>
                                                </div>
                                                <div className="option-stack">
                                                    {selectedPackage.customization.proteins.map((opt) => (
                                                        <label key={opt.id} className={`custom-option ${selectedProteinId === opt.id ? 'is-active' : ''}`}>
                                                            <span>
                                                                <input type="radio" checked={selectedProteinId === opt.id} onChange={() => setSelectedProteinId(opt.id)} />
                                                                {opt.label}
                                                            </span>
                                                            <em>{opt.priceDelta > 0 ? `+ ₹${opt.priceDelta}` : 'Incl.'}</em>
                                                        </label>
                                                    ))}
                                                </div>
                                            </section>

                                            <section>
                                                <div className="section-heading">
                                                    <span>02</span>
                                                    <h4>Carb / Base</h4>
                                                </div>
                                                <div className="option-stack">
                                                    {selectedPackage.customization.bases.map((opt) => (
                                                        <label key={opt.id} className={`custom-option ${selectedBaseId === opt.id ? 'is-active' : ''}`}>
                                                            <span>
                                                                <input type="radio" checked={selectedBaseId === opt.id} onChange={() => setSelectedBaseId(opt.id)} />
                                                                {opt.label}
                                                            </span>
                                                            <em>{opt.priceDelta > 0 ? `+ ₹${opt.priceDelta}` : 'Incl.'}</em>
                                                        </label>
                                                    ))}
                                                </div>
                                            </section>

                                            {addOnOptions.length > 0 && (
                                                <section>
                                                    <div className="section-heading">
                                                        <span>03</span>
                                                        <h4>Add-ons</h4>
                                                    </div>
                                                    <div className="option-stack">
                                                        {addOnOptions.map((opt) => (
                                                            <label key={opt.id} className={`custom-option checkbox ${selectedAddOnIds.includes(opt.id) ? 'is-active' : ''}`}>
                                                                <span>
                                                                    <input type="checkbox" checked={selectedAddOnIds.includes(opt.id)} onChange={() => toggleAddOn(opt.id)} />
                                                                    <div>
                                                                        <strong>{opt.label}</strong>
                                                                        <p>{opt.description}</p>
                                                                    </div>
                                                                </span>
                                                                <em>+ ₹{opt.priceDelta}</em>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </section>
                                            )}
                                        </>
                                    ) : (
                                        <p className="placeholder-text">Please select a compatible package on the right.</p>
                                    )}
                                </div>

                                <div className="aside-footer">
                                    <div className="estimate-row">
                                        <div>
                                            <span>Est. Total ({guestCount} Guests)</span>
                                            <strong>{formatCurrency(estimateTotal)}</strong>
                                        </div>
                                    </div>
                                    <button type="button" className="primary-cta" onClick={handleCheckout} disabled={!selectedPackage}>
                                        Proceed to Checkout
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </aside>

                        {/* GRID is now on the RIGHT */}
                        <div className="menu-main">
                            <div className="menu-heading">
                                <span className="eyebrow">Discover the Menu</span>
                                <h3>Curated Packages</h3>
                                <p className="subtext">Displaying {filteredPackages.length} options matching your budget and preferences.</p>
                            </div>

                            {isPoojaOccasion && (
                                <div className="satvik-banner">
                                    <Leaf size={18} />
                                    Viewing Satvik-only options based on your selected "Pooja" event context.
                                </div>
                            )}

                            <div className="package-grid">
                                {filteredPackages.map((pkg) => {
                                    const dietStyles = dietBadgeStyles[pkg.diet] || dietBadgeStyles.veg;
                                    const isSelected = pkg.id === selectedPackageId;

                                    return (
                                        <article
                                            key={pkg.id}
                                            className={`package-card ${isSelected ? 'is-selected' : ''} ${!pkg.isAvailable ? 'is-disabled' : ''}`}
                                            onClick={() => handlePackageSelection(pkg)}
                                        >
                                            <div className="package-card__media">
                                                <img src={imgUrl(pkg.image)} alt={pkg.name} />
                                                {pkg.badge && (
                                                    <span className={`badge ${pkg.badge.classes.split(' ')[1]}`}>
                                                        <MIcon name={pkg.badge.icon} size={14} />
                                                        {pkg.badge.label}
                                                    </span>
                                                )}
                                                {pkg.prepLabel && (
                                                    <span className="prep-chip">
                                                        <MIcon name={pkg.prepLabel.icon} size={14} />
                                                        {pkg.prepLabel.text}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="package-card__body">
                                                <header>
                                                    <div>
                                                        <h4>{pkg.name}</h4>
                                                        <p>{pkg.description}</p>
                                                    </div>
                                                </header>
                                                <div style={{ paddingBottom: '12px' }}>
                                                    <span className={dietStyles.wrapper}>{dietStyles.label}</span>
                                                </div>
                                                <ul className="feature-list">
                                                    {pkg.features.map((feature, i) => (
                                                        <li key={i}>
                                                            <Check size={14} />
                                                            {feature}
                                                        </li>
                                                    ))}
                                                </ul>
                                                <footer>
                                                    <div className="card-price">
                                                        <strong>{formatCurrency(pkg.price)}</strong>
                                                        <small>per plate</small>
                                                    </div>
                                                    <button type="button" className="ghost-cta">
                                                        {isSelected ? 'Selected' : 'Select'}
                                                    </button>
                                                </footer>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                </section>
            </main>

            {isPreferenceModalOpen && (
                <MenuPreferenceModal
                    isOpen={isPreferenceModalOpen}
                    onClose={() => setIsPreferenceModalOpen(false)}
                    onConfirm={handlePreferenceConfirm}
                    initialPreference={menuPreference}
                    forceSatvik={isPoojaOccasion}
                />
            )}
        </div>
    );
};

export default MealBoxPage;
