import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MenuPreferenceModal from './MenuPreferenceModal';
import AuthService from '../services/authService';
import BrandLogo from './BrandLogo';
import './MealBoxPage.css';

const heroSlides = [
    {
        id: 'hero-meal-01',
        kicker: 'Culinary Craft',
        title: 'Culinary Excellence for Every Occasion.',
        description: 'Crafted with passion, delivered with sophistication. Elevate your gatherings with bespoke meal boxes.',
        image: 'https://images.unsplash.com/photo-1481833761820-0509d3217039?auto=format&fit=crop&w=1600&q=80',
    },
    {
        id: 'hero-meal-02',
        kicker: 'Corporate Ready',
        title: 'Delicious Catering for Custom Events.',
        description: 'Chef-led menus tailored for workshops, reviews, product launches, and executive off-sites.',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80',
    },
    {
        id: 'hero-meal-03',
        kicker: 'Satvik Specials',
        title: 'Pure Satvik Menus for Sacred Ceremonies.',
        description: 'No onion, no garlic preparations plated beautifully for pooja gatherings and spiritual events.',
        image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1600&q=80',
    },
];

const dietBadgeStyles = {
    veg: {
        wrapper: 'diet-pill veg',
        label: 'Veg',
    },
    'non-veg': {
        wrapper: 'diet-pill non-veg',
        label: 'Non-Veg',
    },
    both: {
        wrapper: 'diet-pill both',
        label: 'Veg & Non-Veg',
    },
    satvik: {
        wrapper: 'diet-pill satvik',
        label: 'Satvik',
    },
};

const formatCurrency = (value) => `₹${value.toLocaleString('en-IN')}`;
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
            category: 'SATVIK',
            basePrice: 275,
            proteins: [
                { id: 'satvik-paneer', label: 'Paneer Makhani (Satvik)', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                { id: 'satvik-dal', label: 'Moong Dal Tadka', priceDelta: 0, includedLabel: 'Included' },
                { id: 'satvik-lauki', label: 'Lauki Kofta', priceDelta: 20, includedLabel: '+ ₹20' },
            ],
            bases: [
                { id: 'satvik-puri', label: 'Kuttu Poori', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                { id: 'satvik-millet', label: 'Little Millet Khichdi', priceDelta: 15, includedLabel: '+ ₹15' },
            ],
            addOns: [
                { id: 'satvik-ladoo', label: 'Besan Ladoo (2pc)', priceDelta: 25, description: 'Freshly prepared' },
                { id: 'satvik-fruit', label: 'Seasonal Fruit Cup', priceDelta: 18, description: 'Cut fruits' },
            ],
        },
    },
    {
        id: 'temple-prasad-classic',
        name: 'Temple Prasad Classic',
        cuisine: 'Prasad',
        diet: 'veg',
        price: 235,
        description: 'Traditional prasad meal box with sweets, fruits, and satvik staples.',
        image: '/snack-box-coffee.png',
        badge: { label: 'POOJA FAVORITE', icon: 'local_florist', classes: 'badge pooja' },
        features: ['Kesari Bath & Panchamrit', 'Dry Fruit Mix', 'Tulsi Infused Water'],
        isAvailable: true,
        ctaVariant: 'outline',
        customization: {
            category: 'PRASAD',
            basePrice: 235,
            proteins: [
                { id: 'prasad-kesar', label: 'Kesari Bath', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                { id: 'prasad-sheera', label: 'Sooji Sheera', priceDelta: 0, includedLabel: 'Included' },
                { id: 'prasad-sabudana', label: 'Sabudana Khichdi', priceDelta: 20, includedLabel: '+ ₹20' },
            ],
            bases: [
                { id: 'prasad-leaf', label: 'Areca Leaf Platter', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                { id: 'prasad-bowl', label: 'Eco Bowl Pack', priceDelta: 18, includedLabel: '+ ₹18' },
            ],
            addOns: [
                { id: 'prasad-panchamrit', label: 'Panchamrit Vial', priceDelta: 12, description: '100 ml' },
                { id: 'prasad-flower', label: 'Marigold Garland', priceDelta: 16, description: 'Single string' },
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
            category: 'NORTH INDIAN',
            basePrice: 299,
            proteins: [
                { id: 'ni-paneer', label: 'Paneer Butter Masala', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                { id: 'ni-dal', label: 'Dal Makhani', priceDelta: 0, includedLabel: 'Included' },
                { id: 'ni-chicken', label: 'Butter Chicken', priceDelta: 40, includedLabel: '+ ₹40' },
            ],
            bases: [
                { id: 'ni-jeera', label: 'Jeera Rice', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                { id: 'ni-peas', label: 'Peas Pulao', priceDelta: 20, includedLabel: '+ ₹20' },
            ],
            addOns: [
                { id: 'ni-gulab', label: 'Gulab Jamun (2pc)', priceDelta: 30, description: 'Warm dessert to finish' },
                { id: 'ni-salad', label: 'Kachumber Salad', priceDelta: 20, description: 'Fresh crunchy salad' },
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
            category: 'ASIAN',
            basePrice: 350,
            proteins: [
                { id: 'asia-chicken', label: 'Teriyaki Glazed Chicken', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                { id: 'asia-tofu', label: 'Grilled Tofu & Mushroom', priceDelta: 0, includedLabel: 'Included' },
                { id: 'asia-prawns', label: 'Lemongrass Prawns', priceDelta: 50, includedLabel: '+ ₹50' },
            ],
            bases: [
                { id: 'asia-jasmine', label: 'Jasmine Rice', priceDelta: 0, includedLabel: 'Included' },
                { id: 'asia-quinoa', label: 'Quinoa & Edamame', priceDelta: 20, includedLabel: '+ ₹20', isDefault: true },
            ],
            addOns: [
                { id: 'asia-matcha', label: 'Matcha Green Tea', priceDelta: 40, description: 'Chilled beverage, 200ml' },
                { id: 'asia-dimsum', label: 'Dim Sum Basket (2pc)', priceDelta: 80, description: 'Veg crystal dumplings' },
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
            category: 'CONTINENTAL',
            basePrice: 420,
            proteins: [
                { id: 'conti-veggie', label: 'Roasted Vegetable Medley', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                { id: 'conti-chicken', label: 'Herb Grilled Chicken', priceDelta: 40, includedLabel: '+ ₹40' },
                { id: 'conti-fish', label: 'Lemon Butter Fish', priceDelta: 60, includedLabel: '+ ₹60' },
            ],
            bases: [
                { id: 'conti-penne', label: 'Arrabbiata Penne', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                { id: 'conti-risotto', label: 'Wild Mushroom Risotto', priceDelta: 30, includedLabel: '+ ₹30' },
            ],
            addOns: [
                { id: 'conti-tiramisu', label: 'Mini Tiramisu Jar', priceDelta: 60, description: 'Authentic Italian dessert' },
                { id: 'conti-soup', label: 'Roasted Tomato Soup', priceDelta: 40, description: 'Served hot, 200ml' },
            ],
        },
    },
    {
        id: 'southern-spice',
        name: 'Southern Spice Feast',
        cuisine: 'South Indian',
        diet: 'veg',
        price: 275,
        description: 'Traditional meal with authentic spices from Kerala.',
        image: '/idli-sambar.png',
        features: ['Avial & Thoran', 'Red Rice / Parotta'],
        isAvailable: false,
        ctaVariant: 'disabled',
        customization: {
            category: 'SOUTH INDIAN',
            basePrice: 275,
            proteins: [
                { id: 'south-sambar', label: 'Temple Style Sambar', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                { id: 'south-korma', label: 'Vegetable Korma', priceDelta: 20, includedLabel: '+ ₹20' },
            ],
            bases: [
                { id: 'south-rice', label: 'Red Matta Rice', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                { id: 'south-parotta', label: 'Malabar Parotta', priceDelta: 15, includedLabel: '+ ₹15' },
            ],
            addOns: [
                { id: 'south-payasam', label: 'Ada Pradhaman', priceDelta: 35, description: 'Traditional payasam dessert' },
                { id: 'south-chips', label: 'Banana Chips Pack', priceDelta: 25, description: 'Fresh fried chips' },
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
    const [isPreferenceModalOpen, setIsPreferenceModalOpen] = useState(false);
    const [menuPreference, setMenuPreference] = useState('');
    const [occasionKey, setOccasionKey] = useState('');
    const [deliveryLocation, setDeliveryLocation] = useState('Mumbai Corporate Park');
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 6000);

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
        if (!isPoojaOccasion) {
            return baseMealPackages.slice();
        }

        const filtered = baseMealPackages.filter((pkg) => pkg.diet !== 'non-veg');
        return filtered.sort((a, b) => {
            if (a.diet === b.diet) {
                return 0;
            }
            if (a.diet === 'satvik') {
                return -1;
            }
            if (b.diet === 'satvik') {
                return 1;
            }
            return 0;
        });
    }, [isPoojaOccasion]);

    const pageSubtitle = isPoojaOccasion
        ? 'Satvik & pure veg boxes curated for pooja ceremonies and spiritual gatherings.'
        : 'Curated for corporate meetings and team lunches.';

    useEffect(() => {
        if (!availablePackages.length) {
            setSelectedPackageId('');
            return;
        }

        if (!selectedPackageId || !availablePackages.some((pkg) => pkg.id === selectedPackageId)) {
            setSelectedPackageId(availablePackages[0].id);
        }
    }, [availablePackages, selectedPackageId]);

    const cuisineFilters = useMemo(() => {
        const uniques = Array.from(new Set(availablePackages.map((pkg) => pkg.cuisine)));
        return ['All', ...uniques];
    }, [availablePackages]);

    const filteredPackages = useMemo(() => {
        return availablePackages.filter((pkg) => {
            const matchesCuisine = selectedCuisine === 'All' || pkg.cuisine === selectedCuisine;
            const matchesBudget = pkg.price <= budget + 50;
            return matchesCuisine && matchesBudget;
        });
    }, [availablePackages, selectedCuisine, budget]);

    const selectedPackage = useMemo(
        () => availablePackages.find((pkg) => pkg.id === selectedPackageId) ?? null,
        [availablePackages, selectedPackageId]
    );

    useEffect(() => {
        if (!selectedPackage) {
            setSelectedProteinId('');
            setSelectedBaseId('');
            setSelectedAddOnIds([]);
            return;
        }

        const defaults = selectedPackage.customization;
        if (!defaults) {
            setSelectedProteinId('');
            setSelectedBaseId('');
            setSelectedAddOnIds([]);
            return;
        }

        const defaultProtein = defaults.proteins.find((opt) => opt.isDefault) || defaults.proteins[0];
        const defaultBase = defaults.bases.find((opt) => opt.isDefault) || defaults.bases[0];

        setSelectedProteinId(defaultProtein?.id ?? '');
        setSelectedBaseId(defaultBase?.id ?? '');
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
    const itemsAddedLabel = `${Math.max(1, 1 + selectedAddOns.length)} Item${selectedAddOns.length ? 's' : ''} Added`;

    const adjustGuests = (delta) => {
        setGuestCount((prev) => {
            const next = prev + delta;
            if (next < 1) {
                return 1;
            }
            return next;
        });
    };

    const toggleAddOn = (id) => {
        setSelectedAddOnIds((prev) => (prev.includes(id) ? prev.filter((addOnId) => addOnId !== id) : [...prev, id]));
    };

    const openPreferenceModal = (packageId) => {
        if (packageId) {
            setSelectedPackageId(packageId);
        }
        setIsPreferenceModalOpen(true);
    };

    const handlePreferenceConfirm = (preference) => {
        if (!selectedPackage) {
            setIsPreferenceModalOpen(false);
            return;
        }

        const packageState = {
            id: selectedPackage.id,
            name: selectedPackage.name,
            image: selectedPackage.image,
            description: selectedPackage.description,
            basePrice: selectedPackage.customization?.basePrice ?? selectedPackage.price,
            minGuests: guestCount < 25 ? guestCount : 25,
            customization: selectedPackage.customization,
        };

        const resolvedPreference = isPoojaOccasion ? 'satvik' : preference;

        setMenuPreference(resolvedPreference);
        setIsPreferenceModalOpen(false);

        navigate('/customize-meal', {
            state: {
                package: packageState,
                guestCount,
                preference: resolvedPreference,
                occasionKey,
            },
        });
    };

    const handleLogout = async () => {
        try {
            await AuthService.logout();
        } finally {
            if (typeof window !== 'undefined') {
                window.localStorage.removeItem('selectedCity');
                window.localStorage.removeItem('selectedOccasion');
                window.localStorage.removeItem('selectedOccasionKey');
                window.localStorage.removeItem('selectedOccasionLabel');
            }
            navigate('/');
        }
    };

    const goToPreviousSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    };

    const goToNextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    };

    return (
        <div className="menu-page">
            <header className="menu-nav">
                <div className="shell nav-inner">
                    <div className="nav-left">
                        <BrandLogo
                            labelClassName="brandmark-label"
                            imgClassName="brandmark-image"
                            highlightText="Meal"
                        />
                        <nav className="nav-links">
                            <button type="button" className="is-active">Menus</button>
                            <button type="button">Corporate</button>
                            <button type="button">Events</button>
                        </nav>
                    </div>
                    <div className="nav-right">
                        <div className="delivery-chip">
                            <span className="material-icons">location_on</span>
                            <span>
                                Delivering to <strong>{deliveryLocation}</strong>
                            </span>
                        </div>
                        <button type="button" className="quote-button">Request Quote</button>
                        <button type="button" className="ghost-link" onClick={handleLogout}>
                            <span className="material-icons">logout</span>
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main>
                <section className="menu-hero">
                    <div className="shell">
                        <div className="hero-slider" role="region" aria-label="Featured menu highlights">
                            <div className="hero-slider__track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                                {heroSlides.map((slide, index) => (
                                    <article key={slide.id} className="hero-slide" aria-hidden={currentSlide !== index}>
                                        <img src={slide.image} alt={slide.title} />
                                        <div className="hero-slide__overlay">
                                            <p className="hero-slide__kicker">{slide.kicker}</p>
                                            <h1>{slide.title}</h1>
                                            <p>{slide.description}</p>
                                        </div>
                                    </article>
                                ))}
                            </div>
                            <button type="button" className="hero-slider__control is-left" aria-label="Previous slide" onClick={goToPreviousSlide}>
                                <span className="material-icons">chevron_left</span>
                            </button>
                            <button type="button" className="hero-slider__control is-right" aria-label="Next slide" onClick={goToNextSlide}>
                                <span className="material-icons">chevron_right</span>
                            </button>
                            <div className="hero-slider__dots" role="tablist">
                                {heroSlides.map((slide, index) => (
                                    <button
                                        key={slide.id}
                                        type="button"
                                        role="tab"
                                        aria-selected={currentSlide === index}
                                        aria-label={`Go to slide ${index + 1}`}
                                        className={`hero-slider__dot ${currentSlide === index ? 'is-active' : ''}`}
                                        onClick={() => setCurrentSlide(index)}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="hero-caption">
                            <p className="hero-eyebrow">Delicious Catering for Custom Event</p>
                            <h2>Premium Meal Boxes for {occasionKey === 'pooja' ? 'Sacred Gatherings' : 'Every Event'}</h2>
                            <p>{pageSubtitle} Serving {deliveryLocation}.</p>
                        </div>
                    </div>
                </section>

                <section className="menu-controls">
                    <div className="shell controls-grid">
                        <div className="control-card">
                            <p className="label">Guests</p>
                            <div className="stepper">
                                <button type="button" onClick={() => adjustGuests(-1)}>
                                    <span className="material-icons">remove</span>
                                </button>
                                <span>{guestCount}</span>
                                <button type="button" onClick={() => adjustGuests(1)}>
                                    <span className="material-icons">add</span>
                                </button>
                            </div>
                        </div>
                        <div className="control-card">
                            <p className="label">Budget per plate</p>
                            <div className="budget-control">
                                <input
                                    type="range"
                                    min={150}
                                    max={800}
                                    value={budget}
                                    onChange={(event) => setBudget(Number(event.target.value))}
                                />
                                <div className="budget-scale">
                                    <span>₹150</span>
                                    <span className="highlight">₹{budget}</span>
                                    <span>₹800+</span>
                                </div>
                            </div>
                        </div>
                        <div className="control-card">
                            <p className="label">Cuisine Focus</p>
                            <div className="chip-row">
                                {cuisineFilters.map((filter) => (
                                    <button
                                        key={filter}
                                        type="button"
                                        className={selectedCuisine === filter ? 'chip is-active' : 'chip'}
                                        onClick={() => setSelectedCuisine(filter)}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="menu-content">
                    <div className="shell menu-layout">
                        <div className="menu-main">
                            <div className="menu-heading">
                                <div>
                                    <p className="eyebrow">Recommended for Custom Event</p>
                                    <h3>Premium Meal Boxes</h3>
                                    <p className="subtext">Showing {filteredPackages.length} of {availablePackages.length} curated menus.</p>
                                </div>
                            </div>
                            {isPoojaOccasion && (
                                <div className="satvik-banner">
                                    <span className="material-icons">spa</span>
                                    Satvik-only options are highlighted because you selected the Pooja occasion.
                                </div>
                            )}
                            <div className="package-grid">
                                {filteredPackages.map((pkg) => {
                                    const dietStyles = dietBadgeStyles[pkg.diet] || dietBadgeStyles.veg;
                                    const isSelected = pkg.id === selectedPackageId;
                                    const cardClasses = [
                                        'package-card',
                                        pkg.highlighted ? 'is-highlighted' : '',
                                        !pkg.isAvailable ? 'is-disabled' : '',
                                        isSelected ? 'is-selected' : '',
                                    ]
                                        .filter(Boolean)
                                        .join(' ');

                                    return (
                                        <article key={pkg.id} className={cardClasses}>
                                            <div className="package-card__media">
                                                <img src={pkg.image} alt={pkg.name} />
                                                {pkg.badge && (
                                                    <span className={pkg.badge.classes}>
                                                        <span className="material-icons">{pkg.badge.icon}</span>
                                                        {pkg.badge.label}
                                                    </span>
                                                )}
                                                {pkg.prepLabel && (
                                                    <span className="prep-chip">
                                                        <span className="material-icons">{pkg.prepLabel.icon}</span>
                                                        {pkg.prepLabel.text}
                                                    </span>
                                                )}
                                                {!pkg.isAvailable && (
                                                    <div className="overlay-label">Sold out for today</div>
                                                )}
                                            </div>
                                            <div className="package-card__body">
                                                <header>
                                                    <div>
                                                        <h4>{pkg.name}</h4>
                                                        <p>{pkg.description}</p>
                                                    </div>
                                                    <span className={dietStyles.wrapper}>{dietStyles.label}</span>
                                                </header>
                                                <ul className="feature-list">
                                                    {pkg.features.map((feature) => (
                                                        <li key={feature}>
                                                            <span className="material-icons">check_circle</span>
                                                            {feature}
                                                        </li>
                                                    ))}
                                                </ul>
                                                <footer>
                                                    <div>
                                                        <strong>{formatCurrency(pkg.price)}</strong>
                                                        <small>per plate</small>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => pkg.isAvailable && openPreferenceModal(pkg.id)}
                                                        disabled={!pkg.isAvailable}
                                                        className={pkg.ctaVariant === 'primary' ? 'primary-cta' : pkg.ctaVariant === 'disabled' ? 'disabled-cta' : 'ghost-cta'}
                                                    >
                                                        {pkg.ctaVariant === 'primary' ? 'Customize & Add' : 'Customize'}
                                                        <span className="material-icons">{pkg.ctaVariant === 'primary' ? 'arrow_forward' : 'edit'}</span>
                                                    </button>
                                                </footer>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </div>

                        <aside className="menu-aside">
                            <div className="aside-panel">
                                <header className="aside-header">
                                    <div>
                                        <h3>Customize Meal Box</h3>
                                        <p>{selectedPackage?.name || 'Pick a meal box to begin customization.'}</p>
                                    </div>
                                    {selectedPackage?.customization?.category && (
                                        <span className="category-pill">{selectedPackage.customization.category}</span>
                                    )}
                                </header>
                                {menuPreference && (
                                    <div className="preference-pill">
                                        <span className="material-icons">check_circle</span>
                                        {preferenceLabels[menuPreference]}
                                    </div>
                                )}
                                <div className="price-tile">
                                    <span>Base Price</span>
                                    <strong>
                                        {formatCurrency(basePrice)} <small>/ plate</small>
                                    </strong>
                                </div>
                                <div className="aside-scroll">
                                    {selectedPackage?.customization ? (
                                        <>
                                            <section>
                                                <div className="section-heading">
                                                    <div>
                                                        <span>01</span>
                                                        <h4>Choose Protein</h4>
                                                    </div>
                                                    <small>Required</small>
                                                </div>
                                                <div className="option-stack">
                                                    {selectedPackage.customization.proteins.map((option) => {
                                                        const isActive = selectedProteinId === option.id;
                                                        return (
                                                            <label key={option.id} className={isActive ? 'custom-option is-active' : 'custom-option'}>
                                                                <span>
                                                                    <input
                                                                        type="radio"
                                                                        name="protein"
                                                                        value={option.id}
                                                                        checked={isActive}
                                                                        onChange={() => setSelectedProteinId(option.id)}
                                                                    />
                                                                    {option.label}
                                                                </span>
                                                                <em>{option.priceDelta > 0 ? `+ ₹${option.priceDelta}` : option.includedLabel || 'Included'}</em>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </section>
                                            <section>
                                                <div className="section-heading">
                                                    <div>
                                                        <span>02</span>
                                                        <h4>Choose Base</h4>
                                                    </div>
                                                    <small>Required</small>
                                                </div>
                                                <div className="option-stack">
                                                    {selectedPackage.customization.bases.map((option) => {
                                                        const isActive = selectedBaseId === option.id;
                                                        return (
                                                            <label key={option.id} className={isActive ? 'custom-option is-active' : 'custom-option'}>
                                                                <span>
                                                                    <input
                                                                        type="radio"
                                                                        name="base"
                                                                        value={option.id}
                                                                        checked={isActive}
                                                                        onChange={() => setSelectedBaseId(option.id)}
                                                                    />
                                                                    {option.label}
                                                                </span>
                                                                <em>{option.priceDelta > 0 ? `+ ₹${option.priceDelta}` : option.includedLabel || 'Included'}</em>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </section>
                                            <section>
                                                <div className="section-heading">
                                                    <div>
                                                        <span>03</span>
                                                        <h4>Premium Add-ons</h4>
                                                    </div>
                                                    <small>Optional</small>
                                                </div>
                                                <div className="option-stack">
                                                    {addOnOptions.map((option) => {
                                                        const isActive = selectedAddOnIds.includes(option.id);
                                                        return (
                                                            <label key={option.id} className={isActive ? 'custom-option is-active checkbox' : 'custom-option checkbox'}>
                                                                <span>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isActive}
                                                                        onChange={() => toggleAddOn(option.id)}
                                                                    />
                                                                    <div>
                                                                        <strong>{option.label}</strong>
                                                                        {option.description && <p>{option.description}</p>}
                                                                    </div>
                                                                </span>
                                                                <em>+ ₹{option.priceDelta}</em>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </section>
                                        </>
                                    ) : (
                                        <p className="placeholder-text">Customization options will be available soon for this package.</p>
                                    )}
                                </div>
                                <div className="aside-footer">
                                    <div>
                                        <span>Updated Price</span>
                                        <strong>{formatCurrency(updatedPricePerPlate)}</strong>
                                        <small>per plate (incl. GST)</small>
                                    </div>
                                    <button type="button" className="primary-cta full-width">
                                        <span className="material-icons">check</span>
                                        Update Package
                                    </button>
                                </div>
                            </div>
                        </aside>
                    </div>
                </section>

                <div className="menu-estimate" role="status">
                    <div>
                        <small>Estimate ({guestCount} guests)</small>
                        <strong>{formatCurrency(estimateTotal)}</strong>
                    </div>
                    <div className="divider" />
                    <div className="estimate-actions">
                        <span>{itemsAddedLabel}</span>
                        <button type="button" className="primary-cta">
                            Checkout
                            <span className="material-icons">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </main>

            <MenuPreferenceModal
                isOpen={isPreferenceModalOpen}
                initialPreference={menuPreference}
                onClose={() => setIsPreferenceModalOpen(false)}
                onConfirm={handlePreferenceConfirm}
            />
        </div>
    );
};

export default MealBoxPage;
