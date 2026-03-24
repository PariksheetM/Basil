import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { imgUrl } from '../utils/imgUrl.js';
import { CheckCircle2, ChevronRight, Headset, Minus, Plus, Star, Users } from 'lucide-react';
import BrandLogo from './BrandLogo';
import NavCartButton from './NavCartButton';
import { useCart } from '../contexts/CartContext';
import { API_BASE_URL } from '../utils/api.js';

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

const getFoodImage = (label = '') => {
    const l = label.toLowerCase();
    if (l.includes('paneer lababdar') || l.includes('paneer tikka masala')) return 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80';
    if (l.includes('paneer tikka')) return 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=400&q=80';
    if (l.includes('shahi paneer') || l.includes('paneer makhani')) return 'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=400&q=80';
    if (l.includes('paneer')) return 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=400&q=80';
    if (l.includes('butter chicken') || l.includes('murgh makhani')) return 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=400&q=80';
    if (l.includes('murgh') || l.includes('chicken tikka')) return 'https://images.unsplash.com/photo-1607532941433-304659e8198a?auto=format&fit=crop&w=400&q=80';
    if (l.includes('chicken')) return 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=400&q=80';
    if (l.includes('dal makhani')) return 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=400&q=80';
    if (l.includes('dal') || l.includes('daal')) return 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&w=400&q=80';
    if (l.includes('biryani')) return 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=400&q=80';
    if (l.includes('pulao') || l.includes('fried rice')) return 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?auto=format&fit=crop&w=400&q=80';
    if (l.includes('jeera rice') || l.includes('jeera') || l.includes('rice')) return 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?auto=format&fit=crop&w=400&q=80';
    if (l.includes('naan')) return 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=400&q=80';
    if (l.includes('roti') || l.includes('paratha') || l.includes('bread')) return 'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=400&q=80';
    if (l.includes('raita')) return 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=400&q=80';
    if (l.includes('salad')) return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80';
    if (l.includes('gulab jamun')) return 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80';
    if (l.includes('chocolate') || l.includes('choco')) return 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=400&q=80';
    if (l.includes('mousse')) return 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?auto=format&fit=crop&w=400&q=80';
    if (l.includes('cake') || l.includes('cupcake')) return 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=400&q=80';
    if (l.includes('dessert') || l.includes('sweet') || l.includes('mithai')) return 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=400&q=80';
    if (l.includes('fruit')) return 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=400&q=80';
    if (l.includes('sandwich')) return 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=400&q=80';
    if (l.includes('wrap')) return 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=400&q=80';
    if (l.includes('nugget')) return 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=400&q=80';
    if (l.includes('pasta')) return 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=400&q=80';
    if (l.includes('pizza')) return 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=400&q=80';
    if (l.includes('burger') || l.includes('slider')) return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80';
    if (l.includes('soya') || l.includes('chaap')) return 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80';
    if (l.includes('kebab') || l.includes('tikka') || l.includes('starter') || l.includes('platter')) return 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80';
    if (l.includes('drink') || l.includes('juice') || l.includes('soda') || l.includes('mocktail')) return 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=400&q=80';
    if (l.includes('dip') || l.includes('sauce')) return 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?auto=format&fit=crop&w=400&q=80';
    if (l.includes('soup')) return 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=400&q=80';
    if (l.includes('samosa') || l.includes('pakora') || l.includes('chaat')) return 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80';
    return null;
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
            image: option.image || getFoodImage(option.label) || fallbackImage,
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

// Build menu sections from admin-added categoryItems (meal.items structure)
const buildSectionsFromCategoryItems = (categoryItems = [], fallbackImage = '') => {
    if (!Array.isArray(categoryItems) || !categoryItems.length) return null;
    const sections = categoryItems
        .filter((cat) => cat.name && Array.isArray(cat.items) && cat.items.length)
        .map((cat) => ({
            id: `cat-${cat.id || cat.name}`,
            title: cat.name,
            helper: `${cat.items.length} Included`,
            // Allow all items to be selected (they're all included in the plan)
            maxSelection: cat.items.length,
            items: cat.items.map((item) => ({
                id: item.id || `item-${item.name}`,
                name: item.name,
                description: item.type === 'non-veg' ? 'Non-Veg' : item.type === 'satvik' ? 'Satvik' : 'Veg',
                priceDelta: 0,
                type: item.type || 'veg',
                defaultSelected: true,
                included: true,
                image: item.image || fallbackImage,
            })),
        }));
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

    // For admin-created plans (id = "remote-N"), fetch live meal data to get categoryItems
    const [apiFetchedCategoryItems, setApiFetchedCategoryItems] = useState(null);
    useEffect(() => {
        const pkgId = routeState.package?.id || '';
        if (!pkgId.startsWith('remote-')) return;
        const numericId = pkgId.replace('remote-', '');
        fetch(`${API_BASE_URL}/admin/meals.php`)
            .then((r) => r.json())
            .then((result) => {
                if (!result.success) return;
                const meal = (result.data || []).find((m) => String(m.id) === String(numericId));
                if (!meal) return;
                const raw = meal.items;
                if (Array.isArray(raw) && raw.length && raw[0]?.items) {
                    setApiFetchedCategoryItems(raw);
                }
            })
            .catch(() => {});
    }, [routeState.package?.id]);

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

    // Admin-added meal plan: build sections from categoryItems
    // Priority: live API fetch > navigate-state categoryItems > customization
    const adminCategorySections = useMemo(() => {
        // 1. Live-fetched items (most reliable)
        if (apiFetchedCategoryItems) {
            const s = buildSectionsFromCategoryItems(apiFetchedCategoryItems, packageImage);
            if (s?.length) return s;
        }
        // 2. Passed through navigate state
        const passedItems = packageInfo.categoryItems;
        if (passedItems) {
            const s = buildSectionsFromCategoryItems(passedItems, packageImage);
            if (s?.length) return s;
        }
        return null;
    }, [apiFetchedCategoryItems, packageInfo.categoryItems, packageImage]);

    const menuSections = useMemo(() => {
        // Admin-panel sections take top priority for remote packages
        if (adminCategorySections?.length) {
            return adminCategorySections;
        }

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
    }, [customMenuSections, adminCategorySections, isPoojaFlow, limitToVeg]);

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

    // ── Veg / Non-Veg split feature ──
    const isBothDiet = (routeState.preference || '').toLowerCase() === 'both'
        || (!routeState.preference && !limitToVeg && !isPoojaFlow);

    const [activeDietTab, setActiveDietTab] = useState('veg');
    const [vegGuestCount, setVegGuestCount] = useState(() => Math.round(guestCount / 2));
    const [nonVegGuestCount, setNonVegGuestCount] = useState(() => guestCount - Math.round(guestCount / 2));

    const handleVegGuestChange = (val) => {
        const num = Math.max(0, Math.min(guestCount, Number(val) || 0));
        setVegGuestCount(num);
        setNonVegGuestCount(guestCount - num);
    };

    const handleNonVegGuestChange = (val) => {
        const num = Math.max(0, Math.min(guestCount, Number(val) || 0));
        setNonVegGuestCount(num);
        setVegGuestCount(guestCount - num);
    };

    // Filter menu sections by active diet tab when preference is 'both'
    const filteredMenuSections = useMemo(() => {
        if (!isBothDiet) return menuSections;
        return menuSections.map((section) => {
            const filtered = section.items.filter((item) => {
                if (activeDietTab === 'veg') return item.type === 'veg' || item.type === 'satvik';
                return item.type === 'non-veg';
            });
            return { ...section, items: filtered };
        }).filter((section) => section.items.length > 0);
    }, [menuSections, activeDietTab, isBothDiet]);

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

    const [cartAddedToast, setCartAddedToast] = useState(false);

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
            ...(isBothDiet && { vegGuestCount, nonVegGuestCount }),
            image: packageImage,
            type: routeState.preference || 'both',
            customizations: {
                selectedItems: selectedNames,
                addedItems,
            },
            totalPrice: grandTotal,
        };

        addToCart(cartItem);
        setCartAddedToast(true);
        setTimeout(() => setCartAddedToast(false), 3000);
    };

    const footerSelections = selections.length
        ? selections.slice(0, 3)
        : [{ id: 'none', name: 'No add-ons', type: 'neutral', priceDelta: 0 }];

    return (
        <div className="font-sans bg-[#fcf9f4] text-[#1c1c19] min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
            {/* Cart Added Toast */}
            {cartAddedToast && (
                <div className="fixed top-6 right-6 z-[200] animate-[slideIn_0.3s_ease-out] bg-[#154212] text-white px-6 py-4 rounded-2xl shadow-[0_20px_60px_-12px_rgba(21,66,18,0.3)] flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                    <div>
                        <p className="text-sm font-bold">Added to Cart!</p>
                        <p className="text-xs text-white/70 mt-0.5">{packageInfo.name} • {guestCount} guests</p>
                    </div>
                </div>
            )}
            <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
            {/* ── NAVBAR ── */}
            <nav className="bg-[#fcf9f4] border-b border-[#c2c9bb]/30 h-20 flex items-center px-6 lg:px-12 z-40 shadow-sm fixed top-0 left-0 right-0">
                <div className="flex items-center gap-2 mr-12">
                    <BrandLogo imgClassName="h-8 w-auto" labelClassName="hidden" />
                </div>
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#42493e]">
                    <button className="hover:text-[#904b33] transition-colors" type="button" onClick={goHome}>Home</button>
                    <button className="hover:text-[#904b33] transition-colors" type="button" onClick={handleExplore}>Packages</button>
                    <button className="hover:text-[#904b33] transition-colors" type="button">Venues</button>
                    <button className="hover:text-[#904b33] transition-colors" type="button">About</button>
                </div>
                <div className="ml-auto flex items-center gap-3">
                    <NavCartButton />
                </div>
            </nav>

            {/* ── MAIN CONTENT ── */}
            <main className="pt-20 pb-36">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Breadcrumb */}
                    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-[#42493e]/70 mb-8">
                        <button className="hover:text-[#904b33] transition-colors" type="button" onClick={goHome}>Home</button>
                        <ChevronRight className="w-4 h-4 text-[#c2c9bb]" />
                        <button
                            className={`hover:text-[#904b33] transition-colors ${routeState.occasionKey ? '' : 'cursor-default text-[#c2c9bb] hover:text-[#c2c9bb]'}`}
                            type="button"
                            onClick={routeState.occasionKey ? goToOccasionMenu : undefined}
                            disabled={!routeState.occasionKey}
                        >
                            {occasionName || 'Corporate Catering'}
                        </button>
                        <ChevronRight className="w-4 h-4 text-[#c2c9bb]" />
                        <span className="text-[#904b33] font-semibold">Customize Menu</span>
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* ── LEFT SIDEBAR ── */}
                        <aside className="lg:col-span-4">
                            <div className="sticky top-24 space-y-6">
                                {/* Package Hero Card */}
                                <div className="bg-white rounded-[24px] overflow-hidden border border-[#c2c9bb]/20 shadow-[0_10px_30px_-10px_rgba(28,28,25,0.06)]">
                                    <div className="h-64 bg-cover bg-center relative rounded-t-[24px] overflow-hidden" style={{ backgroundImage: `url(${imgUrl(packageImage)})` }}>
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c19]/80 via-[#1c1c19]/20 to-transparent"></div>
                                        <div className="absolute bottom-5 left-6">
                                            <h2 className="text-white text-2xl font-extrabold tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>{packageInfo.name}</h2>
                                        </div>
                                    </div>
                                    <div className="p-6 space-y-5">
                                        {/* Rating */}
                                        <div className="flex items-center gap-2">
                                            <div className="flex text-[#904b33]">
                                                <Star className="w-4 h-4" fill="currentColor" strokeWidth={1.5} />
                                                <Star className="w-4 h-4" fill="currentColor" strokeWidth={1.5} />
                                                <Star className="w-4 h-4" fill="currentColor" strokeWidth={1.5} />
                                                <Star className="w-4 h-4" fill="currentColor" strokeWidth={1.5} />
                                                <Star className="w-4 h-4" strokeWidth={1.5} />
                                            </div>
                                            <span className="text-xs font-medium text-[#42493e]/60">4.9 (128 reviews)</span>
                                        </div>
                                        {/* Description */}
                                        <p className="text-sm text-[#42493e] leading-relaxed">
                                            {packageInfo.description || 'Complete service for upscale celebrations. Includes professional staff, premium plating, linens, and decor.'}
                                        </p>
                                        {/* Price & Capacity */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-[#f6f3ee] rounded-xl p-4">
                                                <p className="text-[10px] uppercase tracking-widest text-[#42493e]/50 font-bold mb-1">Base Price</p>
                                                <p className="text-xl font-extrabold text-[#154212]" style={{ fontFamily: 'Manrope, sans-serif' }}>{formatCurrency(basePerPlate)}</p>
                                            </div>
                                            <div className="bg-[#f6f3ee] rounded-xl p-4">
                                                <p className="text-[10px] uppercase tracking-widest text-[#42493e]/50 font-bold mb-1">Total Guests</p>
                                                <p className="text-sm font-bold text-[#1c1c19]">{guestCount} Guests</p>
                                            </div>
                                        </div>

                                        {/* Veg / Non-Veg Guest Splitter */}
                                        {isBothDiet && (
                                            <div className="bg-[#f6f3ee] rounded-xl p-4 space-y-3">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Users className="w-4 h-4 text-[#154212]" />
                                                    <p className="text-[10px] uppercase tracking-widest text-[#42493e]/50 font-bold">Guest Split</p>
                                                </div>
                                                {/* Veg Guests */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                                        <span className="text-sm font-semibold text-[#1c1c19]">Veg Guests</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleVegGuestChange(vegGuestCount - 1)}
                                                            className="w-7 h-7 rounded-lg bg-white border border-[#c2c9bb]/30 flex items-center justify-center text-[#42493e] hover:bg-[#154212] hover:text-white hover:border-[#154212] transition-all"
                                                        >
                                                            <Minus className="w-3.5 h-3.5" />
                                                        </button>
                                                        <input
                                                            type="number"
                                                            value={vegGuestCount}
                                                            onChange={(e) => handleVegGuestChange(e.target.value)}
                                                            className="w-14 text-center text-sm font-bold bg-white border border-[#c2c9bb]/30 rounded-lg py-1 focus:outline-none focus:ring-1 focus:ring-[#154212]"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleVegGuestChange(vegGuestCount + 1)}
                                                            className="w-7 h-7 rounded-lg bg-white border border-[#c2c9bb]/30 flex items-center justify-center text-[#42493e] hover:bg-[#154212] hover:text-white hover:border-[#154212] transition-all"
                                                        >
                                                            <Plus className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                                {/* Non-Veg Guests */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                                                        <span className="text-sm font-semibold text-[#1c1c19]">Non-Veg Guests</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleNonVegGuestChange(nonVegGuestCount - 1)}
                                                            className="w-7 h-7 rounded-lg bg-white border border-[#c2c9bb]/30 flex items-center justify-center text-[#42493e] hover:bg-[#154212] hover:text-white hover:border-[#154212] transition-all"
                                                        >
                                                            <Minus className="w-3.5 h-3.5" />
                                                        </button>
                                                        <input
                                                            type="number"
                                                            value={nonVegGuestCount}
                                                            onChange={(e) => handleNonVegGuestChange(e.target.value)}
                                                            className="w-14 text-center text-sm font-bold bg-white border border-[#c2c9bb]/30 rounded-lg py-1 focus:outline-none focus:ring-1 focus:ring-[#154212]"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleNonVegGuestChange(nonVegGuestCount + 1)}
                                                            className="w-7 h-7 rounded-lg bg-white border border-[#c2c9bb]/30 flex items-center justify-center text-[#42493e] hover:bg-[#154212] hover:text-white hover:border-[#154212] transition-all"
                                                        >
                                                            <Plus className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Included Services */}
                                        <div className="space-y-2.5">
                                            <div className="flex items-center gap-2.5 text-sm text-[#42493e]">
                                                <CheckCircle2 className="w-4 h-4 text-[#154212]" strokeWidth={2} />
                                                <span>Service Fee Included</span>
                                            </div>
                                            <div className="flex items-center gap-2.5 text-sm text-[#42493e]">
                                                <CheckCircle2 className="w-4 h-4 text-[#154212]" strokeWidth={2} />
                                                <span>Setup Included</span>
                                            </div>
                                            <div className="flex items-center gap-2.5 text-sm text-[#42493e]">
                                                <CheckCircle2 className="w-4 h-4 text-[#154212]" strokeWidth={2} />
                                                <span>Catering Staff Included</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Need Assistance Card */}
                                <div className="p-5 bg-[#154212]/5 border border-[#154212]/10 rounded-[20px] flex items-start gap-4">
                                    <div className="w-10 h-10 bg-[#154212]/10 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Headset className="w-5 h-5 text-[#154212]" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-[#154212]" style={{ fontFamily: 'Manrope, sans-serif' }}>Need assistance?</h4>
                                        <p className="text-xs text-[#42493e]/70 mt-1">Our consultants can help craft the perfect menu.</p>
                                        <button className="text-[#904b33] text-xs font-bold mt-2 hover:underline" type="button" onClick={handleChatWithExpert}>Schedule a call →</button>
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* ── RIGHT CONTENT: Menu Sections ── */}
                        <section className="lg:col-span-8 space-y-10">
                            {/* Veg / Non-Veg Tab Switcher */}
                            {isBothDiet && (
                                <div className="flex items-center gap-2 bg-white rounded-2xl p-1.5 shadow-[0_4px_16px_-4px_rgba(28,28,25,0.06)] border border-[#c2c9bb]/20 w-fit">
                                    <button
                                        type="button"
                                        onClick={() => setActiveDietTab('veg')}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                                            activeDietTab === 'veg'
                                                ? 'bg-[#154212] text-white shadow-md'
                                                : 'text-[#42493e] hover:bg-[#f6f3ee]'
                                        }`}
                                    >
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                                        Veg Menu
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveDietTab('non-veg')}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                                            activeDietTab === 'non-veg'
                                                ? 'bg-[#904b33] text-white shadow-md'
                                                : 'text-[#42493e] hover:bg-[#f6f3ee]'
                                        }`}
                                    >
                                        <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                                        Non-Veg Menu
                                    </button>
                                </div>
                            )}

                            {filteredMenuSections.map((section, index) => (
                                <div key={section.id} className="space-y-5">
                                    {/* Section Header */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-[#154212] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                                                {index + 1}
                                            </div>
                                            <h3 className="text-2xl font-extrabold text-[#154212] tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>{section.title}</h3>
                                        </div>
                                        <span className="text-xs font-semibold text-[#42493e]/50 uppercase tracking-wider">
                                            {section.helper}
                                        </span>
                                    </div>

                                    {/* Item Cards Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {section.items.map((item) => {
                                            const isSelected = selectedMap[section.id]?.includes(item.id);
                                            const cardImage = item.image || packageImage || IMAGE_FALLBACK;

                                            return (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    onClick={() => toggleSelection(section.id, item)}
                                                    className={`group relative bg-white rounded-[20px] p-4 transition-all duration-300 text-left border-2 ${
                                                        isSelected
                                                            ? 'border-[#904b33] shadow-[0_8px_24px_-8px_rgba(144,75,51,0.15)]'
                                                            : 'border-transparent shadow-[0_4px_16px_-4px_rgba(28,28,25,0.06)] hover:shadow-[0_8px_24px_-8px_rgba(28,28,25,0.1)] hover:border-[#c2c9bb]/40'
                                                    }`}
                                                >
                                                    <div className="flex gap-4">
                                                        <div
                                                            className="w-[72px] h-[72px] rounded-2xl bg-cover bg-center shrink-0 ring-1 ring-[#c2c9bb]/20"
                                                            style={{ backgroundImage: `url(${imgUrl(cardImage)})` }}
                                                        ></div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-start gap-2">
                                                                <h4 className="font-bold text-[#1c1c19] text-sm leading-snug" style={{ fontFamily: 'Manrope, sans-serif' }}>{item.name}</h4>
                                                                {isSelected && (
                                                                    <div className="w-6 h-6 bg-[#904b33] rounded-full flex items-center justify-center flex-shrink-0">
                                                                        <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={2.5} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-[#42493e]/60 mt-1 leading-snug line-clamp-2">{item.description}</p>
                                                            <p className={`text-sm font-bold mt-2 ${
                                                                item.priceDelta > 0 ? 'text-[#42493e]' : 'text-[#154212]'
                                                            }`}>
                                                                {item.priceDelta > 0 ? `+ ${formatCurrency(item.priceDelta)}/guest` : 'Included'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </section>
                    </div>
                </div>
            </main>

            {/* ── FIXED FOOTER ── */}
            <footer className="fixed bottom-0 left-0 w-full z-50 bg-[#154212] border-t border-[#154212] py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* Selection Pills */}
                        <div className="flex items-center gap-6 w-full md:w-auto">
                            <div className="hidden sm:block">
                                <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold mb-1.5">Your Selection</p>
                                <div className="flex gap-2 custom-scrollbar overflow-x-auto max-w-md pb-1">
                                    {footerSelections.map((item) => (
                                        <div key={item.id} className="shrink-0 flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-xs border border-white/10 text-white backdrop-blur-sm">
                                            <span className={`w-2 h-2 rounded-full ${item.type === 'veg' ? 'bg-emerald-400' : item.type === 'non-veg' ? 'bg-rose-400' : item.type === 'satvik' ? 'bg-amber-400' : 'bg-white/40'}`}></span>
                                            {item.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="h-10 w-px bg-white/10 hidden md:block"></div>
                            {/* Price */}
                            <div className="flex flex-col">
                                <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Estimated Total</p>
                                <p className="text-2xl font-black text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>{formatCurrency(grandTotal)}</p>
                            </div>
                        </div>
                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <button
                                type="button"
                                onClick={handleSaveQuote}
                                className="flex-1 md:flex-none border border-white/30 text-white px-7 py-3 rounded-full text-sm font-bold hover:bg-white/10 transition-all uppercase tracking-wider"
                            >
                                Save Quote
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    handleProceedToCheckout();
                                }}
                                className="flex-1 md:flex-none bg-[#904b33] text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-[#783922] transition-all shadow-lg hover:shadow-[#904b33]/30 uppercase tracking-wider"
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
