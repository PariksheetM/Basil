import React, { useEffect, useState } from 'react';

const preferenceOptions = [
    {
        id: 'veg',
        title: 'Pure Vegetarian',
        badgeLabel: 'Pure Veg',
        badgeClasses: 'bg-emerald-500/90',
        description:
            'Exclusive plant-based menu featuring gourmet salads, paneer delicacies, and vegan desserts tailored for health-conscious teams.',
        icon: 'spa',
        cardAccent: 'emerald',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMRIPLSiVkCz_4zmfDcKUFZNKpAYa3_-i_7VBeEMFBuSJc6eQsi3StZ7GL5zyQI9LYobHho3y6ibKmsiSH3py89clhl5GuKLiLHgN9qGGpXSyC3fLk6_blbQK4xaZmU48znTK7OW0TMp3sfBat64XEY6-KUH4AswGQc---nwd4c70zIj6Ht9o2B42JhSTL2sCkcS1gqsXEvBY_IgGllvqpKpSNIqluN4Xp1Ppljz1VeNFn96HUOlp0kc1IjXYD_T06KIGN9A19Sko',
    },
    {
        id: 'non-veg',
        title: 'Mixed Menu',
        badgeLabel: 'Non-Veg Included',
        badgeClasses: 'bg-rose-500/90',
        description:
            'A versatile selection including premium poultry, seafood, and mutton dishes alongside vegetarian sides for diverse preferences.',
        icon: 'restaurant_menu',
        cardAccent: 'rose',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkv3haLG_KM4vDRdkoD8KAl-IoDp5MutLp73imgNRYDJBkeXiZpMo6eygTRrh4zQHJAV9f8YYcTo6XfvSU7k-DaFKO_FohmsE1pteAejnISc_fkqUkHhZ4TDvfHZuC0kTEXUe8O3qTKbxNzZGw2loGFdoYM_fuQvS239XvdbSZgLRRYcAmmUjwQlERrghnLjkVLV4N7eysXKSnBm3PWGqL70_s_vvUqB9EpNW9s-2zgPlg6XekQU1PSx6lokDdNHgdClm9BK14FJU',
    },
];

const accentStyles = {
    emerald: {
        focusRing: 'peer-checked:border-emerald-500 peer-checked:ring-1 peer-checked:ring-emerald-500 peer-checked:bg-emerald-50/30',
        badgeBg: 'bg-emerald-100',
        badgeText: 'text-emerald-600',
        checkBg: 'bg-emerald-500',
    },
    rose: {
        focusRing: 'peer-checked:border-rose-500 peer-checked:ring-1 peer-checked:ring-rose-500 peer-checked:bg-rose-50/30',
        badgeBg: 'bg-rose-100',
        badgeText: 'text-rose-600',
        checkBg: 'bg-rose-500',
    },
};

const MenuPreferenceModal = ({ isOpen = true, initialPreference = '', onClose, onConfirm, onSelect }) => {
    const [selection, setSelection] = useState(initialPreference);

    useEffect(() => {
        if (isOpen) {
            setSelection(initialPreference);
        }
    }, [isOpen, initialPreference]);

    // Prevent background scroll while the modal overlay is visible.
    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleConfirm = () => {
        if (!selection) {
            return;
        }
        if (onConfirm) {
            onConfirm(selection);
        }
        if (onSelect) {
            onSelect(selection);
        }
        if (onClose) {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md px-3 py-6 animate-fade-in">
            <div className="absolute inset-0" onClick={onClose} />

            <div className="relative z-10 flex w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-white/10 bg-white shadow-2xl">
                <div className="px-6 pt-6 pb-3 text-center">
                    <h2 className="mb-2 text-2xl font-bold text-gray-900">Select Your Menu Preference</h2>
                    <p className="mx-auto max-w-lg text-base text-gray-500">
                        Help us customize your bulk ordering experience. This will tailor our recommendations for your corporate or social event.
                    </p>
                </div>

                <div className="flex min-h-[360px] flex-col items-stretch justify-center gap-4 px-6 py-4 md:flex-row">
                    {preferenceOptions.map((option) => {
                        const accent = accentStyles[option.cardAccent];
                        const isActive = selection === option.id;

                        return (
                            <label
                                key={option.id}
                                className="group relative flex-1 cursor-pointer transition-transform duration-300 hover:-translate-y-1"
                            >
                                <input
                                    type="radio"
                                    name="menu-preference"
                                    value={option.id}
                                    className="peer sr-only"
                                    checked={isActive}
                                    onChange={() => setSelection(option.id)}
                                />
                                <div
                                    className={`flex h-full flex-col overflow-hidden rounded-lg border-2 border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg ${
                                        isActive ? accent.focusRing : ''
                                    }`}
                                >
                                    <div
                                        className={`absolute right-4 top-4 flex h-8 w-8 scale-75 items-center justify-center rounded-full text-white opacity-0 shadow-md transition-all peer-checked:scale-100 peer-checked:opacity-100 ${accent.checkBg}`}
                                    >
                                        <span className="material-icons text-sm font-bold">check</span>
                                    </div>

                                    <div className="relative h-44 overflow-hidden">
                                        <img
                                            src={option.image}
                                            alt={option.title}
                                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        <div className="absolute bottom-4 left-4">
                                            <span className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm shadow-sm ${option.badgeClasses}`}>
                                                {option.badgeLabel}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-grow flex-col items-center justify-center px-5 pb-5 pt-5 text-center">
                                        <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full ${accent.badgeBg} ${accent.badgeText}`}>
                                            <span className="material-icons">{option.icon}</span>
                                        </div>
                                        <h3 className="mb-2 text-lg font-bold text-gray-900 transition-colors group-hover:text-[#f27f0d]">
                                            {option.title}
                                        </h3>
                                        <p className="px-3 text-sm leading-relaxed text-gray-500">{option.description}</p>
                                    </div>
                                </div>
                            </label>
                        );
                    })}
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg px-4 py-2 font-medium text-gray-500 transition-colors hover:text-gray-800"
                    >
                        Cancel
                    </button>
                    <div className="flex items-center gap-4">
                        <span className="hidden text-xs font-medium text-gray-400 sm:inline-block">Selection required to continue</span>
                        <button
                            type="button"
                            disabled={!selection}
                            onClick={handleConfirm}
                            className={`flex items-center gap-2 rounded-lg px-6 py-2.5 font-semibold text-white shadow-md transition-all duration-200 ${
                                selection ? 'bg-[#f27f0d] hover:bg-orange-600 hover:shadow-orange-500/30 active:scale-95' : 'cursor-not-allowed bg-gray-300'
                            }`}
                        >
                            Continue
                            <span className="material-icons text-sm">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MenuPreferenceModal;
