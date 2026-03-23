import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ArrowRight,
    Briefcase,
    Check,
    ClipboardList,
    Flower2,
    Heart,
    Home as HomeIcon,
    MapPin,
    Package,
    PartyPopper,
    User,
    Star
} from 'lucide-react';
import AuthService from '../services/authService';
import BrandLogo from './BrandLogo';
import './HomePage.css';

const heroSlides = [
    {
        id: 'hero-01',
        kicker: 'Signature Canapés',
        title: 'Culinary Excellence.',
        description: 'Crafted with passion, delivered with sophistication. Elevate your events with bespoke catering.',
        image: 'https://images.unsplash.com/photo-1481833761820-0509d3217039?auto=format&fit=crop&w=1600&q=80',
    },
    {
        id: 'hero-02',
        kicker: 'Gala Ready Service',
        title: 'Artful Presentations.',
        description: 'From intimate dinners to corporate galas, our culinary team curates menus that feel personal and luxurious.',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80',
    },
    {
        id: 'hero-03',
        kicker: 'Tailored Experiences',
        title: 'Impeccable Taste.',
        description: 'We obsess over sourcing, plating, and timing so you can host with confidence and ease.',
        image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1600&q=80',
    },
];

const occasionLabelMap = {
    corporate: 'Corporate Event',
    birthday: 'Birthday Party',
    wedding: 'Wedding Celebration',
    houseParty: 'House Party',
    pooja: 'Pooja Ceremony',
    other: 'Custom Event',
};

const occasionMenuPlans = [
    {
        key: 'wedding',
        label: 'Wedding',
        icon: Heart,
        highlights: ['Family features', 'Grand recommendations', 'Luxury catering', 'Banquet coordination'],
    },
    {
        key: 'corporate',
        label: 'Corporate',
        icon: Briefcase,
        highlights: ['Food menu curation', 'Buffet catering', 'Quality workforce', 'White-glove support'],
    },
    {
        key: 'birthday',
        label: 'Birthday',
        icon: PartyPopper,
        highlights: ['Family features', 'Event catering', 'Bespoke desserts', 'Party stylings'],
    },
    {
        key: 'pooja',
        label: 'Pooja',
        icon: Flower2,
        highlights: ['Family features', 'One-lining song', 'Bespoke catering', 'Pure satvik prep'],
    },
];

const HomePage = () => {
    const navigate = useNavigate();
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedOccasionLabel, setSelectedOccasionLabel] = useState('');
    const [selectedOccasionKey, setSelectedOccasionKey] = useState('');
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const storedCity = window.localStorage.getItem('selectedCity');
        if (!storedCity) {
            navigate('/select-city');
            return;
        }

        const storedOccasionKey = window.localStorage.getItem('selectedOccasionKey') || window.localStorage.getItem('selectedOccasion');
        if (!storedOccasionKey) {
            navigate('/select-occasion');
            return;
        }

        const storedOccasionLabel =
            window.localStorage.getItem('selectedOccasionLabel') || occasionLabelMap[storedOccasionKey] || '';

        setSelectedCity(storedCity);
        setSelectedOccasionKey(storedOccasionKey);
        setSelectedOccasionLabel(storedOccasionLabel);
    }, [navigate]);

    // Auto-advance the hero slider every six seconds for a gentle marquee effect.
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 6000);

        return () => clearInterval(timer);
    }, []);

    const handleChangeCity = () => {
        navigate('/select-city');
    };

    const handleChangeOccasion = () => {
        navigate('/select-occasion');
    };

    const navigateToMealBoxes = () => {
        const fallbackKey = selectedOccasionKey || 'corporate';
        const fallbackLabel = selectedOccasionLabel || occasionLabelMap[fallbackKey] || 'Corporate Event';

        if (typeof window !== 'undefined') {
            window.localStorage.setItem('selectedOccasionKey', fallbackKey);
            window.localStorage.setItem('selectedOccasion', fallbackKey);
            window.localStorage.setItem('selectedOccasionLabel', fallbackLabel);
        }

        navigate('/occasion-menu', { state: { occasion: fallbackKey } });
    };

    const handleOccasionPlanNavigate = (planKey, planLabel) => {
        if (typeof window !== 'undefined') {
            window.localStorage.setItem('selectedOccasionKey', planKey);
            window.localStorage.setItem('selectedOccasion', planKey);
            window.localStorage.setItem('selectedOccasionLabel', planLabel);
        }

        setSelectedOccasionKey(planKey);
        setSelectedOccasionLabel(planLabel);

        navigate('/occasion-menu', { state: { occasion: planKey } });
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
            setSelectedCity('');
            setSelectedOccasionKey('');
            setSelectedOccasionLabel('');
            navigate('/home');
        }
    };

    const cardItems = [
        {
            id: 'meal',
            title: 'Meal Boxes',
            description: 'Individual gourmet boxes crafted thoughtfully. Perfect for corporate lunches, intimate gatherings, and personalized dining experiences where safety and sophistication meet.',
            cta: 'View Curated Menu',
            image: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=900&q=80',
            icon: Package,
            action: navigateToMealBoxes,
        },
    ];

    const heroOccasion = selectedOccasionLabel || 'Custom Event';
    const heroCity = selectedCity || 'your city';
    const activeOccasionKey = selectedOccasionKey || 'wedding';

    return (
        <div className="home-page">
            <header className="home-nav">
                <div className="nav-inner">
                    <div className="nav-left">
                        <BrandLogo
                            labelClassName="brandmark-label"
                            imgClassName="brandmark-image"
                        />
                    </div>
                    <div className="nav-actions">
                        <button type="button" className="ghost-link muted" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main>
                <section className="hero-section">
                    <div className="shell">
                        <div className="hero-grid">
                            <div className="hero-content">
                                <div className="hero-kicker-wrapper">
                                    <div className="hero-kicker-line"></div>
                                    <p className="hero-slide__kicker">{heroSlides[currentSlide].kicker}</p>
                                </div>
                                <h1 className="hero-title">{heroSlides[currentSlide].title}</h1>
                                <p className="hero-description">{heroSlides[currentSlide].description}</p>

                                <div className="hero-actions">
                                    <div className="context-switchers">
                                        <button type="button" className="context-pill" onClick={handleChangeCity}>
                                            <MapPin size={16} />
                                            <span>{selectedCity || 'Select City'}</span>
                                        </button>
                                        <button type="button" className="context-pill" onClick={handleChangeOccasion}>
                                            <PartyPopper size={16} />
                                            <span>{selectedOccasionLabel || 'Select Occasion'}</span>
                                        </button>
                                    </div>
                                </div>
                                <span className="hero-note">Serving {heroCity} with bespoke menus for {heroOccasion.toLowerCase()}.</span>
                            </div>

                            <div className="hero-visual">
                                {heroSlides.map((slide, index) => (
                                    <article key={slide.id} className={`hero-slide ${currentSlide === index ? 'is-active' : ''}`} aria-hidden={currentSlide !== index}>
                                        <img className="hero-image" src={slide.image} alt={slide.title} />
                                    </article>
                                ))}

                                <div className="hero-floating-card">
                                    <div className="floating-avatar">
                                        <Star size={24} fill="currentColor" />
                                    </div>
                                    <div className="floating-text">
                                        <p>Premium Catering</p>
                                        <span>Highly rated across {heroCity}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="service-highlight">
                    <div className="shell">
                        <div className="section-intro">
                            <span className="eyebrow">Our Offerings</span>
                            <h2>Crafted with passion, delivered with sophistication.</h2>
                        </div>
                        <div className="service-layout">
                            {cardItems.map((card) => {
                                const Icon = card.icon;
                                return (
                                    <article
                                        key={card.id}
                                        className="service-card"
                                        role="button"
                                        tabIndex={0}
                                        onClick={card.action}
                                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && card.action()}
                                    >
                                        <div className="service-card__media">
                                            <img src={card.image} alt={card.title} />
                                        </div>
                                        <div className="service-card__body">
                                            <div className="service-card__title">
                                                <span className="service-icon">
                                                    <Icon size={24} />
                                                </span>
                                                <h3>{card.title}</h3>
                                            </div>
                                            <p>{card.description}</p>
                                            <button type="button" className="text-link" onClick={card.action}>
                                                {card.cta}
                                                <ArrowRight size={18} />
                                            </button>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section className="recommendation-section">
                    <div className="shell">
                        <div className="section-intro">
                            <span className="eyebrow">Curated Collections</span>
                            <h2>{heroOccasion} Inspiration</h2>
                        </div>
                        <div className="recommendation-grid">
                            {occasionMenuPlans.map((plan) => {
                                const Icon = plan.icon;
                                const isActive = plan.key === activeOccasionKey;
                                return (
                                    <article
                                        key={plan.key}
                                        className={`recommendation-card rec-bg-${plan.key} ${isActive ? 'is-active' : ''}`}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => handleOccasionPlanNavigate(plan.key, plan.label)}
                                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleOccasionPlanNavigate(plan.key, plan.label)}
                                    >
                                        <div className="card-label">
                                            <Icon size={14} />
                                            <span>{plan.label}</span>
                                        </div>
                                        <div className="recommendation-content">
                                            <h3>{plan.label}</h3>
                                            <div className="recommendation-details">
                                                <ul>
                                                    {plan.highlights.map((item) => (
                                                        <li key={item}>
                                                            <Check size={16} />
                                                            <span>{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                                <button
                                                    type="button"
                                                    className="outline-button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOccasionPlanNavigate(plan.key, plan.label);
                                                    }}
                                                >
                                                    View Collection
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </div>
                </section>
            </main>

            <footer className="site-footer">
                <div className="shell">
                    <div className="footer-inner">
                        <div className="footer-brand">
                            <span className="brandmark-label">CATALYST.</span>
                            <p>Premium enterprise-grade bulk food ordering and catering platform for corporate and social events. Delivering excellence to your doorstep.</p>
                        </div>
                        <div>
                            <h4>Company</h4>
                            <ul>
                                <li><Link to="#">About Us</Link></li>
                                <li><Link to="#">Careers</Link></li>
                                <li><Link to="#">Blog</Link></li>
                                <li><Link to="#">Press</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4>Services</h4>
                            <ul>
                                <li><Link to="#">Meal Boxes</Link></li>
                                <li><Link to="#">Buffet Catering</Link></li>
                                <li><Link to="#">Corporate Events</Link></li>
                                <li><Link to="#">Custom Menus</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4>Stay Informed</h4>
                            <p style={{ color: '#a89f91', fontSize: '0.9rem', marginBottom: '8px' }}>Join our newsletter for exclusive menus.</p>
                            <form className="newsletter-form">
                                <input type="email" placeholder="Your email address" />
                                <button type="button" aria-label="Subscribe">
                                    <ArrowRight size={18} />
                                </button>
                            </form>
                        </div>
                    </div>
                    <div className="footer-base">
                        <p>© {new Date().getFullYear()} Catalyst Inc. All rights reserved.</p>
                        <div className="footer-links">
                            <Link to="#">Privacy Policy</Link>
                            <Link to="#">Terms of Service</Link>
                            <Link to="#">Cookies</Link>
                        </div>
                    </div>
                </div>
            </footer>

            <div className="mobile-quick-nav">
                <button type="button" onClick={() => navigate('/home')} className="is-active">
                    <HomeIcon className="mobile-icon" size={20} />
                    <span>Home</span>
                </button>
                <button type="button" onClick={() => navigate('/orders')}>
                    <ClipboardList className="mobile-icon" size={20} />
                    <span>Orders</span>
                </button>
                <button type="button" onClick={() => navigate('/account')}>
                    <User className="mobile-icon" size={20} />
                    <span>Account</span>
                </button>
            </div>
        </div>
    );
};

export default HomePage;
