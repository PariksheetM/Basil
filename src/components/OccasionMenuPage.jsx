import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Minus, Users, Sliders, Leaf } from 'lucide-react';
import { API_BASE_URL } from '../utils/api.js';
import BrandLogo from './BrandLogo';
import NavCartButton from './NavCartButton';

const dietBadgeStyles = {
    veg: {
        wrapper: 'bg-green-100 text-green-700',
        dot: 'bg-green-500',
        label: 'Veg',
    },
    'non-veg': {
        wrapper: 'bg-red-100 text-red-700',
        dot: 'bg-red-500',
        label: 'Non-Veg',
    },
    both: {
        wrapper: 'bg-orange-100 text-orange-600',
        dot: 'bg-orange-500',
        label: 'Veg & Non-Veg',
    },
    satvik: {
        wrapper: 'bg-amber-100 text-amber-700',
        dot: 'bg-amber-500',
        label: 'Satvik',
    },
};

const dietFilterLabels = {
    all: 'All Menus',
    veg: 'Veg Only',
    'non-veg': 'Non-Veg',
    both: 'Veg & Non-Veg',
    satvik: 'Satvik',
};

const formatCurrency = (value) => `₹${value.toLocaleString('en-IN')}`;
const MEAL_FALLBACK_IMG = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80';
const mealPackagesByOccasion = {};

const OccasionMenuPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [occasionKey, setOccasionKey] = useState('');
    const [selectedCuisine, setSelectedCuisine] = useState('All');
    const [dietFilter, setDietFilter] = useState('all');
    const [guestCount, setGuestCount] = useState(50);
    const [budget, setBudget] = useState(1500); // high default — useEffect will set to actual max once data loads
    const [selectedPackageId, setSelectedPackageId] = useState('');
    const [selectedProteinId, setSelectedProteinId] = useState('');
    const [selectedBaseId, setSelectedBaseId] = useState('');
    const [selectedAddOnIds, setSelectedAddOnIds] = useState([]);
    const [deliveryLocation, setDeliveryLocation] = useState('Mumbai Corporate Park');
    const [partyTypeFilter, setPartyTypeFilter] = useState('all');
    const [venueFilter, setVenueFilter] = useState('all');
    const [liveCounterFilter, setLiveCounterFilter] = useState('all');
    const [apiMeals, setApiMeals] = useState([]);
    const [apiLoaded, setApiLoaded] = useState(false);

    const slugify = (value) =>
        (value || '')
            .toString()
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') || '';

    // Normalize occasion keys for comparison: strip spaces, hyphens, underscores, lowercase
    // Handles: 'houseParty' === 'House Party' === 'house-party'
    const normalizeOcc = (value) =>
        (value || '').toLowerCase().replace(/[\s\-_]+/g, '');

    const flattenMealFeatures = (items) => {
        if (!items) return [];
        if (Array.isArray(items) && items.length && items[0]?.items) {
            return items.flatMap((cat) => (cat.items || []).map((item) => item.name).filter(Boolean));
        }
        if (Array.isArray(items)) {
            return items.filter(Boolean);
        }
        if (typeof items === 'string') {
            return items
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean);
        }
        return [];
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedCity = window.localStorage.getItem('selectedCity');
            if (storedCity) {
                setDeliveryLocation(`${storedCity} Corporate Park`);
            }
        }
    }, []);

    useEffect(() => {
        const loadMeals = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/admin/meals.php`);
                const result = await response.json();
                if (result.success) {
                    setApiMeals(result.data || []);
                }
            } catch (error) {
                console.error('Unable to load dynamic meal plans', error);
            } finally {
                setApiLoaded(true);
            }
        };

        loadMeals();
    }, []);

    useEffect(() => {
        const storedOccasion = typeof window !== 'undefined'
            ? window.localStorage.getItem('selectedOccasionKey') || window.localStorage.getItem('selectedOccasion')
            : null;
        const stateOccasion = location.state?.occasion;
        const resolvedOccasion = stateOccasion || storedOccasion;

        if (!resolvedOccasion) {
            navigate('/home');
            return;
        }

        setOccasionKey(resolvedOccasion);
    }, [location.state, navigate]);

    const apiPackages = useMemo(() => {
        if (!occasionKey || !apiMeals.length) return [];
        return apiMeals
            .filter((meal) => normalizeOcc(meal.occasion) === normalizeOcc(occasionKey))
            .map((meal) => {
                const features = flattenMealFeatures(meal.items).slice(0, 6);
                const budgetPrice = Number(meal.price) || 0;
                return {
                    id: `remote-${meal.id}`,
                    name: meal.name,
                    description: meal.cuisine || meal.occasion,
                    cuisine: meal.cuisine || 'Multi-cuisine',
                    diet: meal.type === 'non-veg' ? 'non-veg' : 'veg',
                    price: budgetPrice,
                    image: meal.image,
                    features: features.length ? features : ['Customizable menu items'],
                    bestFor: 'Custom occasion menu',
                    badge: meal.popular ? { label: 'POPULAR', icon: 'grade', classes: 'bg-amber-100 text-amber-700' } : null,
                    ctaLabel: 'Customize',
                    ctaVariant: 'primary',
                    isAvailable: true,
                    categoryItems: Array.isArray(meal.items) && meal.items.length && meal.items[0]?.items
                        ? meal.items
                        : null,
                    customization: { basePrice: budgetPrice },
                };
            });
    }, [apiMeals, occasionKey]);

    // Show only admin-created meal plans (no static seed data)
    const occasionData = useMemo(() => {
        if (!occasionKey) return null;
        if (!apiPackages.length) return null;
        return {
            displayName: apiMeals.find((m) => normalizeOcc(m.occasion) === normalizeOcc(occasionKey))?.occasion || occasionKey,
            description: 'Curated menus for your occasion',
            defaultGuests: 50,
            defaultBudget: Math.max(...apiPackages.map((p) => p.price || 0), 400),
            tags: [],
            packages: apiPackages,
        };
    }, [occasionKey, apiPackages, apiMeals]);
    const packages = occasionData?.packages ?? [];

    useEffect(() => {
        if (!occasionKey) return;
        if (!apiLoaded) return;
        // nothing to redirect — we show an empty state per occasion
    }, [apiLoaded, apiPackages.length, occasionData, occasionKey, navigate]);

    useEffect(() => {
        if (!occasionData) {
            return;
        }

        setGuestCount(occasionData.defaultGuests ?? 50);
        setBudget(occasionData.defaultBudget ?? 450);
        setSelectedCuisine('All');
        setDietFilter('all');
        setPartyTypeFilter('all');
        setVenueFilter('all');
        setLiveCounterFilter('all');

        const firstAvailable = packages.find((pkg) => pkg.isAvailable !== false) ?? packages[0];
        setSelectedPackageId('');
    }, [occasionData, packages]);

    const cuisineFilters = useMemo(() => {
        if (!packages.length) {
            return ['All'];
        }

        const uniques = Array.from(new Set(packages.map((pkg) => pkg.cuisine)));
        return ['All', ...uniques];
    }, [packages]);

    const dietFilters = useMemo(() => {
        if (!packages.length) {
            return ['all'];
        }
        const uniques = new Set();
        packages.forEach((pkg) => {
            if (pkg.diet) {
                uniques.add(pkg.diet);
            }
        });
        return ['all', ...Array.from(uniques)];
    }, [packages]);

    const maxBudget = useMemo(() => Math.max(800, ...packages.map((p) => p.price || 0)), [packages]);

    const filteredPackages = useMemo(() => {
        if (!packages.length) {
            return [];
        }

        return packages.filter((pkg) => {
            const matchesCuisine = selectedCuisine === 'All' || pkg.cuisine === selectedCuisine;
            const matchesBudget = pkg.price <= budget + 50;
            const matchesDiet = (() => {
                if (dietFilter === 'all') {
                    return true;
                }
                if (dietFilter === 'veg') {
                    return pkg.diet === 'veg' || pkg.diet === 'both' || pkg.diet === 'satvik';
                }
                if (dietFilter === 'non-veg') {
                    return pkg.diet === 'non-veg' || pkg.diet === 'both';
                }
                if (dietFilter === 'satvik') {
                    return pkg.diet === 'satvik';
                }
                if (dietFilter === 'both') {
                    return pkg.diet === 'both';
                }
                return true;
            })();

            const matchesPartyType = (() => {
                if (occasionKey !== 'birthday' || partyTypeFilter === 'all') return true;
                if (pkg.partyType === 'either') return true;
                return pkg.partyType === partyTypeFilter;
            })();

            const matchesVenue = (() => {
                if (occasionKey !== 'birthday' || venueFilter === 'all') return true;
                if (pkg.venue === 'either') return true;
                return pkg.venue === venueFilter;
            })();

            const matchesLive = (() => {
                if (occasionKey !== 'birthday' || liveCounterFilter === 'all') return true;
                if (liveCounterFilter === 'required') return !!pkg.liveCounter;
                if (liveCounterFilter === 'not-required') return !pkg.liveCounter;
                return true;
            })();

            return matchesCuisine && matchesBudget && matchesDiet && matchesPartyType && matchesVenue && matchesLive;
        });
    }, [packages, selectedCuisine, budget, dietFilter, occasionKey, partyTypeFilter, venueFilter, liveCounterFilter]);

    useEffect(() => {
        if (!filteredPackages.length) {
            if (selectedPackageId) {
                setSelectedPackageId('');
            }
            return;
        }

        const exists = filteredPackages.some((pkg) => pkg.id === selectedPackageId);
        if (!exists) {
            setSelectedPackageId('');
        }
    }, [filteredPackages, selectedPackageId]);

    const selectedPackage = useMemo(
        () => packages.find((pkg) => pkg.id === selectedPackageId) ?? null,
        [packages, selectedPackageId]
    );

    const noPackages = filteredPackages.length === 0;

    useEffect(() => {
        if (!selectedPackage) {
            setSelectedProteinId('');
            setSelectedBaseId('');
            setSelectedAddOnIds([]);
            return;
        }

        const { customization } = selectedPackage;
        if (!customization) {
            setSelectedProteinId('');
            setSelectedBaseId('');
            setSelectedAddOnIds([]);
            return;
        }

        const defaultProtein = customization.proteins?.find((opt) => opt.isDefault) || customization.proteins?.[0];
        const defaultBase = customization.bases?.find((opt) => opt.isDefault) || customization.bases?.[0];

        setSelectedProteinId(defaultProtein?.id ?? '');
        setSelectedBaseId(defaultBase?.id ?? '');
        setSelectedAddOnIds([]);
    }, [selectedPackage]);

    const selectedProtein = selectedPackage?.customization?.proteins?.find((opt) => opt.id === selectedProteinId);
    const selectedBase = selectedPackage?.customization?.bases?.find((opt) => opt.id === selectedBaseId);
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
        setSelectedAddOnIds((prev) =>
            prev.includes(id) ? prev.filter((addOnId) => addOnId !== id) : [...prev, id]
        );
    };

    const goToEvents = () => navigate('/home');
    const goToCatering = () => navigate('/buffet');

    const resolvePreference = (pkg) => {
        if (dietFilter !== 'all') {
            return dietFilter === 'satvik' ? 'veg' : dietFilter;
        }
        if (!pkg || !pkg.diet) {
            return 'both';
        }
        if (pkg.diet === 'veg' || pkg.diet === 'satvik') {
            return 'veg';
        }
        if (pkg.diet === 'non-veg') {
            return 'non-veg';
        }
        return 'both';
    };

    const buildPackageSelectionSnapshot = (pkg) => {
        const customization = pkg.customization;
        if (!customization) {
            const perPlate = pkg.price ?? 0;
            return {
                packageSelections: null,
                pricingSnapshot: {
                    perPlate,
                    estimatedTotal: Math.round(perPlate * guestCount),
                    guestCount,
                },
            };
        }

        const proteins = customization.proteins || [];
        const bases = customization.bases || [];
        const addOns = customization.addOns || [];

        const defaultProtein = proteins.find((option) => option.isDefault) || proteins[0] || null;
        const defaultBase = bases.find((option) => option.isDefault) || bases[0] || null;

        const useCurrentSelections = pkg.id === selectedPackageId;
        const proteinOption = useCurrentSelections
            ? proteins.find((option) => option.id === selectedProteinId) || defaultProtein
            : defaultProtein;
        const baseOption = useCurrentSelections
            ? bases.find((option) => option.id === selectedBaseId) || defaultBase
            : defaultBase;
        const addOnSelection = useCurrentSelections
            ? addOns.filter((option) => selectedAddOnIds.includes(option.id))
            : [];

        const perPlate =
            (customization.basePrice ?? pkg.price ?? 0) +
            (proteinOption?.priceDelta ?? 0) +
            (baseOption?.priceDelta ?? 0) +
            addOnSelection.reduce((total, option) => total + (option.priceDelta || 0), 0);

        return {
            packageSelections: {
                protein: proteinOption
                    ? { id: proteinOption.id, label: proteinOption.label, priceDelta: proteinOption.priceDelta || 0 }
                    : null,
                base: baseOption
                    ? { id: baseOption.id, label: baseOption.label, priceDelta: baseOption.priceDelta || 0 }
                    : null,
                addOns: addOnSelection.map((option) => ({
                    id: option.id,
                    label: option.label,
                    priceDelta: option.priceDelta || 0,
                })),
            },
            pricingSnapshot: {
                perPlate,
                estimatedTotal: Math.round(perPlate * guestCount),
                guestCount,
            },
        };
    };

    const handleProceedToCustomize = (pkgOverride) => {
        const pkg = pkgOverride || selectedPackage;
        if (!pkg || pkg.isAvailable === false) {
            return;
        }

        const { packageSelections, pricingSnapshot } = buildPackageSelectionSnapshot(pkg);
        const basePrice = pkg.customization?.basePrice ?? pkg.price ?? 0;

        setSelectedPackageId(pkg.id);

        navigate('/customize-meal', {
            state: {
                from: 'occasion-menu',
                occasionKey,
                occasionName: occasionData.displayName,
                guestCount,
                deliveryLocation,
                preference: resolvePreference(pkg),
                package: {
                    id: pkg.id,
                    name: pkg.name,
                    description: pkg.description,
                    basePrice,
                    minGuests: occasionData.defaultGuests ?? Math.max(guestCount, 10),
                    image: pkg.image,
                    cuisine: pkg.cuisine,
                    diet: pkg.diet,
                    features: pkg.features,
                    bestFor: pkg.bestFor,
                    badge: pkg.badge,
                    categoryItems: pkg.categoryItems ?? null,
                    customization: pkg.customization,
                },
                packageSelections,
                pricingSnapshot,
            },
        });
    };

    if (!occasionData) {
        return (
            <div className="bg-[#fcf9f4] text-[#1c1c19] min-h-screen flex flex-col font-sans">
                <nav className="bg-[#fcf9f4] border-b border-[#c2c9bb]/30 h-20 flex items-center px-6 lg:px-12 z-40 shadow-sm fixed top-0 left-0 right-0">
                    <div className="flex items-center gap-2 mr-12">
                        <BrandLogo imgClassName="h-8 w-auto" labelClassName="hidden" />
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                        <NavCartButton />
                    </div>
                </nav>
                <div className="flex-1 flex items-center justify-center pt-20">
                    {!apiLoaded ? (
                        <div className="text-center space-y-3">
                            <div className="w-10 h-10 border-4 border-[#154212]/20 border-t-[#154212] rounded-full animate-spin mx-auto" />
                            <p className="text-[#42493e] font-medium">Loading menus…</p>
                        </div>
                    ) : (
                        <div className="text-center max-w-md px-6">
                            <div className="text-6xl mb-4">🍽️</div>
                            <h2 className="text-2xl font-bold text-[#154212] mb-2">No meal plans yet</h2>
                            <p className="text-[#42493e] mb-6">
                                There are no meal plans available for this occasion yet. Check back soon or explore other occasions.
                            </p>
                            <button
                                onClick={() => navigate('/occasions')}
                                className="px-6 py-3 bg-[#154212] text-white rounded-2xl font-semibold hover:bg-[#1e5c1a] transition-colors"
                            >
                                Browse Occasions
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#fcf9f4] text-[#1c1c19] min-h-screen flex flex-col font-sans">
            <nav className="bg-[#fcf9f4] border-b border-[#c2c9bb]/30 h-20 flex items-center px-6 lg:px-12 z-40 shadow-sm fixed top-0 left-0 right-0">
                <div className="flex items-center gap-2 mr-12">
                    <BrandLogo
                        imgClassName="h-8 w-auto"
                        labelClassName="hidden"
                    />
                </div>
                <div className="ml-auto flex items-center gap-3">
                    <NavCartButton />
                </div>
            </nav>

            <div className="flex-1 flex pt-20">
                {/* ── LEFT SIDEBAR (Fixed) ── */}
                <aside className="hidden lg:flex flex-col w-[280px] xl:w-[300px] bg-[#f6f3ee] border-r border-[#c2c9bb]/30 p-6 overflow-y-auto custom-scrollbar flex-shrink-0 fixed top-20 left-0 h-[calc(100vh-5rem)] z-20">
                    <div className="mb-6">
                        <h2 className="text-sm font-extrabold text-[#154212] uppercase tracking-widest mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>Filters</h2>
                        <p className="text-xs text-[#42493e]">Refine your selection</p>
                    </div>

                    {/* Guest Count */}
                    <div className="mb-6">
                        <span className="flex items-center gap-2 text-xs font-bold text-[#42493e] uppercase tracking-widest mb-3" style={{ fontFamily: 'Manrope, sans-serif' }}>
                            <Users size={14} className="text-[#904b33]" /> Guest Count
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => adjustGuests(-1)}
                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-[#c2c9bb]/40 text-[#42493e] hover:bg-[#fcf9f4] hover:border-[#904b33]/40 transition-all shadow-sm"
                            >
                                <Minus size={14} />
                            </button>
                            <input
                                type="number"
                                min={1}
                                value={guestCount}
                                onChange={(e) => {
                                    const v = parseInt(e.target.value, 10);
                                    setGuestCount(isNaN(v) || v < 1 ? 1 : v);
                                }}
                                className="w-20 h-9 text-center font-bold text-[#154212] text-lg bg-white border border-[#c2c9bb]/40 rounded-xl outline-none focus:border-[#904b33] focus:ring-2 focus:ring-[#904b33]/20 transition-all shadow-sm appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                            />
                            <button
                                type="button"
                                onClick={() => adjustGuests(1)}
                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-[#c2c9bb]/40 text-[#42493e] hover:bg-[#fcf9f4] hover:border-[#904b33]/40 transition-all shadow-sm"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Budget Range */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <span className="flex items-center gap-2 text-xs font-bold text-[#42493e] uppercase tracking-widest" style={{ fontFamily: 'Manrope, sans-serif' }}>
                                <Sliders size={14} className="text-[#904b33]" /> Budget Range
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-[#42493e] mb-2 px-1">
                            <span>₹150</span>
                            <span className="font-bold text-[#154212] text-sm">₹{budget}</span>
                            <span>₹{maxBudget}</span>
                        </div>
                        <input
                            type="range"
                            min={150}
                            max={maxBudget}
                            value={budget}
                            onChange={(event) => setBudget(Number(event.target.value))}
                            className="w-full h-2 rounded-full cursor-pointer appearance-none"
                            style={{
                                background: `linear-gradient(to right, #904b33 0%, #904b33 ${((budget - 150) / (maxBudget - 150)) * 100}%, #e5e2dd ${((budget - 150) / (maxBudget - 150)) * 100}%, #e5e2dd 100%)`
                            }}
                        />
                    </div>

                    {/* Dietary Needs */}
                    <div className="mb-6">
                        <span className="flex items-center gap-2 text-xs font-bold text-[#42493e] uppercase tracking-widest mb-3" style={{ fontFamily: 'Manrope, sans-serif' }}>
                            <Leaf size={14} className="text-[#904b33]" /> Dietary Needs
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {dietFilters.map((filter) => {
                                const label = dietFilterLabels[filter] || filter;
                                const isActive = dietFilter === filter;
                                return (
                                    <button
                                        key={filter}
                                        type="button"
                                        onClick={() => setDietFilter(filter)}
                                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${isActive
                                            ? 'bg-[#904b33] text-white border-[#904b33] shadow-sm'
                                            : 'bg-white text-[#42493e] border-[#c2c9bb]/60 hover:border-[#904b33]/50 hover:text-[#154212]'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Cuisine Categories */}
                    <div className="mb-6">
                        <span className="flex items-center gap-2 text-xs font-bold text-[#42493e] uppercase tracking-widest mb-3" style={{ fontFamily: 'Manrope, sans-serif' }}>
                            Catering Categories
                        </span>
                        <div className="flex flex-col gap-1.5">
                            {cuisineFilters.map((filter) => (
                                <button
                                    key={filter}
                                    type="button"
                                    onClick={() => setSelectedCuisine(filter)}
                                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${selectedCuisine === filter
                                        ? 'bg-[#154212] text-white shadow-sm'
                                        : 'text-[#42493e] hover:bg-white hover:shadow-sm'
                                    }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Birthday-specific filters */}
                    {occasionKey === 'birthday' && (
                        <div className="mb-6 space-y-4">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-widest text-[#42493e] mb-2 block" style={{ fontFamily: 'Manrope, sans-serif' }}>Party Type</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {['all', 'kids', 'adult'].map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => setPartyTypeFilter(option)}
                                            className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${partyTypeFilter === option
                                                ? 'bg-[#154212] text-white border-[#154212]'
                                                : 'bg-white text-[#42493e] border-[#c2c9bb]/60 hover:border-[#154212]/30'
                                            }`}
                                        >
                                            {option === 'all' ? 'All' : option === 'kids' ? 'Kids' : 'Adult'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <span className="text-xs font-bold uppercase tracking-widest text-[#42493e] mb-2 block" style={{ fontFamily: 'Manrope, sans-serif' }}>Venue</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {['all', 'indoor', 'outdoor'].map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => setVenueFilter(option)}
                                            className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${venueFilter === option
                                                ? 'bg-[#154212] text-white border-[#154212]'
                                                : 'bg-white text-[#42493e] border-[#c2c9bb]/60 hover:border-[#154212]/30'
                                            }`}
                                        >
                                            {option === 'all' ? 'Any' : option === 'indoor' ? 'Indoor' : 'Outdoor'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <span className="text-xs font-bold uppercase tracking-widest text-[#42493e] mb-2 block" style={{ fontFamily: 'Manrope, sans-serif' }}>Live Counter</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {[{ key: 'all', label: 'Any' }, { key: 'required', label: 'Required' }, { key: 'not-required', label: 'Not Needed' }].map((option) => (
                                        <button
                                            key={option.key}
                                            type="button"
                                            onClick={() => setLiveCounterFilter(option.key)}
                                            className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${liveCounterFilter === option.key
                                                ? 'bg-[#154212] text-white border-[#154212]'
                                                : 'bg-white text-[#42493e] border-[#c2c9bb]/60 hover:border-[#154212]/30'
                                            }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </aside>

                {/* ── RIGHT CONTENT AREA ── */}
                <main className="flex-1 overflow-y-auto px-6 lg:px-12 py-10 custom-scrollbar bg-[#fcf9f4] lg:ml-[280px] xl:ml-[300px]">
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-12">
                            <h1 className="text-4xl md:text-5xl font-extrabold text-[#154212] tracking-tight mb-3" style={{ fontFamily: 'Manrope, sans-serif' }}>Premium Meal Boxes</h1>
                            <p className="text-[#42493e] text-lg max-w-2xl">{occasionData.description}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-32">
                            {noPackages && (
                                <div className="col-span-full bg-white rounded-[24px] p-12 text-center shadow-[0_10px_30px_-10px_rgba(28,28,25,0.05)]">
                                    <p className="text-lg font-semibold text-[#154212]">No menus match your filters.</p>
                                    <p className="text-sm text-[#42493e] mt-2">
                                        Try adjusting the budget, diet, or cuisine filters to explore more options.
                                    </p>
                                </div>
                            )}

                            {!noPackages &&
                                filteredPackages.map((pkg) => {
                                    const dietStyles = dietBadgeStyles[pkg.diet] || dietBadgeStyles.veg;
                                    const isSelected = pkg.id === selectedPackageId;

                                    return (
                                        <article
                                            key={pkg.id}
                                            role="button"
                                            tabIndex={pkg.isAvailable ? 0 : -1}
                                            onClick={() => pkg.isAvailable && setSelectedPackageId(pkg.id)}
                                            onKeyDown={(e) =>
                                                pkg.isAvailable && (e.key === 'Enter' || e.key === ' ')
                                                    ? setSelectedPackageId(pkg.id)
                                                    : null
                                            }
                                            className={`bg-white rounded-[24px] overflow-hidden transition-all duration-300 group flex flex-col h-full border hover:-translate-y-2 shadow-[0_10px_30px_-10px_rgba(28,28,25,0.05)] hover:shadow-[0_20px_40px_-8px_rgba(28,28,25,0.1)] cursor-pointer ${isSelected
                                                ? 'border-[#154212] ring-2 ring-[#154212]/20'
                                                : 'border-transparent hover:border-[#904b33]/20'
                                            }`}
                                        >
                                            <div className="relative h-56 bg-[#f0ede9] overflow-hidden">
                                                <img
                                                    src={pkg.image || MEAL_FALLBACK_IMG}
                                                    alt={pkg.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                    onError={(event) => {
                                                        event.currentTarget.onerror = null;
                                                        event.currentTarget.src = MEAL_FALLBACK_IMG;
                                                    }}
                                                />
                                                {!pkg.isAvailable && (
                                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                        <span className="bg-white text-black text-xs font-bold px-3 py-1 rounded">SOLD OUT</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-5 flex-1 flex flex-col">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex-1">
                                                        <h3 className="font-extrabold text-[#154212] tracking-tight text-xl leading-tight mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>{pkg.name}</h3>
                                                    </div>
                                                    <div className={`ml-2 flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${dietStyles.wrapper} flex-shrink-0`}>
                                                        <div className={`w-2 h-2 rounded-full ${dietStyles.dot}`}></div>
                                                        {dietStyles.label}
                                                    </div>
                                                </div>
                                                <p className="text-[#42493e] text-sm mb-4 line-clamp-2">{pkg.description}</p>
                                                <div className="bg-[#f6f3ee] rounded-xl p-3 mb-4 flex-1">
                                                    <ul className="text-sm space-y-2 text-[#42493e]">
                                                        {pkg.features.map((feature) => (
                                                            <li key={feature} className="flex items-start gap-2">
                                                                <CheckCircle size={16} className="text-[#904b33] mt-0.5 flex-shrink-0" />
                                                                <span className="flex-1">{feature}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="flex items-center justify-between mt-auto pt-3">
                                                    <div>
                                                        <span className="block text-2xl font-extrabold text-[#154212]" style={{ fontFamily: 'Manrope, sans-serif' }}>{formatCurrency(pkg.price)}</span>
                                                        <span className="text-xs text-[#42493e]">per plate</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); pkg.isAvailable && handleProceedToCustomize(pkg); }}
                                                        disabled={!pkg.isAvailable}
                                                        className={`py-2 px-5 rounded-full font-bold text-sm transition-all shadow-sm ${!pkg.isAvailable
                                                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                                            : isSelected
                                                                ? 'bg-gradient-to-r from-[#154212] to-[#2d5a27] text-white shadow-[#154212]/30'
                                                                : 'bg-gradient-to-r from-[#904b33] to-[#783922] text-white hover:shadow-md hover:-translate-y-0.5'
                                                        }`}
                                                    >
                                                        {isSelected ? '✓ Selected' : 'Customize & Select'}
                                                    </button>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                        </div>
                    </div>

                    {/* Floating checkout bar */}
                    <div className="fixed bottom-8 right-8 z-50">
                        {selectedPackage && (
                            <div className="bg-[#154212] text-white rounded-full shadow-2xl px-6 py-3 flex items-center gap-4">
                                <div className="text-sm">
                                    <span className="uppercase text-xs text-white/60 tracking-wide">ESTIMATE ({guestCount} GUESTS)</span>
                                    <div className="font-semibold">{itemsAddedLabel}</div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleProceedToCustomize()}
                                    className="px-6 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 bg-gradient-to-r from-[#904b33] to-[#783922] shadow-lg hover:shadow-[#904b33]/30 hover:-translate-y-0.5 text-white"
                                >
                                    Proceed to Checkout
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default OccasionMenuPage;
