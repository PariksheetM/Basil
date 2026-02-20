import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, Headset, Search, Star } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { useCart } from '../contexts/CartContext';

const PACKAGE_FALLBACK = {
    id: 'royal-corporate-feast',
    name: 'The Royal Corporate Feast',
    description: 'Premium selection curated for corporate banquets',
    basePrice: 2499,
    minGuests: 50,
    image: '/buffet-catering.png',
};

const IMAGE_FALLBACK = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80';

const DEFAULT_MENU_SECTIONS = [
    {
        id: 'starters',
        title: 'Starters',
        helper: 'Select 2',
        maxSelection: 2,
        sticky: true,
        items: [
            {
                id: 'starter-cocktail-samosas',
                name: 'Cocktail Samosas',
                description: 'Crispy mini pastry shells filled with spiced potatoes and peas.',
                type: 'veg',
                priceDelta: 0,
                image:
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuAyWKwspHBLlmCiXKyCqxJWfBW4bNgOdrenh0I3HXRDafcnAzWL08cBg7BBazMurx-2i88Fdfml4BfqVaEPd_aY-oPvLUyMhHh_TXa1tbfQop5iQz4F9uFl2R4ehXx_sh-IxNhxxrbiwGg3qL7PG2kSlQ24iFObx98kEhKrOSwSBzrOm3GK3z82LQjsYmlPmc3lD2WYoSAXWFFvtDqt0XGCgTttMuWKCT1h9_7WbvGPqUWV0h3W7prXT7rgXXWpQLZgF85yv1J1XtA',
                defaultSelected: true,
            },
            {
                id: 'starter-chicken-tikka',
                name: 'Chicken Tikka',
                description: 'Succulent chicken pieces marinated in yogurt and spices.',
                type: 'non-veg',
                priceDelta: 120,
                image:
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuCFToO_EWVLc2_GBwHRnK_OGU9o3Mttp-0Dvybw79SnEz51TcfbD4yti2z72wgcyNSOiOSf6smSUX5MB3CIez3KlDrQ16AGjL6IwOkarNSPkkl-aiMK7kH_9k8iDgXz1BHGNOzO8fEQs_nbQ3LrIb0MUVZeiT0jhXhFBgvpXyS_TLIM_NhSd-Hfq9v4JkWkqSPMV3UmqvgLblG7IlpETXnA8_oE_el_oSzydCwh7apc0BqOX-RsjkLLlRwD_YzIvmAmYDQBDmnzGMc',
                defaultSelected: true,
            },
            {
                id: 'starter-hara-bhara',
                name: 'Hara Bhara Kebab',
                description: 'Spinach and vegetable patties with aromatic spices.',
                type: 'veg',
                priceDelta: 0,
                image:
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuDX3KuiLXFcJvNWkllUgiprF-A_NHLAFC2AnWR-zQ_VheOmNhPSbFCNdMDzCrDfl4lDNtjI6yC5aOlBKM4Ta4Cw1otG7tua8Wpl0ddb45iHxgAHkqv-yx6W_4oPOapguqwLG6P04dfnv9-u05lUvQXFlUeP2iABdA-nb7bPxObOxjKngA6MR4C6E5KMIgiWZmCPBHTMJw2c_XOeMKAUC9xUT75sePy55eRh1jpAsKzNFuTrLNdSnmheVVYVyb-6Gldo18Fskq6_yt4',
            },
            {
                id: 'starter-veg-spring-rolls',
                name: 'Veg Spring Rolls',
                description: 'Crispy rolls filled with shredded vegetables.',
                type: 'veg',
                priceDelta: 0,
                image:
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuDBLhuI5wP3Th3duqTBJTzaxrSmjOOEwut5xpOObb8BFaSbbiqQPwxyjIXDUQzvR-ElsMtakShsedafMKgtNGY2wFIBa-mDgCBD8oqV-7uahTmiNU1QOEADAmJK1DjlCY_b-tX_AoLpBvHzGxhFOLaf_cGJhg08kilPPOdvE32w9THFBTv3rkslDrxAr-6Y7105sY1pRuRnGV04Swyb90gxRfpbKYz64EIHr1w39UDeFTmnVpvrBkXkd-VjVBqASkR3bRBd4tih_s4',
            },
        ],
    },
    {
        id: 'mains',
        title: 'Main Course',
        helper: 'Select 3',
        maxSelection: 3,
        items: [
            {
                id: 'main-butter-chicken',
                name: 'Butter Chicken',
                description: 'Classic roasted chicken in a rich tomato butter gravy.',
                type: 'non-veg',
                priceDelta: 240,
                image:
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuAB6lwBZq6F_lEek2iJeLP9uX0G-piSUREvo6E6xJfOjaZngZjKunlqKfIvsnVx336jZ-h989-m4xLSFoVDliMsEtJd4Z68XpTm5u4Xt5a2wwy5EU0UlpKI_stmdTpK1YKBtnbgXDpX5QrIDZBrmQeZ7f86ixeo0m3RwT1hmfj0r-3gO4Tj5B4xPLNQ8RF67NOQG9nRkTZ2uu_5HhjcgGRrnmLuTsgP1Mr7KPIpFsgrARHjaTIgKWsr0Gb4eVXiOFeDLyd2HzjfifQ',
                defaultSelected: true,
            },
            {
                id: 'main-paneer-butter-masala',
                name: 'Paneer Butter Masala',
                description: 'Cottage cheese cubes in a creamy tomato gravy.',
                type: 'veg',
                priceDelta: 0,
                image:
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuBU516jZa57hiBU67_pIBlsvMavgZuuNB3ykl59JUuEVA_0GUjvkFSMreI0qJPM4gbmQpj5O4qpVZW-0DUXG9bQuTufzVIMCL3z5KSfWYysWuAidlqMyHrd0LFRlhNUlVdfx7jszztd329kMYG92GhG__p1lJ68G82gNbojgcZwl-NQzfXOVL8BRFYJMRPhM7U_0Q2R8p5Da_at-Gg7Ff_L0McxHDtVa333w13av82latm2BvK0Ce0FhLqK7sVN0nqquY3QuS4EsqI',
                defaultSelected: true,
            },
            {
                id: 'main-dal-makhani',
                name: 'Dal Makhani',
                description: 'Slow-cooked black lentils with cream and butter.',
                type: 'veg',
                priceDelta: 0,
                image:
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuDBVIdbQvg42jVMbkmvbiniJfMvmVM7MqKs7Ri2aro6db2hqQtQKNrSfpklbtRgh-eqZF4aQZ0_tIx68yEQK7IV7BdxDkDSSYxuTzfdh-LqE0eZtBM7aqjW0n1ZRpjt0mRyzGBxOl-gHXamUVcMEMKDaAMQX12C67Cvf2ylLSntc78ahbDFQc-4P4YKn2XiBLX4uhMCZ_bq41NnZqHvBaPEGxXZYeh4WzvXcVHh3KhQZgABGNHeMM8gqlpleF2xrFbjejiAuZIOzCk',
                defaultSelected: true,
            },
            {
                id: 'main-dal-tadka',
                name: 'Dal Tadka',
                description: 'Yellow lentils tempered with aromatic spices and ghee.',
                type: 'veg',
                priceDelta: 0,
                image:
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuB7yaiTo3l761wk92PGjjVEFb7nPcNGgJKuYbg4HaxNAAnyOsgbC6puhqAOHUxzM3yKRFe-_E9lYuA5hyds5D-GIOCrUpWI3tfOZTl9M5wiNdy85jrbxPPXH_6SnZRsYVwTVtH7j8GReyUjAMjqXBBzi4KAGK0OMPLik_NZXHmL0b97KjsG-7CRLSzlqnvymfFrq55imphXXtiP-v-_dtdOG2oyXCcUXvdeMp_GcEBjmkBsABaiwiqCZx5w2LxOHnnqrKghiL250m0',
            },
            {
                id: 'main-veg-korma',
                name: 'Royal Vegetable Korma',
                description: 'Seasonal vegetables simmered in cashew gravy.',
                type: 'veg',
                priceDelta: 90,
                image:
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuCu-BCyHhX1hA8wauuJscAZy4stKfTo6z9d5IIdvRDoxq8sS38vGgsSY8R6m_jOjmF-aYYRQEjl9P9JwktaCulMNfLqPGSDfoNuSgoUylgzFFJF8ifgg1NSEDtV2N110EImdRYAuyOmaE1Ib0mlkH8UqB36zSfe8Qb2OEF0m36XwJOpiAnOgUE7TDuFm9VPZ8FqNXyVYtWKqcJzNflZeT8Wh9B2cOhYoL3zZF9IZbbzXGbxwsKOWnYOkJXkKkMn5Q',
            },
        ],
    },
    {
        id: 'breads',
        title: 'Breads & Rice',
        helper: '2 Included',
        maxSelection: 2,
        items: [
            {
                id: 'bread-jeera-rice',
                name: 'Jeera Rice',
                description: 'Fragrant basmati rice tempered with cumin.',
                type: 'veg',
                priceDelta: 0,
                image:
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuCz0tANHZ3YWkJjwN8k7trEUe_j_TNa6pmwYGYyfbN5P-GGbzEB28fC2xeV5Jsr50dB_1NKYPUfktm-jnef3PpESEEst4q_9fSrSql69Rr6T00x9oeedWwwrY2S1CHwVNYgKTS5hqxbjuTAaFz8MycpuGd1Dh9vKQyAfvGoXW2luHCgElX5v0IjdWV93PYdqv5',
                defaultSelected: true,
            },
            {
                id: 'bread-garlic-naan',
                name: 'Garlic Naan',
                description: 'Stone-fired naan brushed with garlic butter.',
                type: 'veg',
                priceDelta: 0,
                image:
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuBJqepNHYH1iV8u4pGkHaxJ4N7gWvIZwSAHxZlryYHGnMRzQqIyU1ZfphYk8C8y827_EwB1T_uyuCXWB8wHsl64QuFpEYbMX8YAxH3krx6xdRwNnSs84TUovLvGFXuEYg0_m1pHTQu5CdFMjl2FmIegwR9c82MG_M2og2EW0bOm5ik1JR194a2vVaR3_OTalKZ',
                defaultSelected: true,
            },
            {
                id: 'bread-kulcha',
                name: 'Stuffed Kulcha',
                description: 'Soft kulcha stuffed with spiced paneer.',
                type: 'veg',
                priceDelta: 60,
                image:
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuCQB6l5ZBIInormKlF6dtGog6AxGJqQ6TwiHj23jmMAu-WB92wkwgFjjXWJawoku23iEqT34y61Ai6nEnvaYNR2s-c0DHOTfmVXARzuhFlIfuucS-yRjGx7in3TqMvOWKTenP-BWEYvWfTJhXbk1FapTfCtnY4M5uG1s4_ljC-L36mQ_JmKz3kmic7Wkubjl9f2',
            },
        ],
    },
    {
        id: 'desserts',
        title: 'Desserts',
        helper: '1 Included',
        maxSelection: 1,
        items: [
            {
                id: 'dessert-gulab-jamun',
                name: 'Gulab Jamun',
                description: 'Warm cardamom soaked dumplings.',
                type: 'veg',
                priceDelta: 0,
                image:
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuCwjY0nkvqCcyIYxMUxL4mj8YIyiceFl9JYZPLGLO8lUV6f3MVcShuz3B7qC2vmsaOf6yDeQN31AkG94ZgytS0Q4vLarP_B9lV17c7EKhoPG_sedlsztgF8AvuPB7EbAMOjQTHil1E6asmbkKTLdJ2YChKEfT9MR28IfvivAEpLjE1PQ51VBo-BaMWiLLLpoILp',
                defaultSelected: true,
            },
            {
                id: 'dessert-rasmalai',
                name: 'Saffron Rasmalai',
                description: 'Chenna discs soaked in saffron milk.',
                type: 'veg',
                priceDelta: 80,
                image:
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuCMuOgjYl4PBGIRAQXWnVYAhUpUXhMkk0w_XOoctyM3n9WN9ZgtXZW1NHMSuYFL19lE8WYk5DSjQVJevAJEISvURi9mw-OWdqGheh7RsuYqVwv0kn_vHBJzU3IpBer9sdKajotsUplxb9Bn3S4vSxikQ_8SHI-l2OFdG7mB5S9rs7jK26pYHepV-9xOPKFeokN_',
            },
            {
                id: 'dessert-tiramisu',
                name: 'Espresso Tiramisu Cups',
                description: 'Italian classic layered with mascarpone.',
                type: 'veg',
                priceDelta: 140,
                image:
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuAK_s45iFZ6H1WfOFQphOO30asdo5Hn2OGYRaK-3KzsP4uEKiHJ7a_oOOgojXZfIsLL5PB1JWwrvp5ozntLfkxJn6xhCpSjmiy0bkBt561aefLtGBkZsH0rhSZt5nWk1-c-vAeo3OuLs1nvRCmyE6qY2X32cVL8h9l0lBT_5cGthS6cFLjOivuijOBq6DHa7UIHKlwzrUawjrJH7VzfS5pzrQhM2l3vIF8bSh_-z26TVg_rvBgLFy_E4HqIaGHNbcqayKGfnWj4z3A',
            },
        ],
    },
    {
        id: 'beverages',
        title: 'Beverages',
        helper: 'Add-on',
        items: [
            {
                id: 'beverage-fresh-lime',
                name: 'Fresh Lime Cooler Station',
                description: 'Live counter with fresh lime soda & salt rims.',
                type: 'veg',
                priceDelta: 120,
                image:
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuA3UuVIa51C30JRMCBqHxHASWbImkXX8YNY8j0bEkT4nFz0rj6l4IAGGA2UXFydTzj9xqSOTw-aLpj3F4LQXYLRdo7A7d-J7NEej3cR2214wGpFymxkM1y5IO4YLRuHWLdZ1S0Afq0zAcC1OGIPYC5d2NlBXaVXUwefXJnJ3SKqlQSdt2CcgGHetiWef9dFcOR-',
            },
            {
                id: 'beverage-cold-coffee',
                name: 'Cold Brew Bar',
                description: 'Nitro cold brew with assorted syrups.',
                type: 'veg',
                priceDelta: 180,
                image:
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuCsxWQL8Sqf7tI9Ka8lG1bltQwThwWsiJcJNZzHkGfB5Muh9OC-ml0vyW6WyxY0zz6Ep6qL3tK0r4n1R6rZJTVmQB-4dYVMtV2mHmxNlNJ5xB5W-wU-5eUtoAVUgBA-RYgrkCh-4z50d-4Uzi5LbNkLtcRVHYLxWR3bX2jmM5cBu10wlv5xjGZ9j_Co9U6Q6Z52',
            },
            {
                id: 'beverage-welcome',
                name: 'Welcome Mocktail Shots',
                description: 'Seasonal welcome drinks served chilled.',
                type: 'veg',
                priceDelta: 150,
                image:
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuCibSvKAa1OQBlypQxbIXa_kJi86f9I0AQDWYr58gf2SwsztRlzi4igFQzzxgC6UWadI-lV7v-aDy3paHzjTWhl6EAXwADY0h_wuZIeBtkCZ-ok9-JxNAcGDuW7C19ux70Gcmx_xq1r21uFOJJiiB2i8EhuRkr1C2LNb9D9Gi1buITi3YV2AqxAifhaWvK9B7Vg',
            },
        ],
    },
];

const SATVIK_MENU_SECTIONS = [
    {
        id: 'starters',
        title: 'Satvik Starters',
        helper: 'Select 2',
        maxSelection: 2,
        sticky: true,
        items: [
            {
                id: 'satvik-sabudana-vada',
                name: 'Sabudana Vada',
                description: 'Crisp tapioca patties fried in cold-pressed peanut oil.',
                type: 'satvik',
                priceDelta: 0,
                image: '/pooja-thali.png',
                defaultSelected: true,
            },
            {
                id: 'satvik-paneer-tikka',
                name: 'Paneer Tikka (No Onion/Garlic)',
                description: 'Curd marinated paneer skewers finished on griddle.',
                type: 'satvik',
                priceDelta: 20,
                image: '/meal-box-salad.png',
                defaultSelected: true,
            },
            {
                id: 'satvik-fruit-chaat',
                name: 'Seasonal Fruit Chaat',
                description: 'Rock-salt tossed fresh fruits with mint.',
                type: 'satvik',
                priceDelta: 0,
                image: '/snack-box-coffee.png',
            },
            {
                id: 'satvik-lauki-tikki',
                name: 'Lauki Badam Tikki',
                description: 'Bottle gourd patties bound with amaranth flour.',
                type: 'satvik',
                priceDelta: 15,
                image: '/vegan-falafel.png',
            },
        ],
    },
    {
        id: 'mains',
        title: 'Satvik Main Course',
        helper: 'Select 3',
        maxSelection: 3,
        items: [
            {
                id: 'satvik-yellow-dal',
                name: 'Yellow Dal Tadka (Jain)',
                description: 'Slow-cooked arhar dal tempered with ghee & cumin.',
                type: 'satvik',
                priceDelta: 0,
                image: '/pooja-thali.png',
                defaultSelected: true,
            },
            {
                id: 'satvik-paneer-makhani',
                name: 'Paneer Makhani (Satvik)',
                description: 'Cashew based tomato gravy finished with fresh cream.',
                type: 'satvik',
                priceDelta: 0,
                image: '/meal-box-salad.png',
                defaultSelected: true,
            },
            {
                id: 'satvik-jeera-aloo',
                name: 'Jeera Aloo',
                description: 'Baby potatoes tossed with cumin, curry leaves & ghee.',
                type: 'satvik',
                priceDelta: 0,
                image: '/vegan-falafel.png',
            },
            {
                id: 'satvik-lauki-kofta',
                name: 'Lauki Kofta',
                description: 'Bottle gourd dumplings simmered in nut-based gravy.',
                type: 'satvik',
                priceDelta: 25,
                image: '/buffet-catering.png',
            },
        ],
    },
    {
        id: 'breads',
        title: 'Breads & Grains',
        helper: '2 Included',
        maxSelection: 2,
        items: [
            {
                id: 'satvik-phulka',
                name: 'Ghee Phulka',
                description: 'Whole wheat phulka finished with cow ghee.',
                type: 'satvik',
                priceDelta: 0,
                image: '/hero-catering.png',
                defaultSelected: true,
            },
            {
                id: 'satvik-basmati',
                name: 'Steamed Basmati Rice',
                description: 'Fragrant rice steamed with cumin & bay leaf.',
                type: 'satvik',
                priceDelta: 0,
                image: '/white-rice.png',
                defaultSelected: true,
            },
            {
                id: 'satvik-millet-khichdi',
                name: 'Little Millet Khichdi',
                description: 'Comforting khichdi made with foxtail millet.',
                type: 'satvik',
                priceDelta: 18,
                image: '/fried-rice.png',
            },
        ],
    },
    {
        id: 'desserts',
        title: 'Satvik Desserts',
        helper: '1 Included',
        maxSelection: 1,
        items: [
            {
                id: 'satvik-kheer',
                name: 'Kesar Kheer',
                description: 'Rice pudding with saffron & pistachios.',
                type: 'satvik',
                priceDelta: 0,
                image: '/snack-box-coffee.png',
                defaultSelected: true,
            },
            {
                id: 'satvik-besan-ladoo',
                name: 'Besan Ladoo',
                description: 'Roasted gram flour sweetened with jaggery.',
                type: 'satvik',
                priceDelta: 15,
                image: '/pooja-thali.png',
            },
            {
                id: 'satvik-rava-sheera',
                name: 'Rava Sheera',
                description: 'Semolina halwa finished with nuts.',
                type: 'satvik',
                priceDelta: 12,
                image: '/meal-box-salad.png',
            },
        ],
    },
    {
        id: 'beverages',
        title: 'Beverages',
        helper: 'Add-on',
        items: [
            {
                id: 'satvik-panakam',
                name: 'Panakam Cooler',
                description: 'Jaggery + ginger + black pepper cooler.',
                type: 'satvik',
                priceDelta: 0,
                image: '/samosa-juice.png',
            },
            {
                id: 'satvik-sweet-lassi',
                name: 'Sweet Lassi',
                description: 'Thick curd drink churned with saffron.',
                type: 'satvik',
                priceDelta: 20,
                image: '/samosa-juice.png',
            },
            {
                id: 'satvik-jeera-shikanji',
                name: 'Herbal Jeera Shikanji',
                description: 'Roasted cumin lemonade with rock salt.',
                type: 'satvik',
                priceDelta: 15,
                image: '/samosa-juice.png',
            },
        ],
    },
];

const filterSectionsByDiet = (sections, allowedTypes) => {
    const allowed = new Set(allowedTypes);
    return sections
        .map((section) => ({
            ...section,
            items: section.items.filter((item) => allowed.has(item.type ?? 'veg')),
        }))
        .filter((section) => section.items.length > 0);
};

const buildInitialSelectionMap = (sections) => {
    const initial = {};
    sections.forEach((section) => {
        const defaults = section.items.filter((item) => item.defaultSelected).map((item) => item.id);
        if (defaults.length) {
            initial[section.id] = defaults;
            return;
        }
        if (!section.items.length) {
            initial[section.id] = [];
            return;
        }
        const limit = section.maxSelection ? Math.min(section.maxSelection, section.items.length) : section.items.length;
        initial[section.id] = section.items.slice(0, limit).map((item) => item.id);
    });
    return initial;
};

const inferItemType = (label = '', packageDiet = '', preference = '') => {
    const normalizedLabel = label.toLowerCase();
    const normalizedDiet = (packageDiet || '').toLowerCase();
    const normalizedPreference = (preference || '').toLowerCase();

    if (normalizedDiet === 'satvik' || normalizedPreference === 'satvik') {
        return 'satvik';
    }

    if (/(chicken|fish|egg|mutton|meat|prawn|bacon|ham|pepperoni)/.test(normalizedLabel)) {
        return 'non-veg';
    }

    if (/(paneer|tofu|soya|vegetable|veg|sabudana|aloo|dal|khichdi|cheese|pizza|fries|burger|dessert|cake)/.test(normalizedLabel)) {
        return normalizedPreference === 'non-veg' && normalizedDiet === 'non-veg' ? 'non-veg' : 'veg';
    }

    if (normalizedPreference === 'veg' || normalizedDiet === 'veg') {
        return 'veg';
    }

    if (normalizedDiet === 'non-veg') {
        return 'non-veg';
    }

    return 'veg';
};

const buildSectionsFromCustomization = (customization, packageMeta = {}, preference = '') => {
    if (!customization) {
        return null;
    }

    const fallbackImage = packageMeta.image || '/meal-box-salad.png';

    const mapOptions = (options = [], defaultToFirst = false) => {
        if (!options.length) {
            return [];
        }
        const hasDefault = options.some((option) => option.isDefault);
        return options.map((option, index) => ({
            id: option.id,
            name: option.label,
            description: option.description || option.includedLabel || 'Customize this course',
            priceDelta: option.priceDelta || 0,
            type: inferItemType(option.label, packageMeta.diet, preference),
            defaultSelected: Boolean(option.isDefault || (!hasDefault && defaultToFirst && index === 0)),
            image: option.image || fallbackImage,
        }));
    };

    const sections = [];
    const proteinItems = mapOptions(customization.proteins, true);
    if (proteinItems.length) {
        sections.push({
            id: 'custom-proteins',
            title: 'Choose Protein',
            helper: 'Select 1',
            maxSelection: 1,
            sticky: true,
            items: proteinItems,
        });
    }

    const baseItems = mapOptions(customization.bases, true);
    if (baseItems.length) {
        sections.push({
            id: 'custom-bases',
            title: 'Choose Base',
            helper: 'Select 1',
            maxSelection: 1,
            items: baseItems,
        });
    }

    const addOnItems = mapOptions(customization.addOns, false);
    if (addOnItems.length) {
        sections.push({
            id: 'custom-addons',
            title: 'Premium Add-ons',
            helper: 'Optional',
            items: addOnItems,
        });
    }

    return sections.length ? sections : null;
};

const formatCurrency = (value) => `₹${value.toLocaleString('en-IN')}`;

export default function CustomizeMealPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { addToCart } = useCart();

    const routeState = location.state || {};

    const packageInfo = {
        ...PACKAGE_FALLBACK,
        ...(routeState.package || {}),
    };

    const packageImage = packageInfo.image || IMAGE_FALLBACK;

    const packageCustomization = routeState.package?.customization;

    const occasionName = routeState.occasionName;
    const packageSelectionsFromOccasion = routeState.packageSelections;
    const pricingSnapshot = routeState.pricingSnapshot;
    const hasOccasionSelections = Boolean(
        packageSelectionsFromOccasion &&
            (packageSelectionsFromOccasion.protein ||
                packageSelectionsFromOccasion.base ||
                (packageSelectionsFromOccasion.addOns && packageSelectionsFromOccasion.addOns.length > 0))
    );

    const normalizedDiet = (routeState.package?.diet || '').toLowerCase();
    const normalizedCuisine = (routeState.package?.cuisine || '').toLowerCase();
    const normalizedName = (routeState.package?.name || '').toLowerCase();

    const isPoojaFlow =
        routeState.occasionKey === 'pooja' ||
        normalizedDiet === 'satvik' ||
        normalizedCuisine.includes('satvik') ||
        normalizedName.includes('satvik');

    const limitToVeg = routeState.preference === 'veg' && !isPoojaFlow;

    const customMenuSections = useMemo(
        () =>
            buildSectionsFromCustomization(
                packageCustomization,
                { diet: packageInfo.diet, image: packageImage },
                routeState.preference
            ),
        [packageCustomization, packageInfo.diet, packageImage, routeState.preference]
    );

    const menuSections = useMemo(() => {
        if (customMenuSections?.length) {
            if (limitToVeg && !isPoojaFlow) {
                const vegOnly = filterSectionsByDiet(customMenuSections, ['veg', 'satvik']);
                return vegOnly.length ? vegOnly : customMenuSections;
            }
            return customMenuSections;
        }

        if (isPoojaFlow) {
            return SATVIK_MENU_SECTIONS;
        }

        if (limitToVeg) {
            return filterSectionsByDiet(DEFAULT_MENU_SECTIONS, ['veg']);
        }

        return DEFAULT_MENU_SECTIONS;
    }, [customMenuSections, isPoojaFlow, limitToVeg]);

    const goHome = () => navigate('/home');
    const goToOccasionMenu = () => {
        if (routeState.occasionKey) {
            navigate('/occasion-menu', { state: { occasion: routeState.occasionKey } });
        } else {
            navigate('/occasion-menu');
        }
    };
    const handleExplore = () => goHome();
    const handleChatWithExpert = () => navigate('/account');
    const handleSaveQuote = () => {
        if (typeof window !== 'undefined') {
            window.print();
        }
    };

    const guestCount = useMemo(
        () => Math.max(Number(routeState.guestCount) || 75, packageInfo.minGuests || 10),
        [routeState.guestCount, packageInfo.minGuests]
    );

    const [selectedMap, setSelectedMap] = useState(() => buildInitialSelectionMap(menuSections));

    useEffect(() => {
        setSelectedMap(buildInitialSelectionMap(menuSections));
    }, [menuSections]);

    const toggleSelection = (sectionId, item) => {
        setSelectedMap((prev) => {
            const current = new Set(prev[sectionId] || []);
            if (current.has(item.id)) {
                current.delete(item.id);
            } else {
                const section = menuSections.find((s) => s.id === sectionId);
                if (section?.maxSelection && current.size >= section.maxSelection) {
                    return prev;
                }
                current.add(item.id);
            }
            return { ...prev, [sectionId]: Array.from(current) };
        });
    };

    const selections = useMemo(() => {
        return menuSections.flatMap((section) =>
            section.items
                .filter((item) => selectedMap[section.id]?.includes(item.id))
                .map((item) => ({ ...item, sectionId: section.id, sectionTitle: section.title }))
        );
    }, [menuSections, selectedMap]);

    const premiumPerPlate = useMemo(
        () =>
            selections
                .filter((item) => item.priceDelta > 0)
                .reduce((total, item) => total + item.priceDelta, 0),
        [selections]
    );

    const basePerPlate = packageInfo.basePrice || 0;
    const baseTotal = basePerPlate * guestCount;
    const premiumTotal = premiumPerPlate * guestCount;
    const taxes = Math.round((baseTotal + premiumTotal) * 0.05);
    const grandTotal = baseTotal + premiumTotal + taxes;
    const perPlateEstimate = guestCount ? Math.round(grandTotal / guestCount) : 0;

    const handleProceedToCheckout = () => {
        const selectedNames = selections.map((item) => item.name);
        const addedItems = selections
            .filter((item) => item.priceDelta > 0)
            .map((item) => ({ id: item.id, name: item.name, price: item.priceDelta }));

        const cartItem = {
            id: `${packageInfo.id}-${Date.now()}`,
            name: packageInfo.name,
            price: basePerPlate,
            quantity: 1,
            guestCount,
            image: packageImage,
            type: routeState.preference || 'both',
            customizations: {
                selectedItems: selectedNames,
                addedItems,
            },
            totalPrice: grandTotal,
        };

        addToCart(cartItem);
        navigate('/checkout', {
            state: {
                from: 'customize',
                orderSummary: {
                    guestCount,
                    basePerPlate,
                    premiumPerPlate,
                    taxes,
                    total: grandTotal,
                },
            },
        });
    };

    const footerSelections = selections.length
        ? selections.slice(0, 3)
        : [{ id: 'none', name: 'No add-ons', type: 'neutral', priceDelta: 0 }];

    return (
        <div className="font-['Public Sans',sans-serif] bg-[#f8f6f6] text-slate-900 min-h-screen">
            <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-[#f8f6f6]/90 backdrop-blur">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <BrandLogo className="flex items-center gap-3" imgClassName="h-9 w-auto" />
                        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
                            <button className="hover:text-[#ec5b13] transition-colors" type="button" onClick={goHome}>Home</button>
                            <button className="hover:text-[#ec5b13] transition-colors" type="button" onClick={handleExplore}>Packages</button>
                            <button className="hover:text-[#ec5b13] transition-colors" type="button">Venues</button>
                            <button className="hover:text-[#ec5b13] transition-colors" type="button">About</button>
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative hidden sm:block">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search menu..."
                                className="bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#ec5b13] w-64"
                            />
                        </div>
                        <button className="bg-[#ec5b13] text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-[#d54f0f] transition-all" type="button">
                            Sign In
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-36">
                <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500 mb-8">
                    <button className="hover:text-[#ec5b13]" type="button" onClick={goHome}>Home</button>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                    <button
                        className={`hover:text-[#ec5b13] ${routeState.occasionKey ? '' : 'cursor-default text-slate-400 hover:text-slate-400'}`}
                        type="button"
                        onClick={routeState.occasionKey ? goToOccasionMenu : undefined}
                        disabled={!routeState.occasionKey}
                    >
                        {occasionName || 'Wedding Celebration'}
                    </button>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                    <span className="text-[#ec5b13] font-medium">Customize Menu</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <aside className="lg:col-span-4 space-y-6">
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-xl">
                                <div className="h-64 bg-cover bg-center relative" style={{ backgroundImage: `url(${packageImage})` }}>
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#221610]/80 to-transparent"></div>
                                    <div className="absolute bottom-4 left-4">
                                        <span className="bg-[#ec5b13] text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">Premium Selection</span>
                                        <h2 className="text-white text-2xl font-bold mt-1">{packageInfo.name}</h2>
                                    </div>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="flex text-[#ec5b13]">
                                            <Star className="w-4 h-4" fill="currentColor" strokeWidth={1.5} />
                                            <Star className="w-4 h-4" fill="currentColor" strokeWidth={1.5} />
                                            <Star className="w-4 h-4" fill="currentColor" strokeWidth={1.5} />
                                            <Star className="w-4 h-4" fill="currentColor" strokeWidth={1.5} />
                                            <Star className="w-4 h-4" strokeWidth={1.5} />
                                        </div>
                                        <span className="text-xs font-medium text-slate-500">4.9 (128 Reviews)</span>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        Complete service for upscale celebrations. Includes professional staff, premium plating, linens, and decor.
                                    </p>
                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Base Price</p>
                                            <p className="text-xl font-bold text-[#ec5b13]">{formatCurrency(basePerPlate)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Capacity</p>
                                            <p className="text-sm font-bold">{packageInfo.minGuests} - {Math.max(packageInfo.minGuests, guestCount)} Guests</p>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-500">Service Fee (15%)</span>
                                            <span className="font-medium">{formatCurrency(taxes)}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-500">Setup & Cleanup</span>
                                            <span className="font-medium text-emerald-600">Included</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-[#ec5b13]/10 border border-[#ec5b13]/20 rounded-xl flex items-start gap-4">
                                <Headset className="w-6 h-6 text-[#ec5b13]" />
                                <div>
                                    <h4 className="text-sm font-bold">Need assistance?</h4>
                                    <p className="text-xs text-slate-500 mt-1">Our consultants can help craft the perfect menu.</p>
                                    <button className="text-[#ec5b13] text-xs font-bold mt-2 hover:underline" type="button" onClick={handleChatWithExpert}>Schedule a call</button>
                                </div>
                            </div>
                        </div>
                    </aside>

                    <section className="lg:col-span-8 space-y-10">
                        {menuSections.map((section, index) => (
                            <div key={section.id} className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-2xl font-bold tracking-tight">{section.title}</h3>
                                    <span className={`${index === 0 ? 'bg-[#ec5b13]/20 text-[#ec5b13]' : 'bg-slate-100 text-slate-500'} px-3 py-1 rounded-full text-xs font-bold`}>
                                        Step {index + 1} of {menuSections.length}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {section.items.map((item) => {
                                        const isSelected = selectedMap[section.id]?.includes(item.id);
                                        const cardImage = item.image || packageImage || IMAGE_FALLBACK;

                                        return (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => toggleSelection(section.id, item)}
                                                className={`group relative bg-white border ${isSelected ? 'border-2 border-[#ec5b13] shadow-lg' : 'border-slate-200 hover:border-[#ec5b13]/50'} rounded-xl p-4 transition-all text-left`}
                                            >
                                                <div className="flex gap-4">
                                                    <div className="w-20 h-20 rounded-lg bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${cardImage})` }}></div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start gap-2">
                                                            <h4 className="font-bold text-slate-900">{item.name}</h4>
                                                            {isSelected && <CheckCircle2 className="w-5 h-5 text-[#ec5b13]" strokeWidth={1.8} />}
                                                        </div>
                                                        <p className="text-xs text-slate-500 mt-1 leading-snug">{item.description}</p>
                                                        <p className={`text-sm font-bold mt-2 ${item.priceDelta > 0 ? 'text-slate-900' : 'text-[#ec5b13]'}`}>
                                                            {item.priceDelta > 0 ? `+ ${formatCurrency(item.priceDelta)} / guest` : 'Included'}
                                                        </p>
                                                    </div>
                                                </div>
                                                {!isSelected && item.priceDelta === 0 && (
                                                    <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-[#ec5b13]/20"></div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </section>
                </div>
            </main>

            <footer className="fixed bottom-0 left-0 w-full z-50 backdrop-blur-lg bg-[#221610]/80 border-t border-[#ec5b13]/20 pb-6 pt-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6 w-full md:w-auto">
                            <div className="hidden sm:block">
                                <p className="text-[10px] uppercase tracking-widest text-slate-300 font-bold mb-1">Your Selection</p>
                                <div className="flex gap-2 custom-scrollbar overflow-x-auto max-w-md pb-1">
                                    {footerSelections.map((item) => (
                                        <div key={item.id} className="shrink-0 flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs border border-white/10 text-white">
                                            <span className={`w-2 h-2 rounded-full ${item.type === 'veg' ? 'bg-emerald-400' : item.type === 'non-veg' ? 'bg-rose-400' : 'bg-slate-400'}`}></span>
                                            {item.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="h-10 w-px bg-white/10 hidden md:block"></div>
                            <div className="flex flex-col">
                                <p className="text-[10px] uppercase tracking-widest text-slate-300 font-bold">Estimated Total</p>
                                <p className="text-2xl font-black text-white">{formatCurrency(grandTotal)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <button
                                type="button"
                                onClick={handleSaveQuote}
                                className="flex-1 md:flex-none border border-[#ec5b13] text-[#ec5b13] px-8 py-3 rounded-lg text-sm font-bold hover:bg-[#ec5b13]/10 transition-all uppercase tracking-wider bg-white/5"
                            >
                                Save Quote
                            </button>
                            <button
                                type="button"
                                onClick={handleProceedToCheckout}
                                className="flex-1 md:flex-none bg-[#ec5b13] text-white px-10 py-3 rounded-lg text-sm font-bold hover:bg-[#d54f0f] transition-all shadow-[0_0_20px_rgba(236,91,19,0.3)] uppercase tracking-wider"
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
