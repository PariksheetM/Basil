import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MapPin,
    Building, Building2, Landmark, Hotel, Warehouse, Store, School, Factory,
} from 'lucide-react';
import MainNavbar from './MainNavbar';

const cityOptions = [
    { name: 'Pune',      Icon: Building,   accent: 'text-[#904b33]', bg: 'bg-[#904b33]/10' },
    { name: 'Bangalore', Icon: Building2,  accent: 'text-[#154212]', bg: 'bg-[#154212]/10' },
    { name: 'Gurgaon',   Icon: Landmark,   accent: 'text-[#2d5a27]', bg: 'bg-[#2d5a27]/10' },
    { name: 'Delhi',     Icon: Hotel,      accent: 'text-[#c3a066]', bg: 'bg-[#c3a066]/10' },
    { name: 'Mumbai',    Icon: Warehouse,  accent: 'text-[#783922]', bg: 'bg-[#783922]/10' },
    { name: 'Hyderabad', Icon: Store,      accent: 'text-[#3b6934]', bg: 'bg-[#3b6934]/10' },
    { name: 'Chennai',   Icon: School,     accent: 'text-[#a67838]', bg: 'bg-[#a67838]/10' },
    { name: 'Noida',     Icon: Factory,    accent: 'text-[#60233e]', bg: 'bg-[#60233e]/10' },
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
            <MainNavbar />

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-12">
                <div className="text-center mb-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-xs font-bold text-[#904b33] uppercase tracking-[0.18em] shadow-sm mb-4">
                        <MapPin className="w-3.5 h-3.5" />
                        Step 1 of 2
                    </span>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-[#154212] tracking-tight mb-3" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        Where should we deliver?
                    </h1>
                    <p className="text-sm md:text-base text-[#42493e] max-w-xl mx-auto leading-relaxed">
                        Choose the city where your event is taking place.
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {cityOptions.map((city) => {
                        const Icon = city.Icon;
                        return (
                            <button
                                key={city.name}
                                type="button"
                                onClick={() => handleSelect(city.name)}
                                className="group flex flex-col items-center gap-2.5 rounded-2xl bg-white px-4 py-5 transition-all duration-200 text-center shadow-[0_2px_8px_rgba(28,28,25,0.06)] hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(28,28,25,0.10)] border border-[#f0ede9] hover:border-[#904b33]/25 cursor-pointer"
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${city.bg} transition-transform duration-200 group-hover:scale-110`}>
                                    <Icon className={`w-6 h-6 ${city.accent}`} strokeWidth={1.6} />
                                </div>
                                <span className="text-xs font-bold text-[#154212] uppercase tracking-wide">{city.name}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="mt-10 text-center">
                    <p className="text-xs text-[#42493e] italic">
                        You can always change the city later from the homepage.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default CitySelectionPage;
