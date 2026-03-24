import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import BrandLogo from './BrandLogo';

const cityOptions = [
    { name: 'Pune', accent: 'text-[#904b33]', background: 'bg-[#904b33]/10' },
    { name: 'Bangalore', accent: 'text-[#154212]', background: 'bg-[#154212]/10' },
    { name: 'Gurgaon', accent: 'text-[#2d5a27]', background: 'bg-[#2d5a27]/10' },
    { name: 'Delhi', accent: 'text-[#c3a066]', background: 'bg-[#c3a066]/10' },
    { name: 'Mumbai', accent: 'text-[#783922]', background: 'bg-[#783922]/10' },
    { name: 'Hyderabad', accent: 'text-[#3b6934]', background: 'bg-[#3b6934]/10' },
    { name: 'Chennai', accent: 'text-[#a67838]', background: 'bg-[#a67838]/10' },
    { name: 'Noida', accent: 'text-[#60233e]', background: 'bg-[#60233e]/10' },
];

const CitySelectionPage = () => {
    const navigate = useNavigate();

    const handleSelect = (cityName) => {
        if (typeof window !== 'undefined') {
            window.localStorage.setItem('selectedCity', cityName);
            window.localStorage.removeItem('selectedOccasionLabel');
            window.localStorage.removeItem('selectedOccasionKey');
            window.localStorage.removeItem('selectedOccasion');
        }
        // Auto navigate to select occasion immediately upon selection
        navigate('/select-occasion');
    };

    return (
        <div className="min-h-screen bg-[#fcf9f4] text-[#1c1c19] font-sans">
            <header className="fixed top-0 left-0 w-full z-10 bg-[#fcf9f4]/90 backdrop-blur-md border-b border-[#c2c9bb]/20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between shadow-sm">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#42493e] hover:text-[#904b33] transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
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
                        <MapPin className="w-4 h-4" />
                        Step 1 of 2
                    </span>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-[#154212] tracking-tight mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        Where should we deliver?
                    </h1>
                    <p className="text-base md:text-lg text-[#42493e] max-w-2xl mx-auto leading-relaxed">
                        Choose the city where your event is taking place. This helps us surface the right kitchens and delivery partners for you.
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                    {cityOptions.map((city) => (
                        <button
                            key={city.name}
                            type="button"
                            onClick={() => handleSelect(city.name)}
                            className="group flex flex-col items-center gap-3 rounded-[24px] bg-white p-6 transition-all duration-300 text-center shadow-[0_10px_30px_-10px_rgba(28,28,25,0.05)] hover:-translate-y-2 hover:shadow-[0_20px_40px_-8px_rgba(28,28,25,0.1)] border border-transparent hover:border-[#904b33]/20 cursor-pointer"
                        >
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${city.background} transition-transform duration-300 group-hover:scale-110`}>
                                <span className={`text-xl font-bold ${city.accent}`}>{city.name.charAt(0)}</span>
                            </div>
                            <span className="text-sm font-bold text-[#154212] uppercase tracking-wide mt-2">{city.name}</span>
                        </button>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <p className="text-sm text-[#42493e] italic">
                        You can always change the city later from the homepage.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default CitySelectionPage;
