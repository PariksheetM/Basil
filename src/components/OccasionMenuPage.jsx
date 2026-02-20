import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BrandLogo from './BrandLogo';

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
const mealPackagesByOccasion = {
    corporate: {
        displayName: 'Corporate Catering',
        description: 'Business-ready menus calibrated for boardrooms, workshops, and town halls.',
        defaultGuests: 80,
        defaultBudget: 350,
        tags: ['Professional', 'Hygienic', 'Bulk orders'],
        packages: [
            {
                id: 'corporate-executive-lunch',
                name: 'Executive Lunch Box',
                description: 'Individually packed gourmet lunch with premium gravies and accompaniments.',
                cuisine: 'North Indian',
                diet: 'veg',
                price: 325,
                image: '/meal-box.jpg',
                badge: { label: 'BOARDROOM READY', icon: 'workspace_premium', classes: 'bg-blue-100 text-blue-600' },
                bestFor: 'Best for 40-200 guests',
                features: [
                    'Paneer Lababdar + Dal Makhani',
                    'Jeera Rice & Butter Naan',
                    'Mini Salad & Dessert',
                ],
                ctaLabel: 'Customize & Add',
                ctaVariant: 'primary',
                highlighted: true,
                isAvailable: true,
                customization: {
                    category: 'EXECUTIVE',
                    basePrice: 325,
                    proteins: [
                        { id: 'exec-paneer', label: 'Paneer Lababdar', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                        { id: 'exec-dal', label: 'Dal Makhani', priceDelta: 0, includedLabel: 'Included' },
                        { id: 'exec-chicken', label: 'Butter Chicken', priceDelta: 45, includedLabel: '+ ₹45' },
                    ],
                    bases: [
                        { id: 'exec-jeera', label: 'Jeera Rice', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                        { id: 'exec-naan', label: 'Butter Naan (x2)', priceDelta: 20, includedLabel: '+ ₹20' },
                    ],
                    addOns: [
                        { id: 'exec-dessert', label: 'Mini Gulab Jamun', priceDelta: 25, description: 'Two pieces' },
                        { id: 'exec-salad', label: 'Kachumber Salad', priceDelta: 15, description: 'Fresh garnish' },
                    ],
                },
            },
            {
                id: 'corporate-sandwich-wrap',
                name: 'Sandwich & Wrap Combo',
                description: 'Assorted gourmet sandwiches and wraps with crisp sides and beverages.',
                cuisine: 'Continental',
                diet: 'both',
                price: 245,
                image: '/sandwich-wrap-combo.png',
                bestFor: 'Best for brainstorming huddles',
                features: [
                    'Signature sandwich or wrap selection',
                    'Herbed potato wedges',
                    'Cold pressed juice or iced tea',
                ],
                ctaLabel: 'Customize',
                ctaVariant: 'outline',
                isAvailable: true,
                customization: {
                    category: 'SANDWICH COMBO',
                    basePrice: 245,
                    proteins: [
                        { id: 'corp-sandwich-paneer', label: 'Paneer Tikka Sandwich', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                        { id: 'corp-sandwich-veggie', label: 'Mediterranean Veg Wrap', priceDelta: 0, includedLabel: 'Included' },
                        { id: 'corp-sandwich-chicken', label: 'Smoked Chicken Club', priceDelta: 30, includedLabel: '+ ₹30' },
                    ],
                    bases: [
                        { id: 'corp-sandwich-bread', label: 'Artisan Bread', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                        { id: 'corp-sandwich-tortilla', label: 'Whole Wheat Tortilla', priceDelta: 15, includedLabel: '+ ₹15' },
                    ],
                    addOns: [
                        { id: 'corp-sandwich-salad', label: 'Side Salad Cup', priceDelta: 22, description: 'Fresh greens + dressing' },
                        { id: 'corp-sandwich-dessert', label: 'Mini Dessert Pot', priceDelta: 25, description: 'Tiramisu or mousse' },
                    ],
                },
            },
            {
                id: 'corporate-mini-snacks',
                name: 'Mini Snack Boxes',
                birthday: {
                    displayName: 'Birthday Party',
                    description: 'Dedicated birthday menus for kids and adults, from budget-friendly to luxury.',
                    defaultGuests: 40,
                    defaultBudget: 350,
                    tags: ['Birthday', 'Kids', 'Live counters'],
                    packages: [
                        {
                            id: 'birthday-basic-kids',
                            name: 'Kids Birthday Basic Meal (Budget Friendly)',
                            description: 'Budget-friendly kids spread with fun staples and a sweet finish.',
                            cuisine: 'Kids Friendly',
                            diet: 'veg',
                            price: 199,
                            image: '/meal-box-kids.png',
                            bestFor: 'Small kids party (20-50 guests)',
                            partyType: 'kids',
                            venue: 'indoor',
                            liveCounter: false,
                            features: ['Mini burger or sandwich', 'French fries + Pasta / noodles + Pizza slice', 'Juice box, Cupcake, Chocolate pastry', 'Option: Add return gift food box'],
                            ctaLabel: 'Customize',
                            ctaVariant: 'outline',
                            isAvailable: true,
                        },
                        {
                            id: 'birthday-standard',
                            name: 'Standard Birthday Party Meal (Most Popular)',
                            description: 'Balanced birthday meal with starters, mains, sweets, and optional cake add-on.',
                            cuisine: 'Traditional',
                            diet: 'both',
                            price: 425,
                            image: '/buffet-thali.png',
                            bestFor: 'Family birthday / house party',
                            partyType: 'adult',
                            venue: 'indoor',
                            liveCounter: false,
                            features: ['Welcome drink; 2 starters (paneer tikka / spring roll)', '2 sabzi + Paneer item + Dal fry', 'Jeera rice + Roti/naan + Salad', 'Sweet (gulab jamun/ice cream), Papad', 'Birthday cake (optional add-on)'],
                            ctaLabel: 'Customize',
                            ctaVariant: 'primary',
                            highlighted: true,
                            isAvailable: true,
                        },
                        {
                            id: 'birthday-premium',
                            name: 'Premium Birthday Celebration Meal',
                            description: 'Restaurant-style birthday spread with mocktails, live pasta option, and richer mains.',
                            cuisine: 'Grand Buffet',
                            diet: 'both',
                            price: 750,
                            image: '/wedding-buffet.png',
                            bestFor: 'Adult birthday / restaurant style party',
                            partyType: 'adult',
                            venue: 'either',
                            liveCounter: true,
                            features: ['Mocktail welcome drink; 3 starters', 'Paneer special + 3 sabzi + Dal makhani', 'Veg pulao/biryani; Butter naan + roti', 'Dessert (2 types) + Ice cream', 'Live pasta counter (optional)'],
                            ctaLabel: 'Customize & Add',
                            ctaVariant: 'primary',
                            isAvailable: true,
                        },
                        {
                            id: 'birthday-luxury',
                            name: 'Luxury Birthday / Grand Celebration',
                            description: 'Banquet-scale celebration with multiple live counters and premium dessert spread.',
                            cuisine: 'Grand Buffet',
                            diet: 'both',
                            price: 1350,
                            image: '/luxury-nonveg-buffet.png',
                            bestFor: '100+ guests / banquet party',
                            partyType: 'adult',
                            venue: 'either',
                            liveCounter: true,
                            features: ['Welcome mocktails; 4 starters; Live chaat counter', '4 sabzi + 2 paneer items + Dal makhani', 'Biryani; Chinese counter; Pasta live counter', 'Dessert counter (4 sweets), Ice cream & brownie', 'Paan counter'],
                            ctaLabel: 'Customize & Add',
                            ctaVariant: 'primary',
                            isAvailable: true,
                        },
                        {
                            id: 'birthday-snack-box-new',
                            name: 'Birthday Snack Box (Takeaway)',
                            description: 'Return-gift friendly snack box for guests or office birthdays.',
                            cuisine: 'Gifting',
                            diet: 'veg',
                            price: 199,
                            image: '/snack-box-coffee.png',
                            bestFor: 'Return gifts / office birthday',
                            partyType: 'either',
                            venue: 'either',
                            liveCounter: false,
                            features: ['Sandwich, Chips, Juice, Chocolate', 'Cupcake + Mini sweet', 'Price bands: ₹99 – ₹299 per box'],
                            ctaLabel: 'Customize',
                            ctaVariant: 'outline',
                            isAvailable: true,
                        },
                    ],
                },
                description: 'Fun-sized mains with juice, fries, and a party treat tailored for kids.',
                cuisine: 'Kids Friendly',
                diet: 'veg',
                price: 210,
                image: '/meal-box-kids.png',
                bestFor: 'Best for kids tables',
                features: [
                    'Cheesy pasta cup or mini roll',
                    'Seasoned smiley fries',
                    'Fresh fruit juice tetra pack',
                ],
                ctaLabel: 'Customize',
                ctaVariant: 'outline',
                isAvailable: true,
                customization: {
                    category: 'KIDS',
                    basePrice: 210,
                    proteins: [
                        { id: 'kids-paneer', label: 'Paneer Nuggets', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                        { id: 'kids-nuggets', label: 'Veg Nuggets', priceDelta: 15, includedLabel: '+ ₹15' },
                        { id: 'kids-chicken', label: 'Chicken Nuggets', priceDelta: 25, includedLabel: '+ ₹25' },
                    ],
                    bases: [
                        { id: 'kids-pasta', label: 'Cheesy Pasta', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                        { id: 'kids-roll', label: 'Mini Paneer Roll', priceDelta: 12, includedLabel: '+ ₹12' },
                    ],
                    addOns: [
                        { id: 'kids-toy', label: 'Surprise Toy', priceDelta: 20, description: 'Age 5-12' },
                        { id: 'kids-dessert', label: 'Chocolate Mousse Cup', priceDelta: 18, description: 'Cup dessert' },
                    ],
                },
            },
            {
                id: 'birthday-cake-combo',
                name: 'Cake + Snacks Combo',
                description: 'Celebration cake paired with savoury and sweet finger food.',
                cuisine: 'Celebration',
                diet: 'veg',
                price: 320,
                image: '/cake-snack-combo.png',
                bestFor: 'Best for cutting ceremony',
                features: [
                    '1.5 kg Fresh Cream Cake',
                    'Savoury Snack Platter',
                    'Assorted Sweets',
                ],
                ctaLabel: 'Customize',
                ctaVariant: 'outline',
                isAvailable: true,
                customization: {
                    category: 'CELEBRATION',
                    basePrice: 320,
                    proteins: [
                        { id: 'cake-vanilla', label: 'Vanilla Cream', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                        { id: 'cake-choco', label: 'Chocolate Truffle', priceDelta: 35, includedLabel: '+ ₹35' },
                    ],
                    bases: [
                        { id: 'cake-snack', label: 'Snack Platter', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                        { id: 'cake-sandwich', label: 'Tea Sandwiches', priceDelta: 20, includedLabel: '+ ₹20' },
                    ],
                    addOns: [
                        { id: 'cake-candles', label: 'Theme Candles', priceDelta: 10, description: 'Set of 6' },
                        { id: 'cake-photo', label: 'Photo Print Topper', priceDelta: 25, description: 'Edible sheet' },
                    ],
                },
            },
            {
                id: 'birthday-pizza-burger',
                name: 'Pizza + Burger Combo',
                description: 'Party favourite combo box featuring pizza slices, sliders, and fries.',
                cuisine: 'Fast Food',
                diet: 'both',
                price: 285,
                image: '/fast-food-box.png',
                bestFor: 'Best for teen parties',
                features: [
                    'Cheese or tandoori pizza slice',
                    'Mini sliders (veg or chicken)',
                    'Seasoned fries & dip',
                ],
                ctaLabel: 'Customize',
                ctaVariant: 'outline',
                isAvailable: true,
                customization: {
                    category: 'PARTY COMBO',
                    basePrice: 285,
                    proteins: [
                        { id: 'combo-veg', label: 'Veg Patty Slider', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                        { id: 'combo-paneer', label: 'Paneer Tikka Slider', priceDelta: 15, includedLabel: '+ ₹15' },
                        { id: 'combo-chicken', label: 'Peri Peri Chicken Slider', priceDelta: 30, includedLabel: '+ ₹30' },
                    ],
                    bases: [
                        { id: 'combo-pizza-cheese', label: 'Cheese Pizza Base', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                        { id: 'combo-pizza-bbq', label: 'BBQ Pizza Base', priceDelta: 18, includedLabel: '+ ₹18' },
                    ],
                    addOns: [
                        { id: 'combo-extra-dip', label: 'Extra Dip Duo', priceDelta: 12, description: 'Cheese + salsa' },
                        { id: 'combo-soda', label: 'Cold Drink Can', priceDelta: 22, description: '330 ml' },
                    ],
                },
            },
            {
                id: 'birthday-starter-platter',
                name: 'Party Starter Platter',
                description: 'Large sharing platter stacked with paneer tikka, kebabs, and crispy bites.',
                cuisine: 'Starters',
                diet: 'both',
                price: 310,
                image: '/party-starter-platter.png',
                bestFor: 'Best for welcome hour',
                features: [
                    'Paneer tikka & corn seekh kebab',
                    'Crispy potato cigars with dips',
                    'Mini chicken tikka or soya chaap',
                ],
                ctaLabel: 'Customize',
                ctaVariant: 'outline',
                isAvailable: true,
                customization: {
                    category: 'STARTER PLATTER',
                    basePrice: 310,
                    proteins: [
                        { id: 'starter-paneer', label: 'Paneer Tikka', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                        { id: 'starter-soya', label: 'Soya Chaap', priceDelta: 15, includedLabel: '+ ₹15' },
                        { id: 'starter-chicken', label: 'Murgh Malai', priceDelta: 35, includedLabel: '+ ₹35' },
                    ],
                    bases: [
                        { id: 'starter-classic', label: 'Classic Platter', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                        { id: 'starter-premium', label: 'Live Grill Setup', priceDelta: 55, includedLabel: '+ ₹55' },
                    ],
                    addOns: [
                        { id: 'starter-dips', label: 'Dip Trio Upgrade', priceDelta: 18, description: 'Cheese, mint, peri peri' },
                        { id: 'starter-live', label: 'Chef Station', priceDelta: 95, description: 'On-site grilling' },
                    ],
                },
            },
            {
                id: 'birthday-dessert-box',
                name: 'Dessert Treat Box',
                description: 'Mini dessert assortment with mousse shots, cupcakes, and celebration sweets.',
                cuisine: 'Desserts',
                diet: 'veg',
                price: 240,
                image: '/dessert-platter.png',
                bestFor: 'Best for sweet finale',
                features: [
                    'Chocolate mousse shot',
                    'Fruit tart bite',
                    'Celebration mithai square',
                ],
                ctaLabel: 'Customize',
                ctaVariant: 'outline',
                isAvailable: true,
                customization: {
                    category: 'DESSERT BOX',
                    basePrice: 240,
                    proteins: [
                        { id: 'dessert-choco', label: 'Chocolate Lovers Mix', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                        { id: 'dessert-fruit', label: 'Fruit Forward Mix', priceDelta: 20, includedLabel: '+ ₹20' },
                    ],
                    bases: [
                        { id: 'dessert-box-classic', label: 'Classic Gift Box', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                        { id: 'dessert-box-theme', label: 'Theme Printed Box', priceDelta: 25, includedLabel: '+ ₹25' },
                    ],
                    addOns: [
                        { id: 'dessert-candles', label: 'Sparkler Candles', priceDelta: 12, description: 'Pack of four' },
                        { id: 'dessert-note', label: 'Personalised Thank-you Note', priceDelta: 10, description: 'Custom message card' },
                    ],
                },
            },
        ],
    },
    wedding: {
        displayName: 'Wedding Celebration',
        description: 'Regal spreads and specialty counters curated for wedding festivities.',
        defaultGuests: 200,
        defaultBudget: 550,
        tags: ['Premium', 'Large gathering', '100+ guests'],
        packages: [
            {
                id: 'wedding-basic-economy',
                name: 'Basic Wedding Meal (Economy)',
                description: 'Value-focused thali with core wedding staples for intimate gatherings.',
                cuisine: 'Traditional',
                diet: 'veg',
                price: 325,
                image: '/traditional-thali.png',
                features: ['2 Sabzi + 1 Dal', 'Rice & 4 Roti', 'Sweet (1), Salad, Pickle'],
                ctaLabel: 'Customize',
                ctaVariant: 'outline',
                isAvailable: true,
            },
            {
                id: 'wedding-standard-popular',
                name: 'Standard Wedding Meal (Most Popular)',
                description: 'Balanced wedding spread with welcome drink, paneer and dessert pairings.',
                cuisine: 'Traditional',
                diet: 'veg',
                price: 575,
                image: '/buffet-thali.png',
                features: ['Welcome drink', '3 Sabzi + Paneer item + Dal Fry', 'Jeera rice, Butter roti/naan', 'Sweet (2) & Ice cream, Salad, Papad'],
                ctaLabel: 'Customize',
                ctaVariant: 'primary',
                highlighted: true,
                isAvailable: true,
            },
            {
                id: 'wedding-premium-meal',
                name: 'Premium Wedding Meal',
                description: 'Elevated multi-course with starters, dual paneer mains, and live counter option.',
                cuisine: 'Grand Buffet',
                diet: 'veg',
                price: 1000,
                image: '/wedding-buffet.png',
                features: [
                    'Welcome drink (2 options) + Starter (2)',
                    '4 Sabzi + 2 Paneer + Dal Makhani',
                    'Veg pulao, Butter naan & roti',
                    'Sweet (3), Ice cream, Salad bar, Live counter optional',
                ],
                ctaLabel: 'Customize & Add',
                ctaVariant: 'primary',
                isAvailable: true,
            },
            {
                id: 'wedding-royal-luxury-buffet',
                name: 'Royal Wedding / Luxury Buffet',
                description: 'Opulent live experience with multiple counters, mocktails, and dessert theatre.',
                cuisine: 'Grand Buffet',
                diet: 'both',
                price: 2200,
                image: '/luxury-nonveg-buffet.png',
                features: [
                    'Mocktails counter, Starter (4 types), Live chaat counter',
                    '5 Sabzi + 3 Paneer, Dal, Biryani, Chinese & South Indian counters',
                    'Dessert counter (5+), Ice cream & brownie, Live jalebi, Paan counter',
                ],
                ctaLabel: 'Customize & Add',
                ctaVariant: 'primary',
                isAvailable: true,
            },
            {
                id: 'wedding-box-packed-meal',
                name: 'Wedding Box (Packed Meal)',
                description: 'Takeaway / return gift meal boxes in mini, standard, premium, and deluxe tiers.',
                cuisine: 'Gifting',
                diet: 'veg',
                price: 299,
                image: '/return-gift-box.png',
                features: ['Mini ₹199 · Standard ₹299 · Premium ₹499 · Deluxe ₹799', 'Includes sweet, sabzi, roti, rice, dessert', 'Comes with spoon & tissue'],
                ctaLabel: 'Customize',
                ctaVariant: 'outline',
                isAvailable: true,
            },
            {
                id: 'wedding-premium-buffet',
                name: 'Premium Wedding Buffet',
                description: 'Lavish multi-course buffet with live chef actions and premium desserts.',
                cuisine: 'Grand Buffet',
                diet: 'both',
                price: 650,
                image: '/wedding-buffet.png',
                badge: { label: 'SIGNATURE', icon: 'diamond', classes: 'bg-rose-100 text-rose-600' },
                bestFor: 'Best for 150-400 guests',
                features: [
                    '6 Live Counters',
                    '8 Main Course Selections',
                    'Dessert & Paan Lounge',
                ],
                ctaLabel: 'Customize & Add',
                ctaVariant: 'primary',
                highlighted: true,
                isAvailable: true,
                customization: {
                    category: 'ROYAL',
                    basePrice: 650,
                    proteins: [
                        { id: 'wedding-paneer', label: 'Dal Bukhara + Paneer', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                        { id: 'wedding-chicken', label: 'Butter Chicken', priceDelta: 60, includedLabel: '+ ₹60' },
                        { id: 'wedding-mutton', label: 'Rogan Josh', priceDelta: 95, includedLabel: '+ ₹95' },
                    ],
                    bases: [
                        { id: 'wedding-breads', label: 'Live Bread Basket', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                        { id: 'wedding-rice', label: 'Zafrani Pulao', priceDelta: 35, includedLabel: '+ ₹35' },
                    ],
                    addOns: [
                        { id: 'wedding-cocktail', label: 'Mocktail Bar', priceDelta: 120, description: 'Mixologist led' },
                        { id: 'wedding-dessert', label: 'Nitro Ice Cream Station', priceDelta: 140, description: 'Live dessert' },
                    ],
                },
            },
            {
                id: 'wedding-luxury-nonveg-buffet',
                name: 'Luxury Non-Veg Buffet',
                description: 'Opulent buffet headlined by chef-curated non-vegetarian mains and regal accompaniments.',
                cuisine: 'Grand Buffet',
                diet: 'non-veg',
                price: 690,
                image: '/luxury-nonveg-buffet.png',
                bestFor: 'Best for sangeet or reception night',
                features: [
                    'Butter chicken handi & mutton rogan josh',
                    'Seafood biryani with live carving station',
                    'Signature grills with gourmet breads',
                ],
                ctaLabel: 'Customize & Add',
                ctaVariant: 'primary',
                isAvailable: true,
                customization: {
                    category: 'ROYAL NON-VEG BUFFET',
                    basePrice: 690,
                    proteins: [
                        { id: 'luxury-chicken', label: 'Butter Chicken Handi', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                        { id: 'luxury-mutton', label: 'Rogan Josh', priceDelta: 60, includedLabel: '+ ₹60' },
                        { id: 'luxury-seafood', label: 'Konkani Seafood Curry', priceDelta: 85, includedLabel: '+ ₹85' },
                    ],
                    bases: [
                        { id: 'luxury-breads', label: 'Roomali & Garlic Naan', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                        { id: 'luxury-rice', label: 'Seafood Pulao', priceDelta: 32, includedLabel: '+ ₹32' },
                    ],
                    addOns: [
                        { id: 'luxury-kebab', label: 'Live Seekh Kebab Station', priceDelta: 110, description: 'Chef-led grilling' },
                        { id: 'luxury-dessert', label: 'Dessert Flaming Counter', priceDelta: 140, description: 'Flambé showcase' },
                    ],
                },
            },
            {
                id: 'wedding-royal-veg-thali',
                name: 'Royal Veg Thali',
                description: 'Seated royal thali service with chef-led plating and premium accompaniments.',
                cuisine: 'Traditional',
                diet: 'veg',
                price: 460,
                image: '/traditional-thali.png',
                bestFor: 'Best for family lunch events',
                features: [
                    'Silver thali setup with regional starters',
                    'Six course royal mains & breads',
                    'Rasmalai, paan shots & mukhwas',
                ],
                ctaLabel: 'Customize',
                ctaVariant: 'outline',
                isAvailable: true,
                customization: {
                    category: 'ROYAL THALI',
                    basePrice: 460,
                    proteins: [
                        { id: 'royal-paneer', label: 'Paneer Khurchan', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                        { id: 'royal-sabzi', label: 'Seasonal Subz Handi', priceDelta: 0, includedLabel: 'Included' },
                        { id: 'royal-kofte', label: 'Shahi Malai Kofte', priceDelta: 35, includedLabel: '+ ₹35' },
                    ],
                    bases: [
                        { id: 'royal-breads', label: 'Phulka & Sheermal', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                        { id: 'royal-rice', label: 'Zafrani Pulao', priceDelta: 28, includedLabel: '+ ₹28' },
                    ],
                    addOns: [
                        { id: 'royal-live-dessert', label: 'Live Jalebi Counter', priceDelta: 65, description: 'With rabdi topping' },
                        { id: 'royal-decor', label: 'Thali Styling & Florals', priceDelta: 40, description: 'Table florals & runners' },
                    ],
                },
            },
            {
                id: 'wedding-sweet-dessert',
                name: 'Sweet & Dessert Boxes',
                description: 'Dessert curation with mithai, petit fours, and celebration jars for gifting or dessert tables.',
                cuisine: 'Desserts',
                diet: 'veg',
                price: 285,
                image: '/sweet-box.png',
                bestFor: 'Best for dessert counters',
                features: [
                    'Assorted artisan mithai',
                    'Dessert jars & petit fours',
                    'Custom toppers & ribbons',
                ],
                ctaLabel: 'Customize',
                ctaVariant: 'outline',
                isAvailable: true,
                customization: {
                    category: 'DESSERT GIFTS',
                    basePrice: 285,
                    proteins: [
                        { id: 'dessert-mithai', label: 'Traditional Mithai Mix', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                        { id: 'dessert-fusion', label: 'Fusion Dessert Mix', priceDelta: 25, includedLabel: '+ ₹25' },
                        { id: 'dessert-gourmet', label: 'Patisserie Petit Fours', priceDelta: 35, includedLabel: '+ ₹35' },
                    ],
                    bases: [
                        { id: 'dessert-box-gold', label: 'Gold Foil Box', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                        { id: 'dessert-box-luxe', label: 'Luxe Keepsake Box', priceDelta: 38, includedLabel: '+ ₹38' },
                    ],
                    addOns: [
                        { id: 'dessert-tag', label: 'Custom Tag & Ribbon', priceDelta: 12, description: 'Names or monogram' },
                        { id: 'dessert-delivery', label: 'Room Drop Logistics', priceDelta: 28, description: 'Hotel coordination' },
                    ],
                },
            },
            {
                id: 'wedding-return-gift-box',
                name: 'Return Gift Sweet Boxes',
                description: 'Handcrafted sweet gift sets with bespoke packaging for guest takeaways.',
                cuisine: 'Gifting',
                diet: 'veg',
                price: 225,
                image: '/return-gift-box.png',
                bestFor: 'Best for bidaai favours',
                features: [
                    'Premium dry fruit mithai selection',
                    'Customisable thank-you cards',
                    'Handwrapped designer boxes',
                ],
                ctaLabel: 'Customize',
                ctaVariant: 'outline',
                isAvailable: true,
                customization: {
                    category: 'RETURN GIFTS',
                    basePrice: 225,
                    proteins: [
                        { id: 'return-mithai', label: 'Traditional Mithai Duo', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                        { id: 'return-dryfruit', label: 'Dry Fruit Bonbons', priceDelta: 18, includedLabel: '+ ₹18' },
                        { id: 'return-gourmet', label: 'Gourmet Praline Mix', priceDelta: 28, includedLabel: '+ ₹28' },
                    ],
                    bases: [
                        { id: 'return-box-classic', label: 'Classic Box', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                        { id: 'return-box-keepsake', label: 'Keepsake Trunk Box', priceDelta: 32, includedLabel: '+ ₹32' },
                    ],
                    addOns: [
                        { id: 'return-tag', label: 'Personalised Tag & Ribbon', priceDelta: 10, description: 'Names & date' },
                        { id: 'return-delivery', label: 'Hotel Room Drop', priceDelta: 26, description: 'Coordinated logistics' },
                    ],
                },
            },
            {
                id: 'wedding-welcome-drinks',
                name: 'Welcome Drink Counter',
                description: 'Immersive welcome beverage bar with signature mocktails, infusions, and garnish theatre.',
                cuisine: 'Beverages',
                diet: 'veg',
                price: 230,
                image: '/welcome-drinks.png',
                bestFor: 'Best for baraat reception',
                features: [
                    'Fresh mocktail & cold-pressed juice menu',
                    'Infused detox water dispensers',
                    'Live garnish and dry-ice show',
                ],
                ctaLabel: 'Customize',
                ctaVariant: 'outline',
                isAvailable: true,
                customization: {
                    category: 'BEVERAGE COUNTER',
                    basePrice: 230,
                    proteins: [
                        { id: 'drink-mocktail', label: 'Mocktail Trio', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                        { id: 'drink-juice', label: 'Cold Pressed Juice', priceDelta: 20, includedLabel: '+ ₹20' },
                    ],
                    bases: [
                        { id: 'drink-glass', label: 'Glassware Service', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                        { id: 'drink-copper', label: 'Copper & Brassware Setup', priceDelta: 28, includedLabel: '+ ₹28' },
                    ],
                    addOns: [
                        { id: 'drink-flaring', label: 'Flair Bartender', priceDelta: 75, description: 'Show element' },
                        { id: 'drink-canape', label: 'Canape Pairing', priceDelta: 55, description: 'Two bite snacks' },
                    ],
                },
            },
            {
                id: 'wedding-live-counter',
                name: 'Live Counter Packages',
                description: 'Interactive stations like chaat, pasta, grills, or oriental wok.',
                cuisine: 'Live Counter',
                diet: 'both',
                price: 360,
                image: '/live-counter.png',
                features: [
                    'Choose any two stations',
                    'Chef & Service Staff',
                    'Complimentary Condiments',
                ],
                ctaLabel: 'Customize',
                ctaVariant: 'outline',
                isAvailable: true,
                customization: {
                    category: 'LIVE STATION',
                    basePrice: 360,
                    proteins: [
                        { id: 'live-chaat', label: 'Delhi Chaat', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                        { id: 'live-pasta', label: 'Italian Pasta', priceDelta: 35, includedLabel: '+ ₹35' },
                        { id: 'live-grill', label: 'Kebab Grill', priceDelta: 45, includedLabel: '+ ₹45' },
                    ],
                    bases: [
                        { id: 'live-service', label: 'Standard Service', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                        { id: 'live-premium', label: 'Premium Service Ware', priceDelta: 28, includedLabel: '+ ₹28' },
                    ],
                    addOns: [
                        { id: 'live-decor', label: 'Counter Styling', priceDelta: 32, description: 'Theme decor' },
                        { id: 'live-musician', label: 'Live Folk Artist', priceDelta: 140, description: '30 min set' },
                    ],
                },
            },
        ],
    },
    houseParty: {
        displayName: 'House Party',
        description: 'Shareable platters and combos engineered for intimate gatherings.',
        defaultGuests: 35,
        defaultBudget: 320,
        packages: [
            {
                id: 'house-starter-platters',
                name: 'Starter Platters',
                description: 'Assorted small bites with dips and garnish kits.',
                cuisine: 'Tapas',
                diet: 'veg',
                price: 285,
                image: '/tapas-platters.png',
                features: [
                    'Cheese & Crudite Platter',
                    'Mediterranean Dips Trio',
                    'Mini Puff Pastries',
                ],
                ctaLabel: 'Customize',
                ctaVariant: 'outline',
                isAvailable: true,
                customization: {
                    category: 'TAPAS',
                    basePrice: 285,
                    proteins: [
                        { id: 'tapas-cheese', label: 'Cheese Selection', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                        { id: 'tapas-paneer', label: 'Paneer Tikka Bites', priceDelta: 25, includedLabel: '+ ₹25' },
                    ],
                    bases: [
                        { id: 'tapas-crackers', label: 'Gourmet Crackers', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                        { id: 'tapas-bread', label: 'Mini Focaccia', priceDelta: 18, includedLabel: '+ ₹18' },
                    ],
                    addOns: [
                        { id: 'tapas-fruit', label: 'Fruit Skewers', priceDelta: 28, description: 'Seasonal fruits' },
                        { id: 'tapas-dip', label: 'Extra Dip Trio', priceDelta: 22, description: 'Spinach, beet, hummus' },
                    ],
                },
            },
            {
                id: 'house-bbq-combo',
                name: 'BBQ Combo',
                description: 'Smoked meats and grilled veggies with sauces and sides.',
                cuisine: 'BBQ',
                diet: 'non-veg',
                price: 380,
                image: '/grilled-chicken.png',
                badge: { label: 'GRILL FAVORITE', icon: 'outdoor_grill', classes: 'bg-red-100 text-red-600' },
                features: [
                    'Chicken Drumettes',
                    'Garlic Herb Prawns',
                    'Fire-roasted Veg Skewers',
                ],
                ctaLabel: 'Customize & Add',
                ctaVariant: 'primary',
                highlighted: true,
                isAvailable: true,
                customization: {
                    category: 'BBQ',
                    basePrice: 380,
                    proteins: [
                        { id: 'bbq-chicken', label: 'Smoked Chicken', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                        { id: 'bbq-paneer', label: 'Paneer Skewers', priceDelta: 0, includedLabel: 'Included' },
                        { id: 'bbq-lamb', label: 'Chipotle Lamb Chops', priceDelta: 65, includedLabel: '+ ₹65' },
                    ],
                    bases: [
                        { id: 'bbq-bread', label: 'Garlic Butter Bread', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                        { id: 'bbq-rice', label: 'Herbed Rice Pilaf', priceDelta: 25, includedLabel: '+ ₹25' },
                    ],
                    addOns: [
                        { id: 'bbq-salad', label: 'Charred Corn Salad', priceDelta: 30, description: 'Feta & lime' },
                        { id: 'bbq-sauce', label: 'Signature Sauce Kit', priceDelta: 35, description: 'Three jars' },
                    ],
                },
            },
            {
                id: 'house-dinner-tray',
                name: 'Dinner Combo Trays',
                description: 'Family-style trays with mains, carbs, and accompaniments.',
                cuisine: 'Comfort',
                diet: 'both',
                price: 340,
                image: '/family-dinner.png',
                features: [
                    'Two Chef Specials',
                    'Bread & Rice Pairing',
                    'Seasonal Salad Bowl',
                ],
                ctaLabel: 'Customize',
                ctaVariant: 'outline',
                isAvailable: true,
                customization: {
                    category: 'COMFORT',
                    basePrice: 340,
                    proteins: [
                        { id: 'dinner-paneer', label: 'Paneer Butter Masala', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                        { id: 'dinner-chicken', label: 'Chicken Tikka Masala', priceDelta: 40, includedLabel: '+ ₹40' },
                    ],
                    bases: [
                        { id: 'dinner-naan', label: 'Tandoori Roti', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                        { id: 'dinner-rice', label: 'Jeera Rice', priceDelta: 18, includedLabel: '+ ₹18' },
                    ],
                    addOns: [
                        { id: 'dinner-dessert', label: 'Phirni Cups', priceDelta: 24, description: 'Individual serving' },
                        { id: 'dinner-drink', label: 'Lemonade Jar', priceDelta: 20, description: 'Serve chilled' },
                    ],
                },
            },
            {
                id: 'house-dessert-box',
                name: 'Dessert Boxes',
                description: 'Sweet endings with mini pastries, brownies, and mousse shots.',
                cuisine: 'Desserts',
                diet: 'veg',
                price: 260,
                image: '/dessert-platter.png',
                features: [
                    'Mini Churros + Chocolate',
                    'Salted Caramel Tartlets',
                    'Seasonal Fruit Shots',
                ],
                ctaLabel: 'Customize',
                ctaVariant: 'outline',
                isAvailable: true,
                customization: {
                    category: 'DESSERTS',
                    basePrice: 260,
                    proteins: [
                        { id: 'dessert-churro', label: 'Choco Churros', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                        { id: 'dessert-fudge', label: 'Salted Caramel Fudge', priceDelta: 20, includedLabel: '+ ₹20' },
                    ],
                    bases: [
                        { id: 'dessert-shot', label: 'Fruit Shot Base', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                        { id: 'dessert-cake', label: 'Cheesecake Bite', priceDelta: 30, includedLabel: '+ ₹30' },
                    ],
                    addOns: [
                        { id: 'dessert-icecream', label: 'Ice Cream Cups', priceDelta: 35, description: '100 ml each' },
                        { id: 'dessert-candy', label: 'Candy Jar', priceDelta: 20, description: 'Colorful mix' },
                    ],
                },
            },
        ],
    },
    pooja: {
        displayName: 'Pooja Ceremony',
        description: 'Pure satvik menus prepared without onion or garlic, ideal for rituals.',
        defaultGuests: 60,
        defaultBudget: 280,
        packages: [
            {
                id: 'pooja-satvik-thali',
                name: 'Satvik Thali',
                description: 'Temple style thali with balanced satvik courses.',
                cuisine: 'Satvik',
                diet: 'satvik',
                price: 260,
                image: '/pooja-thali.png',
                badge: { label: 'MOST LOVED', icon: 'favorite', classes: 'bg-emerald-100 text-emerald-600' },
                features: [
                    'Aloo Sabzi + Kala Chana',
                    'Jeera Rice + Poori',
                    'Kheer Dessert',
                ],
                ctaLabel: 'Customize & Add',
                ctaVariant: 'primary',
                highlighted: true,
                isAvailable: true,
                customization: {
                    category: 'SATVIK',
                    basePrice: 260,
                    proteins: [
                        { id: 'satvik-paneer', label: 'Paneer Sabzi', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                        { id: 'satvik-dal', label: 'Moong Dal Tadka', priceDelta: 0, includedLabel: 'Included' },
                        { id: 'satvik-soy', label: 'Soy Chunk Curry', priceDelta: 25, includedLabel: '+ ₹25' },
                    ],
                    bases: [
                        { id: 'satvik-rice', label: 'Ghee Jeera Rice', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                        { id: 'satvik-millet', label: 'Foxtail Millet', priceDelta: 15, includedLabel: '+ ₹15' },
                    ],
                    addOns: [
                        { id: 'satvik-ladoo', label: 'Besan Ladoo', priceDelta: 20, description: 'Two pieces' },
                        { id: 'satvik-fruit', label: 'Seasonal Fruit Cup', priceDelta: 15, description: 'Cut fruits' },
                    ],
                },
            },
            {
                id: 'pooja-prasad-box',
                name: 'Prasad Box',
                description: 'Classic prasad selection packed individually.',
                cuisine: 'Prasad',
                diet: 'satvik',
                price: 180,
                image: '/vegan-falafel.png',
                features: [
                    'Kesari Bath',
                    'Dry Fruit Mix',
                    'Banana Halwa',
                ],
                ctaLabel: 'Customize',
                ctaVariant: 'outline',
                isAvailable: true,
                customization: {
                    category: 'PRASAD',
                    basePrice: 180,
                    proteins: [
                        { id: 'prasad-sweet', label: 'Kesari Bath', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                        { id: 'prasad-ladoo', label: 'Boondi Ladoo', priceDelta: 15, includedLabel: '+ ₹15' },
                    ],
                    bases: [
                        { id: 'prasad-box', label: 'Palm Leaf Box', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                        { id: 'prasad-potli', label: 'Fabric Potli', priceDelta: 20, includedLabel: '+ ₹20' },
                    ],
                    addOns: [
                        { id: 'prasad-incense', label: 'Sandal Incense Pack', priceDelta: 18, description: '10 sticks' },
                        { id: 'prasad-camphor', label: 'Pure Camphor', priceDelta: 12, description: '5 tablets' },
                    ],
                },
            },
            {
                id: 'pooja-sweet-fruit',
                name: 'Sweet & Fruit Box',
                description: 'Balanced prasad hamper with sweets and seasonal fruits.',
                cuisine: 'Gifting',
                diet: 'satvik',
                price: 215,
                image: '/fruit-sweet-box.png',
                features: [
                    'Seasonal Fruit Cups',
                    'Dry Fruit Laddu',
                    'Tulsi Water Bottle',
                ],
                ctaLabel: 'Customize',
                ctaVariant: 'outline',
                isAvailable: true,
                customization: {
                    category: 'FRUIT & SWEET',
                    basePrice: 215,
                    proteins: [
                        { id: 'sweet-fruit', label: 'Fruit Medley', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                        { id: 'sweet-dryfruit', label: 'Dry Fruit Mix', priceDelta: 18, includedLabel: '+ ₹18' },
                    ],
                    bases: [
                        { id: 'sweet-box', label: 'Eco Kraft Box', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                        { id: 'sweet-basket', label: 'Bamboo Basket', priceDelta: 22, includedLabel: '+ ₹22' },
                    ],
                    addOns: [
                        { id: 'sweet-flower', label: 'Marigold Garland', priceDelta: 16, description: 'Single string' },
                        { id: 'sweet-card', label: 'Temple Card', priceDelta: 10, description: 'Blessing note' },
                    ],
                },
            },
            {
                id: 'pooja-mini-meal',
                name: 'Mini Pooja Meal Pack',
                description: 'Compact satvik meal for quick distribution after the ritual.',
                cuisine: 'Mini Meal',
                diet: 'satvik',
                price: 205,
                image: '/mini-meal-pack.png',
                features: [
                    'Lemon Rice',
                    'Vegetable Poriyal',
                    'Kesari Dessert',
                ],
                ctaLabel: 'Customize',
                ctaVariant: 'outline',
                isAvailable: true,
                customization: {
                    category: 'MINI MEAL',
                    basePrice: 205,
                    proteins: [
                        { id: 'mini-kootu', label: 'Mixed Veg Kootu', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                        { id: 'mini-paneer', label: 'Paneer Pepper Fry', priceDelta: 18, includedLabel: '+ ₹18' },
                    ],
                    bases: [
                        { id: 'mini-rice', label: 'Lemon Rice', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                        { id: 'mini-millet', label: 'Little Millet Pongal', priceDelta: 15, includedLabel: '+ ₹15' },
                    ],
                    addOns: [
                        { id: 'mini-prasad', label: 'Sacred Tulsi Leaves', priceDelta: 8, description: 'Blessed garnish' },
                        { id: 'mini-water', label: 'Herbal Jeera Water', priceDelta: 12, description: '200 ml' },
                    ],
                },
            },
        ],
    },
    other: {
        displayName: 'Custom Event',
        description: 'Need something unique? Build an entirely bespoke menu with our planners.',
        defaultGuests: 40,
        defaultBudget: 300,
        packages: [
            {
                id: 'other-build-your-own',
                name: 'Build Your Own Menu',
                description: 'Interactive planning experience to craft a menu from scratch.',
                cuisine: 'Custom',
                diet: 'both',
                price: 0,
                image: '/custom-menu-builder.png',
                badge: { label: 'FULLY FLEXIBLE', icon: 'auto_fix_high', classes: 'bg-slate-100 text-slate-600' },
                features: [
                    'Dedicated Menu Strategist',
                    'Ingredient Sourcing Options',
                    'Curated Tastings',
                ],
                ctaLabel: 'Start Building',
                ctaVariant: 'primary',
                highlighted: true,
                isAvailable: true,
                customization: {
                    category: 'CUSTOM BUILDER',
                    basePrice: 0,
                    proteins: [
                        { id: 'custom-veg', label: 'Vegetarian Focus', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                        { id: 'custom-nonveg', label: 'Mixed Menu', priceDelta: 0, includedLabel: 'Included' },
                    ],
                    bases: [
                        { id: 'custom-consult', label: 'Culinary Workshop', priceDelta: 0, includedLabel: 'Included', isDefault: true },
                        { id: 'custom-tasting', label: 'Chef Tasting', priceDelta: 150, includedLabel: '+ ₹150' },
                    ],
                    addOns: [
                        { id: 'custom-event-manager', label: 'Event Manager', priceDelta: 0, description: 'Complimentary consult' },
                        { id: 'custom-live-demo', label: 'Kitchen Walkthrough', priceDelta: 0, description: 'Virtual/live demo' },
                    ],
                },
            },
        ],
    },
};

const OccasionMenuPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [occasionKey, setOccasionKey] = useState('');
    const [selectedCuisine, setSelectedCuisine] = useState('All');
    const [dietFilter, setDietFilter] = useState('all');
    const [guestCount, setGuestCount] = useState(50);
    const [budget, setBudget] = useState(450);
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
                const response = await fetch('http://localhost:8000/api/admin/meals.php');
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

    const occasionDataStatic = occasionKey ? mealPackagesByOccasion[occasionKey] : null;

    const apiPackages = useMemo(() => {
        if (!occasionKey || !apiMeals.length) return [];
        return apiMeals
            .filter((meal) => slugify(meal.occasion) === occasionKey || meal.occasion === occasionKey)
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
                    customization: { basePrice: budgetPrice },
                };
            });
    }, [apiMeals, occasionKey]);

    const apiOccasionLabel = apiMeals.find((meal) => slugify(meal.occasion) === occasionKey || meal.occasion === occasionKey)?.occasion;
    const occasionDataDynamic = apiPackages.length
        ? {
              displayName: apiOccasionLabel || occasionKey,
              description: 'Curated menus for your occasion',
              defaultGuests: 50,
              defaultBudget: apiPackages[0]?.price || 400,
              tags: ['Custom'],
              packages: apiPackages,
          }
        : null;

    const occasionData = occasionDataStatic || occasionDataDynamic;
    const packages = occasionData?.packages ?? [];

    useEffect(() => {
        if (!occasionKey) return;
        if (occasionData) return;
        if (apiLoaded && !apiPackages.length) {
            navigate('/home');
        }
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
        setSelectedPackageId(firstAvailable?.id ?? '');
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
            setSelectedPackageId(filteredPackages[0].id);
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

        const defaultProtein = customization.proteins.find((opt) => opt.isDefault) || customization.proteins[0];
        const defaultBase = customization.bases.find((opt) => opt.isDefault) || customization.bases[0];

        setSelectedProteinId(defaultProtein?.id ?? '');
        setSelectedBaseId(defaultBase?.id ?? '');
        setSelectedAddOnIds([]);
    }, [selectedPackage]);

    const selectedProtein = selectedPackage?.customization?.proteins.find((opt) => opt.id === selectedProteinId);
    const selectedBase = selectedPackage?.customization?.bases.find((opt) => opt.id === selectedBaseId);
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
                    customization: pkg.customization,
                },
                packageSelections,
                pricingSnapshot,
            },
        });
    };

    if (!occasionData) {
        return null;
    }

    return (
        <div className="bg-[#f5f3ed] text-slate-800 min-h-screen flex flex-col">
            <nav className="bg-white border-b border-[#e3dfd6] h-16 flex items-center px-6 lg:px-12">
                <div className="flex items-center gap-2 mr-12">
                    <BrandLogo
                        imgClassName="h-8 w-auto"
                        labelClassName="hidden"
                    />
                </div>
                <div className="hidden md:flex items-center gap-8 text-sm font-normal text-slate-600">
                    <button type="button" className="hover:text-slate-900 transition-colors" onClick={goToEvents}>Home</button>
                    <button type="button" className="text-slate-900 font-medium" disabled>
                        Menus
                    </button>
                    <button type="button" className="hover:text-slate-900 transition-colors">Corporate</button>
                    <button type="button" className="hover:text-slate-900 transition-colors">Events</button>
                </div>
                <div className="ml-auto flex items-center gap-3">
                    <button
                        type="button"
                        className="px-5 py-2 bg-[#c9a961] text-white text-sm font-medium rounded hover:bg-[#b89751] transition-colors"
                    >
                        Request Quote
                    </button>
                    <button
                        type="button"
                        className="px-5 py-2 text-slate-700 text-sm font-medium hover:text-slate-900 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 flex flex-col min-w-0 bg-[#f5f3ed]">
                    <div className="bg-white border-b border-[#e3dfd6] px-8 py-5 flex-shrink-0">
                        <div className="flex flex-wrap items-center gap-8">
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">GUESTS</span>
                                <div className="flex items-center border border-slate-300 rounded">
                                    <button
                                        type="button"
                                        onClick={() => adjustGuests(-1)}
                                        className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition"
                                    >
                                        −
                                    </button>
                                    <span className="w-16 text-center font-semibold text-slate-900 border-x border-slate-300">{guestCount}</span>
                                    <button
                                        type="button"
                                        onClick={() => adjustGuests(1)}
                                        className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 flex-1 min-w-[280px] max-w-md">
                                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">BUDGET</span>
                                <div className="flex-1 relative">
                                    <input
                                        type="range"
                                        min={150}
                                        max={800}
                                        value={budget}
                                        onChange={(event) => setBudget(Number(event.target.value))}
                                        className="w-full h-1.5 bg-slate-200 rounded-full cursor-pointer appearance-none"
                                        style={{
                                            background: `linear-gradient(to right, #c9a961 0%, #c9a961 ${((budget - 150) / (800 - 150)) * 100}%, #e5e7eb ${((budget - 150) / (800 - 150)) * 100}%, #e5e7eb 100%)`
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">DIET</span>
                            <div className="flex flex-wrap gap-2">
                                {dietFilters.map((filter) => {
                                    const label = dietFilterLabels[filter] || filter;
                                    const isActive = dietFilter === filter;
                                    return (
                                        <button
                                            key={filter}
                                            type="button"
                                            onClick={() => setDietFilter(filter)}
                                            className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                                                isActive
                                                    ? 'bg-slate-800 text-white border-slate-800'
                                                    : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        {occasionKey === 'birthday' && (
                            <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Party</span>
                                    {['all', 'kids', 'adult'].map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => setPartyTypeFilter(option)}
                                            className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                                                partyTypeFilter === option
                                                    ? 'bg-slate-900 text-white border-slate-900'
                                                    : 'bg-white text-slate-600 border-slate-300 hover:border-slate-500'
                                            }`}
                                        >
                                            {option === 'all' ? 'All' : option === 'kids' ? 'Kids' : 'Adult'}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Venue</span>
                                    {['all', 'indoor', 'outdoor'].map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => setVenueFilter(option)}
                                            className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                                                venueFilter === option
                                                    ? 'bg-slate-900 text-white border-slate-900'
                                                    : 'bg-white text-slate-600 border-slate-300 hover:border-slate-500'
                                            }`}
                                        >
                                            {option === 'all' ? 'Indoor/Outdoor' : option === 'indoor' ? 'Indoor' : 'Outdoor'}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Live Counter</span>
                                    {[{ key: 'all', label: 'Any' }, { key: 'required', label: 'Required' }, { key: 'not-required', label: 'Not Needed' }].map((option) => (
                                        <button
                                            key={option.key}
                                            type="button"
                                            onClick={() => setLiveCounterFilter(option.key)}
                                            className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                                                liveCounterFilter === option.key
                                                    ? 'bg-slate-900 text-white border-slate-900'
                                                    : 'bg-white text-slate-600 border-slate-300 hover:border-slate-500'
                                            }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="mt-4 flex flex-wrap gap-2">
                            {cuisineFilters.map((filter) => (
                                <button
                                    key={filter}
                                    type="button"
                                    onClick={() => setSelectedCuisine(filter)}
                                    className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
                                        selectedCuisine === filter
                                            ? 'bg-[#c9a961] text-white border-[#c9a961]'
                                            : 'bg-white text-slate-600 border-slate-300 hover:border-[#c9a961]'
                                    }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-8 py-10 custom-scrollbar">
                        <div className="max-w-7xl mx-auto">
                            <div className="text-center mb-10">
                                <h1 className="text-4xl font-light text-slate-900 mb-2">Premium Meal Boxes</h1>
                                <p className="text-slate-600 text-base">{occasionData.description}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-32">
                                {noPackages && (
                                    <div className="col-span-full bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
                                        <p className="text-lg font-semibold text-slate-800">No menus match your filters.</p>
                                        <p className="text-sm text-slate-500 mt-2">
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
                                                onClick={() => pkg.isAvailable && handleProceedToCustomize(pkg)}
                                                onKeyDown={(e) =>
                                                    pkg.isAvailable && (e.key === 'Enter' || e.key === ' ')
                                                        ? handleProceedToCustomize(pkg)
                                                        : null
                                                }
                                                className="bg-white rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group flex flex-col h-full border border-slate-200"
                                            >
                                                <div className="relative h-56 bg-slate-100 overflow-hidden">
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
                                                            <h3 className="font-semibold text-lg text-slate-900 leading-tight mb-1">{pkg.name}</h3>
                                                        </div>
                                                        <div className={`ml-2 flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${dietStyles.wrapper} flex-shrink-0`}>
                                                            <div className={`w-2 h-2 rounded-full ${dietStyles.dot}`}></div>
                                                            {dietStyles.label}
                                                        </div>
                                                    </div>
                                                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">{pkg.description}</p>
                                                    <div className="bg-[#fafaf9] rounded-lg p-3 mb-4 flex-1">
                                                        <ul className="text-sm space-y-2 text-slate-700">
                                                            {pkg.features.map((feature) => (
                                                                <li key={feature} className="flex items-start gap-2">
                                                                    <span className="material-icons text-[16px] text-[#c9a961] mt-0.5">check_circle</span>
                                                                    <span className="flex-1">{feature}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
                                                        <div>
                                                            <span className="block text-2xl font-semibold text-slate-900">{formatCurrency(pkg.price)}</span>
                                                            <span className="text-xs text-slate-500">per plate</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => pkg.isAvailable && handleProceedToCustomize(pkg)}
                                                            disabled={!pkg.isAvailable}
                                                            className={`py-2 px-5 rounded font-medium text-sm transition-all ${
                                                                pkg.isAvailable
                                                                    ? 'bg-[#c9a961] text-white hover:bg-[#b89751] shadow-md'
                                                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                                            }`}
                                                        >
                                                            Select
                                                        </button>
                                                    </div>
                                                </div>
                                            </article>
                                        );
                                    })}
                            </div>
                        </div>
                        <div className="fixed bottom-8 right-8 z-50">
                            <div className="bg-slate-900 text-white rounded-full shadow-2xl px-6 py-3 flex items-center gap-4">
                                {selectedPackage && (
                                    <div className="text-sm">
                                        <span className="uppercase text-xs text-slate-400 tracking-wide">ESTIMATE ({guestCount} GUESTS)</span>
                                        <div className="font-semibold">{itemsAddedLabel}</div>
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={() => handleProceedToCustomize()}
                                    disabled={!selectedPackage}
                                    className={`px-6 py-2 rounded-full font-medium text-sm transition-all flex items-center gap-2 ${
                                        selectedPackage
                                            ? 'bg-[#c9a961] hover:bg-[#b89751] text-white'
                                            : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                    }`}
                                >
                                    Proceed to Checkout
                                    <span className="material-icons text-sm">arrow_forward</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default OccasionMenuPage;
