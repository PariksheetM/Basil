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
} from 'lucide-react';
import MainNavbar from './MainNavbar';

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

        // Custom Event → dedicated dish picker + quote flow
        if (selectedOccasion.key === 'other') {
            navigate('/custom-event');
            return;
        }

        // Auto navigate to the menu explicitly for the selected occasion immediately upon selection
        navigate('/occasion-menu', { state: { occasion: selectedOccasion.key } });
    };

    return (
        <div className="min-h-screen bg-[#fcf9f4] text-[#1c1c19] font-sans">
            <MainNavbar />

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-12">
                <div className="text-center mb-8">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-xs font-bold text-[#904b33] uppercase tracking-[0.18em] shadow-sm mb-4">
                        Step 2 of 2
                    </span>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-[#154212] tracking-tight mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        What&rsquo;s the occasion?
                    </h1>
                    <p className="text-sm text-[#42493e] max-w-lg mx-auto leading-relaxed">
                        We&rsquo;ll tailor recommendations for your event type.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {occasionOptions.map((occasion) => {
                        const Icon = occasion.icon;
                        return (
                            <button
                                key={occasion.key}
                                type="button"
                                onClick={() => handleSelect(occasion.key)}
                                className="group flex items-center gap-3.5 rounded-2xl bg-white px-4 py-3.5 transition-all duration-200 text-left shadow-[0_2px_8px_rgba(28,28,25,0.05)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(28,28,25,0.10)] border border-[#f0ede9] hover:border-[#904b33]/25 cursor-pointer"
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${occasion.background} transition-transform duration-200 group-hover:scale-105`}>
                                    <Icon className={`w-5 h-5 ${occasion.color}`} strokeWidth={1.7} />
                                </div>
                                <span className="text-sm font-bold text-[#154212] leading-snug">{occasion.label}</span>
                                <svg className="ml-auto w-4 h-4 text-[#c2c9bb] group-hover:text-[#904b33] transition-colors flex-shrink-0" fill="none" viewBox="0 0 16 16"><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </button>
                        );
                    })}
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs text-[#42493e] max-w-xl mx-auto">
                        Need something custom? Choose &ldquo;Custom Event&rdquo; and our planners will help you craft a bespoke menu.
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate('/custom-event')}
                        className="mt-3 inline-flex items-center rounded-full bg-[#154212] px-5 py-2 text-xs font-semibold text-white hover:bg-[#1f5a1b] transition-colors"
                    >
                        Custom Event
                    </button>
                </div>
            </main>
        </div>
    );
};

export default OccasionSelectionPage;
