import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Briefcase,
    PartyPopper,
    Heart,
    Flower2,
    Home as HomeIcon,
    Sparkles,
    ArrowLeft,
} from 'lucide-react';
import BrandLogo from './BrandLogo';

const baseOccasionOptions = [
    { key: 'wedding', label: 'Wedding Celebration', icon: Heart, color: 'text-rose-500', background: 'bg-rose-50' },
    { key: 'corporate', label: 'Corporate Event', icon: Briefcase, color: 'text-blue-600', background: 'bg-blue-50' },
    { key: 'birthday', label: 'Birthday Party', icon: PartyPopper, color: 'text-amber-500', background: 'bg-amber-50' },
    { key: 'pooja', label: 'Pooja / Religious Event', icon: Flower2, color: 'text-orange-500', background: 'bg-orange-50' },
    { key: 'houseParty', label: 'House Party', icon: HomeIcon, color: 'text-green-600', background: 'bg-green-50' },
    { key: 'other', label: 'Custom Event', icon: Sparkles, color: 'text-slate-600', background: 'bg-slate-100' },
];

const OccasionSelectionPage = () => {
    const navigate = useNavigate();
    const [selectedOccasionKey, setSelectedOccasionKey] = useState('');
    const [occasionOptions, setOccasionOptions] = useState(baseOccasionOptions);

    const slugify = (value) =>
        (value || '')
            .toString()
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') || '';

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const storedOccasion = window.localStorage.getItem('selectedOccasionKey');
        if (storedOccasion) {
            setSelectedOccasionKey(storedOccasion);
        }
    }, []);

    useEffect(() => {
        const loadOccasions = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/admin/occasions.php');
                const result = await response.json();
                if (result.success && Array.isArray(result.data)) {
                    const dynamic = result.data.map((occ) => ({
                        key: slugify(occ.name),
                        label: occ.name,
                        icon: Sparkles,
                        color: 'text-emerald-600',
                        background: 'bg-emerald-50',
                    }));
                    const merged = [...baseOccasionOptions];
                    dynamic.forEach((option) => {
                        if (!merged.find((o) => o.key === option.key)) {
                            merged.push(option);
                        }
                    });
                    setOccasionOptions(merged);
                }
            } catch (error) {
                console.error('Unable to load occasions', error);
            }
        };

        loadOccasions();
    }, []);

    const handleSelect = (key) => {
        setSelectedOccasionKey(key);
    };

    const handleContinue = () => {
        if (!selectedOccasionKey) {
            return;
        }

        const selectedOccasion = occasionOptions.find((option) => option.key === selectedOccasionKey);
        if (!selectedOccasion) {
            return;
        }

        if (typeof window !== 'undefined') {
            window.localStorage.setItem('selectedOccasionKey', selectedOccasion.key);
            window.localStorage.setItem('selectedOccasion', selectedOccasion.key);
            window.localStorage.setItem('selectedOccasionLabel', selectedOccasion.label);
        }

        navigate('/occasion-menu', { state: { occasion: selectedOccasion.key } });
    };

    return (
        <div className="min-h-screen bg-[#f8f7f5] text-slate-800">
            <header className="border-b border-slate-200 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => navigate('/select-city')}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#f27f0d] transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        City
                    </button>
                    <BrandLogo
                        className="gap-3"
                        imgClassName="h-8 w-auto"
                        labelClassName="text-lg font-bold tracking-tight text-slate-900"
                    />
                    <div className="w-16" />
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-12">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-[0.3em]">
                        Step 2 of 2
                    </span>
                    <h1 className="mt-6 text-3xl md:text-4xl font-bold text-slate-900">What&rsquo;s the occasion?</h1>
                    <p className="mt-3 text-sm md:text-base text-slate-500 max-w-2xl mx-auto">
                        We&rsquo;ll tailor recommendations and pricing for your event type. Select the experience that fits your gathering.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {occasionOptions.map((occasion) => {
                        const Icon = occasion.icon;
                        const isActive = occasion.key === selectedOccasionKey;

                        return (
                            <button
                                key={occasion.key}
                                type="button"
                                onClick={() => handleSelect(occasion.key)}
                                className={`flex flex-col items-center gap-3 rounded-2xl border p-6 transition-all text-center ${
                                    isActive
                                        ? 'border-[#f27f0d] bg-white shadow-md shadow-[#f27f0d]/20'
                                        : 'border-slate-100 bg-white/70 hover:border-[#f27f0d]/40 hover:bg-white'
                                }`}
                            >
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${occasion.background}`}>
                                    <Icon className={`w-7 h-7 ${occasion.color}`} />
                                </div>
                                <span className="text-sm font-semibold text-slate-700 leading-tight">{occasion.label}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs sm:text-sm text-slate-500 text-center sm:text-left">
                        Need something custom? Choose &ldquo;Custom Event&rdquo; and our planners will help you craft a bespoke menu.
                    </div>
                    <button
                        type="button"
                        onClick={handleContinue}
                        className={`inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-semibold transition-colors shadow-sm ${
                            selectedOccasionKey
                                ? 'bg-[#f27f0d] text-white hover:bg-[#d9700a]'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                        Continue to Home
                    </button>
                </div>
            </main>
        </div>
    );
};

export default OccasionSelectionPage;
