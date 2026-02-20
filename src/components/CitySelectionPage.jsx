import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import BrandLogo from './BrandLogo';

const cityOptions = [
    { name: 'Pune', accent: 'text-[#f27f0d]', background: 'bg-orange-50' },
    { name: 'Bangalore', accent: 'text-blue-600', background: 'bg-blue-50' },
    { name: 'Gurgaon', accent: 'text-indigo-600', background: 'bg-indigo-50' },
    { name: 'Delhi', accent: 'text-rose-500', background: 'bg-rose-50' },
    { name: 'Mumbai', accent: 'text-teal-600', background: 'bg-teal-50' },
    { name: 'Hyderabad', accent: 'text-purple-600', background: 'bg-purple-50' },
    { name: 'Chennai', accent: 'text-yellow-600', background: 'bg-yellow-50' },
    { name: 'Noida', accent: 'text-sky-600', background: 'bg-sky-50' },
];

const CitySelectionPage = () => {
    const navigate = useNavigate();
    const [selectedCity, setSelectedCity] = useState('');

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const storedCity = window.localStorage.getItem('selectedCity');
        if (storedCity) {
            setSelectedCity(storedCity);
        }
    }, []);

    const handleSelect = (cityName) => {
        setSelectedCity(cityName);
    };

    const handleContinue = () => {
        if (!selectedCity) {
            return;
        }

        if (typeof window !== 'undefined') {
            window.localStorage.setItem('selectedCity', selectedCity);
            window.localStorage.removeItem('selectedOccasionLabel');
            window.localStorage.removeItem('selectedOccasionKey');
            window.localStorage.removeItem('selectedOccasion');
        }

        navigate('/select-occasion');
    };

    return (
        <div className="min-h-screen bg-[#f8f7f5] text-slate-800">
            <header className="border-b border-slate-200 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#f27f0d] transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
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
                        <MapPin className="w-4 h-4" />
                        Step 1 of 2
                    </span>
                    <h1 className="mt-6 text-3xl md:text-4xl font-bold text-slate-900">Where should we deliver?</h1>
                    <p className="mt-3 text-sm md:text-base text-slate-500 max-w-2xl mx-auto">
                        Choose the city where your event is taking place. This helps us surface the right kitchens and delivery partners for you.
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {cityOptions.map((city) => {
                        const isActive = city.name === selectedCity;

                        return (
                            <button
                                key={city.name}
                                type="button"
                                onClick={() => handleSelect(city.name)}
                                className={`flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all text-center ${
                                    isActive
                                        ? 'border-[#f27f0d] bg-white shadow-md'
                                        : 'border-slate-100 bg-white/60 hover:border-[#f27f0d]/40 hover:bg-white'
                                }`}
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${city.background}`}>
                                    <span className={`text-base font-semibold ${city.accent}`}>{city.name.charAt(0)}</span>
                                </div>
                                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">{city.name}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs sm:text-sm text-slate-500 text-center sm:text-left">
                        You can always change the city later from the homepage.
                    </div>
                    <button
                        type="button"
                        onClick={handleContinue}
                        className={`inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-semibold transition-colors shadow-sm ${
                            selectedCity
                                ? 'bg-[#f27f0d] text-white hover:bg-[#d9700a]'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                        Continue to Occasion
                    </button>
                </div>
            </main>
        </div>
    );
};

export default CitySelectionPage;
