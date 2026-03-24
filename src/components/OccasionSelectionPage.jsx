import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../utils/api.js';
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
    { key: 'wedding', label: 'Wedding Celebration', icon: Heart, color: 'text-[#904b33]', background: 'bg-[#904b33]/10' },
    { key: 'corporate', label: 'Corporate Event', icon: Briefcase, color: 'text-[#154212]', background: 'bg-[#154212]/10' },
    { key: 'birthday', label: 'Birthday Party', icon: PartyPopper, color: 'text-[#c3a066]', background: 'bg-[#c3a066]/10' },
    { key: 'pooja', label: 'Pooja / Religious Event', icon: Flower2, color: 'text-[#783922]', background: 'bg-[#783922]/10' },
    { key: 'houseParty', label: 'House Party', icon: HomeIcon, color: 'text-[#3b6934]', background: 'bg-[#3b6934]/10' },
    { key: 'other', label: 'Custom Event', icon: Sparkles, color: 'text-[#60233e]', background: 'bg-[#60233e]/10' },
];

const OccasionSelectionPage = () => {
    const navigate = useNavigate();
    const [occasionOptions, setOccasionOptions] = useState(baseOccasionOptions);

    const slugify = (value) =>
        (value || '')
            .toString()
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') || '';

    useEffect(() => {
        const loadOccasions = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/admin/occasions.php`);
                const result = await response.json();
                if (result.success && Array.isArray(result.data)) {
                    const dynamic = result.data.map((occ) => ({
                        key: slugify(occ.name),
                        label: occ.name,
                        icon: Sparkles,
                        color: 'text-[#2d5a27]',
                        background: 'bg-[#2d5a27]/10',
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
        const selectedOccasion = occasionOptions.find((option) => option.key === key);
        if (!selectedOccasion) return;

        if (typeof window !== 'undefined') {
            window.localStorage.setItem('selectedOccasionKey', selectedOccasion.key);
            window.localStorage.setItem('selectedOccasion', selectedOccasion.key);
            window.localStorage.setItem('selectedOccasionLabel', selectedOccasion.label);
        }

        // Auto navigate to the menu explicitly for the selected occasion immediately upon selection
        navigate('/occasion-menu', { state: { occasion: selectedOccasion.key } });
    };

    return (
        <div className="min-h-screen bg-[#fcf9f4] text-[#1c1c19] font-sans">
            <header className="fixed top-0 left-0 w-full z-10 bg-[#fcf9f4]/90 backdrop-blur-md border-b border-[#c2c9bb]/20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between shadow-sm">
                    <button
                        type="button"
                        onClick={() => navigate('/select-city')}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#42493e] hover:text-[#904b33] transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        City
                    </button>
                    <BrandLogo
                        className="gap-3"
                        imgClassName="h-8 w-auto rounded-xl"
                        labelClassName="text-xl font-bold tracking-tight text-[#154212]"
                    />
                    <div className="w-16" />
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
                <div className="text-center mb-16">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-xs font-bold text-[#904b33] uppercase tracking-[0.2em] shadow-sm mb-6">
                        Step 2 of 2
                    </span>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-[#154212] tracking-tight mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        What&rsquo;s the occasion?
                    </h1>
                    <p className="text-base md:text-lg text-[#42493e] max-w-2xl mx-auto leading-relaxed">
                        We&rsquo;ll tailor recommendations and pricing for your event type. Select the experience that fits your gathering.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {occasionOptions.map((occasion) => {
                        const Icon = occasion.icon;
                        return (
                            <button
                                key={occasion.key}
                                type="button"
                                onClick={() => handleSelect(occasion.key)}
                                className="group flex flex-col items-center gap-4 rounded-[24px] bg-white p-8 transition-all duration-300 text-center shadow-[0_10px_30px_-10px_rgba(28,28,25,0.05)] hover:-translate-y-2 hover:shadow-[0_20px_40px_-8px_rgba(28,28,25,0.1)] border border-transparent hover:border-[#904b33]/20 cursor-pointer"
                            >
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${occasion.background} transition-transform duration-300 group-hover:scale-110`}>
                                    <Icon className={`w-8 h-8 ${occasion.color}`} />
                                </div>
                                <span className="text-[1.05rem] font-bold text-[#154212] leading-tight mt-2">{occasion.label}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="mt-16 text-center">
                    <p className="text-sm text-[#42493e] max-w-xl mx-auto">
                        Need something custom? Choose &ldquo;Custom Event&rdquo; and our planners will help you craft a bespoke menu.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default OccasionSelectionPage;
