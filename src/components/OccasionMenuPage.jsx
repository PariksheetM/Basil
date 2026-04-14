import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, MapPin, Minus, Plus } from 'lucide-react';
import { API_BASE_URL } from '../utils/api.js';
import { imgUrl } from '../utils/imgUrl.js';
import MainNavbar from './MainNavbar';
import './MealBoxPage.css';

const dietBadgeStyles = {
    veg:      { wrapper: 'diet-pill veg',     label: 'Veg' },
    'non-veg':{ wrapper: 'diet-pill non-veg', label: 'Non-Veg' },
    both:     { wrapper: 'diet-pill both',    label: 'Veg & Non-Veg' },
    satvik:   { wrapper: 'diet-pill satvik',  label: 'Satvik' },
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

    const getPackageAddOns = (pkg) => {
        if (!pkg) return [];

        if (Array.isArray(pkg.customization?.addOns) && pkg.customization.addOns.length) {
            return pkg.customization.addOns.map((opt, idx) => ({
                id: opt.id ?? `custom-addon-${pkg.id}-${idx}`,
                label: opt.label || opt.name || `Add-on ${idx + 1}`,
                description: opt.description || '',
                priceDelta: Number(opt.priceDelta ?? opt.pricePerPerson ?? 0),
                image: opt.image || pkg.image || MEAL_FALLBACK_IMG,
            }));
        }

        if (Array.isArray(pkg.addOns) && pkg.addOns.length) {
            return pkg.addOns.map((opt, idx) => ({
                id: opt.id ?? `addon-${pkg.id}-${idx}`,
                label: opt.label || opt.name || `Add-on ${idx + 1}`,
                description: opt.description || (opt.category ? `Category: ${opt.category}` : ''),
                priceDelta: Number(opt.priceDelta ?? opt.pricePerPerson ?? opt.price ?? 0),
                image: opt.image || pkg.image || MEAL_FALLBACK_IMG,
            }));
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
                    addOns: Array.isArray(meal.addons) ? meal.addons : [],
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
    const addOnOptions = useMemo(() => getPackageAddOns(selectedPackage), [selectedPackage]);
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
        const addOns = getPackageAddOns(pkg);

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
            <div className="menu-page">
                <MainNavbar />
                <div style={{ paddingTop: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                    {!apiLoaded ? (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ width: 40, height: 40, border: '4px solid rgba(166,120,56,0.2)', borderTopColor: 'var(--gold-deep)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
                            <p style={{ color: 'var(--slate)', fontWeight: 500 }}>Loading menus…</p>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', maxWidth: 400, padding: '0 24px' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🍽️</div>
                            <h2 style={{ marginBottom: '8px' }}>No meal plans yet</h2>
                            <p style={{ color: 'var(--slate)', marginBottom: '24px' }}>There are no meal plans for this occasion yet. Check back soon.</p>
                            <button onClick={() => navigate('/occasions')} className="primary-cta" style={{ display: 'inline-flex', width: 'auto', padding: '12px 32px' }}>
                                Browse Occasions
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const occasionHeroImage = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80';

    return (
        <div className="menu-page">

            {/* ── NAV ── */}
            <MainNavbar />

            <main>
                {/* ── HERO BANNER ── */}
                <section className="menu-hero">
                    <div className="shell">
                        <div className="hero-banner">
                            <img className="hero-banner__bg" src={imgUrl(occasionHeroImage)} alt={occasionData.displayName} />
                            <div className="hero-banner__overlay" />
                            <div className="hero-banner__content">
                                <p className="hero-banner__kicker">Occasion Menu</p>
                                <h1>{occasionData.displayName}</h1>
                                <p>{occasionData.description}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── CONTROLS STRIP ── */}
                <section className="menu-controls">
                    <div className="shell">
                        <div className="controls-dashboard">
                            <div className="control-group">
                                <span className="control-label">Guest Count</span>
                                <div className="stepper">
                                    <button type="button" onClick={() => adjustGuests(-5)}><Minus size={16} /></button>
                                    <span>{guestCount}</span>
                                    <button type="button" onClick={() => adjustGuests(5)}><Plus size={16} /></button>
                                </div>
                            </div>

                            <div className="control-group">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span className="control-label">Budget Per Plate</span>
                                    <span className="budget-scale highlight">₹{budget}</span>
                                </div>
                                <div className="budget-control">
                                    <input type="range" min={200} max={maxBudget} step={25} value={budget} onChange={(e) => setBudget(Number(e.target.value))} />
                                    <div className="budget-scale">
                                        <span>₹200</span>
                                        <span>₹{maxBudget}+</span>
                                    </div>
                                </div>
                            </div>

                            <div className="control-group" style={{ alignItems: 'flex-start' }}>
                                <span className="control-label">Cuisine Focus</span>
                                <div className="chip-row">
                                    {cuisineFilters.map((f) => (
                                        <button key={f} type="button" className={`chip ${selectedCuisine === f ? 'is-active' : ''}`} onClick={() => setSelectedCuisine(f)}>
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── MAIN CONTENT: sidebar + grid ── */}
                <section className="menu-content">
                    <div className="shell menu-layout">

                        {/* ── SIDEBAR (LEFT) ── */}
                        <aside className="menu-aside" style={{ top: '160px' }}>
                            <div className="aside-panel" style={{ maxHeight: 'calc(100vh - 170px)', minHeight: '74vh' }}>
                                <header className="aside-header">
                                    <div>
                                        <h3>Your Box</h3>
                                        <p>{selectedPackage?.name || 'Select a box to begin.'}</p>
                                    </div>
                                    {selectedPackage?.customization?.category
                                        ? <span className="category-pill">{selectedPackage.customization.category}</span>
                                        : selectedPackage && <span className="category-pill">{selectedPackage.diet?.toUpperCase() || 'CUSTOM'}</span>
                                    }
                                </header>

                                {selectedPackage && (
                                    <div className="price-tile">
                                        <span>Base</span>
                                        <strong>{formatCurrency(basePrice)}</strong>
                                    </div>
                                )}

                                <div className="aside-scroll">
                                    {selectedPackage?.customization?.proteins?.length > 0 ? (
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
                                                                    <img
                                                                        src={imgUrl(opt.image || selectedPackage.image || MEAL_FALLBACK_IMG)}
                                                                        alt={opt.label}
                                                                        className="option-thumb"
                                                                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = MEAL_FALLBACK_IMG; }}
                                                                    />
                                                                    {opt.label}
                                                            </span>
                                                            <em>{opt.priceDelta > 0 ? `+ ₹${opt.priceDelta}` : 'Incl.'}</em>
                                                        </label>
                                                    ))}
                                                </div>
                                            </section>

                                            {selectedPackage.customization.bases?.length > 0 && (
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
                                                                    <img
                                                                        src={imgUrl(opt.image || selectedPackage.image || MEAL_FALLBACK_IMG)}
                                                                        alt={opt.label}
                                                                        className="option-thumb"
                                                                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = MEAL_FALLBACK_IMG; }}
                                                                    />
                                                                    {opt.label}
                                                                </span>
                                                                <em>{opt.priceDelta > 0 ? `+ ₹${opt.priceDelta}` : 'Incl.'}</em>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </section>
                                            )}

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
                                                                    <img
                                                                        src={imgUrl(opt.image || selectedPackage.image || MEAL_FALLBACK_IMG)}
                                                                        alt={opt.label}
                                                                        className="option-thumb"
                                                                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = MEAL_FALLBACK_IMG; }}
                                                                    />
                                                                    <div>
                                                                        <strong>{opt.label}</strong>
                                                                        {opt.description && <p>{opt.description}</p>}
                                                                    </div>
                                                                </span>
                                                                <em>+ ₹{opt.priceDelta}</em>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </section>
                                            )}
                                        </>
                                    ) : selectedPackage?.categoryItems?.length > 0 ? (
                                        <>
                                            {selectedPackage.categoryItems.map((cat, ci) => (
                                                <section key={cat.id || cat.name}>
                                                    <div className="section-heading">
                                                        <span>{String(ci + 1).padStart(2, '0')}</span>
                                                        <h4>{cat.name}</h4>
                                                    </div>
                                                    <div className="option-stack">
                                                        {(cat.items || []).map((item) => (
                                                            <div key={item.id || item.name} className="custom-option" style={{ cursor: 'default' }}>
                                                                <span>
                                                                    <img
                                                                        src={imgUrl(item.image || selectedPackage.image || MEAL_FALLBACK_IMG)}
                                                                        alt={item.name}
                                                                        className="option-thumb"
                                                                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = MEAL_FALLBACK_IMG; }}
                                                                    />
                                                                    {item.name}
                                                                </span>
                                                                <em>Incl.</em>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </section>
                                            ))}
                                            {addOnOptions.length > 0 && (
                                                <section>
                                                    <div className="section-heading">
                                                        <span>+</span>
                                                        <h4>Add-ons</h4>
                                                    </div>
                                                    <div className="option-stack">
                                                        {addOnOptions.map((opt) => (
                                                            <label key={opt.id} className={`custom-option checkbox ${selectedAddOnIds.includes(opt.id) ? 'is-active' : ''}`}>
                                                                <span>
                                                                    <input type="checkbox" checked={selectedAddOnIds.includes(opt.id)} onChange={() => toggleAddOn(opt.id)} />
                                                                    <img
                                                                        src={imgUrl(opt.image || selectedPackage.image || MEAL_FALLBACK_IMG)}
                                                                        alt={opt.label}
                                                                        className="option-thumb"
                                                                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = MEAL_FALLBACK_IMG; }}
                                                                    />
                                                                    <div>
                                                                        <strong>{opt.label}</strong>
                                                                        {opt.description && <p>{opt.description}</p>}
                                                                    </div>
                                                                </span>
                                                                <em>+ ₹{opt.priceDelta}</em>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </section>
                                            )}
                                        </>
                                    ) : selectedPackage ? (
                                        <>
                                            <section>
                                                <div className="section-heading">
                                                    <span>01</span>
                                                    <h4>Included Items</h4>
                                                </div>
                                                <div className="option-stack">
                                                    {(selectedPackage.features || []).map((f, i) => (
                                                        <div key={i} className="custom-option" style={{ cursor: 'default' }}>
                                                            <span>
                                                                <img
                                                                    src={imgUrl(selectedPackage.image || MEAL_FALLBACK_IMG)}
                                                                    alt={f}
                                                                    className="option-thumb"
                                                                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = MEAL_FALLBACK_IMG; }}
                                                                />
                                                                {f}
                                                            </span>
                                                            <em>Incl.</em>
                                                        </div>
                                                    ))}
                                                </div>
                                            </section>
                                            {addOnOptions.length > 0 && (
                                                <section>
                                                    <div className="section-heading">
                                                        <span>02</span>
                                                        <h4>Add-ons</h4>
                                                    </div>
                                                    <div className="option-stack">
                                                        {addOnOptions.map((opt) => (
                                                            <label key={opt.id} className={`custom-option checkbox ${selectedAddOnIds.includes(opt.id) ? 'is-active' : ''}`}>
                                                                <span>
                                                                    <input type="checkbox" checked={selectedAddOnIds.includes(opt.id)} onChange={() => toggleAddOn(opt.id)} />
                                                                    <img
                                                                        src={imgUrl(opt.image || selectedPackage.image || MEAL_FALLBACK_IMG)}
                                                                        alt={opt.label}
                                                                        className="option-thumb"
                                                                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = MEAL_FALLBACK_IMG; }}
                                                                    />
                                                                    <div>
                                                                        <strong>{opt.label}</strong>
                                                                        {opt.description && <p>{opt.description}</p>}
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
                                        <p className="placeholder-text">Select a package to configure your box.</p>
                                    )}
                                </div>

                                <div className="aside-footer">
                                    <div className="estimate-row">
                                        <div>
                                            <span>Est. Total ({guestCount} Guests)</span>
                                            <strong>{formatCurrency(estimateTotal)}</strong>
                                        </div>
                                    </div>
                                    <button type="button" className="primary-cta" onClick={() => handleProceedToCustomize()} disabled={!selectedPackage}>
                                        Proceed to Checkout
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </aside>

                        {/* ── CARD GRID (RIGHT) ── */}
                        <div className="menu-main">

                            {/* Diet filter chips */}
                            <div className="chip-row" style={{ marginBottom: '24px' }}>
                                {dietFilters.map((filter) => (
                                    <button key={filter} type="button" className={`chip ${dietFilter === filter ? 'is-active' : ''}`} onClick={() => setDietFilter(filter)}>
                                        {dietFilterLabels[filter] || filter}
                                    </button>
                                ))}
                            </div>

                            <div className="package-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
                                {noPackages && (
                                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px 20px', background: '#fff', borderRadius: '24px', boxShadow: '0 12px 24px rgba(0,0,0,0.06)' }}>
                                        <p style={{ fontWeight: 600, fontSize: '1.1rem', fontFamily: "'Playfair Display', serif", color: 'var(--stone)' }}>No menus match your filters.</p>
                                        <p style={{ color: 'var(--slate)', marginTop: '8px' }}>Try adjusting the budget, diet, or cuisine filters.</p>
                                    </div>
                                )}

                                {!noPackages && filteredPackages.map((pkg) => {
                                    const dietStyles = dietBadgeStyles[pkg.diet] || dietBadgeStyles.veg;
                                    const isSelected = pkg.id === selectedPackageId;

                                    return (
                                        <article
                                            key={pkg.id}
                                            className={`package-card ${isSelected ? 'is-selected' : ''} ${!pkg.isAvailable ? 'is-disabled' : ''}`}
                                            onClick={() => pkg.isAvailable && setSelectedPackageId(pkg.id)}
                                        >
                                            <div className="package-card__media" style={{ height: '160px' }}>
                                                <img
                                                    src={pkg.image ? imgUrl(pkg.image) : 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80'}
                                                    alt={pkg.name}
                                                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80'; }}
                                                />
                                                {!pkg.isAvailable && (
                                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <span style={{ background: '#fff', color: '#000', fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px', borderRadius: '999px' }}>SOLD OUT</span>
                                                    </div>
                                                )}
                                                {pkg.badge && (
                                                    <span className="badge bestseller">{pkg.badge.label}</span>
                                                )}
                                            </div>
                                            <div className="package-card__body" style={{ padding: '16px', gap: '10px' }}>
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
                                                    {pkg.features.slice(0, 4).map((feature, i) => (
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
                                                    <button
                                                        type="button"
                                                        className="ghost-cta"
                                                        onClick={(e) => { e.stopPropagation(); if (pkg.isAvailable) setSelectedPackageId(pkg.id); }}
                                                        disabled={!pkg.isAvailable}
                                                    >
                                                        {isSelected ? 'Selected ✓' : 'Select'}
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
        </div>
    );
};

export default OccasionMenuPage;
