// Occasion-specific menu data
export const occasionMenus = {
  corporate: [
    {
      id: 'corp-1',
      name: 'Executive Lunch Box',
      description: 'Perfect for business meetings and corporate events',
      price: 299,
      perPlate: true,
      image: '/meal-box.jpg',
      type: 'veg',
      guestCount: [10, 25, 50, 100],
      items: ['Dal Makhani', 'Paneer Tikka Masala', 'Jeera Rice', 'Naan', 'Salad', 'Dessert'],
      tags: ['popular', 'recommended', 'bestSeller'],
      mostOrdered: 'Most ordered for Corporate Events',
      category: 'corporate'
    },
    {
      id: 'corp-2',
      name: 'Premium Corporate Thali',
      description: 'Complete meal solution for your professional gatherings',
      price: 399,
      perPlate: true,
      image: '/thali.jpg',
      type: 'veg',
      guestCount: [25, 50, 100],
      items: ['2 Sabzi', 'Dal', 'Rice', 'Roti', 'Raita', 'Pickle', 'Papad', 'Sweet'],
      tags: ['premium', 'recommended'],
      mostOrdered: 'Chef\'s Special',
      category: 'corporate'
    },
    {
      id: 'corp-3',
      name: 'Healthy Executive Combo',
      description: 'Nutritious meal for health-conscious professionals',
      price: 349,
      perPlate: true,
      image: '/healthy-meal.jpg',
      type: 'veg',
      guestCount: [10, 25, 50],
      items: ['Grilled Vegetables', 'Brown Rice', 'Multigrain Roti', 'Soup', 'Fresh Juice'],
      tags: ['healthy'],
      category: 'corporate'
    },
    {
      id: 'corp-4',
      name: 'Tea Break Snack Box',
      description: 'Perfect for office tea breaks and meetings',
      price: 149,
      perPlate: true,
      image: '/snacks.jpg',
      type: 'veg',
      guestCount: [10, 25, 50, 100],
      items: ['Samosa', 'Sandwich', 'Cookies', 'Chai/Coffee'],
      tags: ['snacks'],
      category: 'corporate'
    },
    {
      id: 'corp-5',
      name: 'Corporate Buffet Trays',
      description: 'Party-style buffet for large corporate events',
      price: 499,
      perPlate: true,
      image: '/buffet.jpg',
      type: 'both',
      guestCount: [50, 100, 200],
      items: ['3 Starters', '4 Main Course', 'Rice & Breads', 'Desserts', 'Beverages'],
      tags: ['premium', 'buffet'],
      category: 'corporate'
    },
    {
      id: 'corp-6',
      name: 'Non-Veg Corporate Special',
      description: 'Premium non-veg options for office parties',
      price: 449,
      perPlate: true,
      image: '/chicken-meal.jpg',
      type: 'non-veg',
      guestCount: [25, 50, 100],
      items: ['Chicken Tikka', 'Butter Chicken', 'Biryani', 'Naan', 'Raita'],
      tags: ['popular'],
      category: 'corporate'
    }
  ],

  birthday: [
    {
      id: 'birth-1',
      name: 'Kids Birthday Combo',
      description: 'Fun meal box perfect for children\'s birthday parties',
      price: 199,
      perPlate: true,
      image: '/kids-meal.jpg',
      type: 'veg',
      guestCount: [10, 25, 50],
      items: ['Mini Burger', 'French Fries', 'Pasta', 'Juice', 'Ice Cream'],
      tags: ['kids', 'popular', 'bestSeller'],
      mostOrdered: 'Most ordered for Kids Parties',
      category: 'birthday'
    },
    {
      id: 'birth-2',
      name: 'Party Snack Platter',
      description: 'Assorted snacks for birthday celebrations',
      price: 249,
      perPlate: true,
      image: '/party-snacks.jpg',
      type: 'veg',
      guestCount: [10, 25, 50, 100],
      items: ['Spring Rolls', 'Manchurian', 'Paneer Tikka', 'Chips', 'Dips'],
      tags: ['popular', 'recommended'],
      category: 'birthday'
    },
    {
      id: 'birth-3',
      name: 'Cake + Snacks Combo',
      description: 'Birthday cake with complementary snacks',
      price: 599,
      perPlate: false,
      image: '/cake-combo.jpg',
      type: 'veg',
      guestCount: [10, 25, 50],
      items: ['1kg Cake', 'Samosa', 'Pakoda', 'Beverages'],
      tags: ['combo'],
      category: 'birthday'
    },
    {
      id: 'birth-4',
      name: 'Fast Food Birthday Box',
      description: 'Pizza, burgers & more for the celebration',
      price: 299,
      perPlate: true,
      image: '/fast-food.jpg',
      type: 'veg',
      guestCount: [10, 25, 50],
      items: ['Pizza Slice', 'Burger', 'Fries', 'Coleslaw', 'Soft Drink'],
      tags: ['popular'],
      category: 'birthday'
    },
    {
      id: 'birth-5',
      name: 'Birthday Dessert Box',
      description: 'Assorted desserts for sweet celebrations',
      price: 159,
      perPlate: true,
      image: '/desserts.jpg',
      type: 'veg',
      guestCount: [10, 25, 50],
      items: ['Brownie', 'Pastry', 'Gulab Jamun', 'Ice Cream Cup'],
      tags: ['sweet'],
      category: 'birthday'
    },
    {
      id: 'birth-6',
      name: 'Complete Birthday Meal',
      description: 'Full meal package for birthday lunch/dinner',
      price: 349,
      perPlate: true,
      image: '/birthday-meal.jpg',
      type: 'both',
      guestCount: [25, 50, 100],
      items: ['Starter', 'Main Course', 'Rice/Roti', 'Raita', 'Dessert', 'Welcome Drink'],
      tags: ['recommended', 'premium'],
      category: 'birthday'
    }
  ],

  wedding: [
    {
      id: 'wed-1',
      name: 'Premium Wedding Buffet',
      description: 'Grand buffet spread for your special day',
      price: 799,
      perPlate: true,
      image: '/wedding-buffet.jpg',
      type: 'both',
      guestCount: [100, 200, 500],
      items: ['5 Starters', '6 Main Course', 'Live Counters', 'Breads & Rice', 'Desserts', 'Welcome Drinks'],
      tags: ['premium', 'recommended', 'bestSeller'],
      mostOrdered: 'Most ordered for Weddings',
      category: 'wedding'
    },
    {
      id: 'wed-2',
      name: 'Traditional Wedding Thali',
      description: 'Authentic Indian wedding meal experience',
      price: 599,
      perPlate: true,
      image: '/wedding-thali.jpg',
      type: 'veg',
      guestCount: [50, 100, 200],
      items: ['3 Sabzi', '2 Dal', 'Rice', 'Puri', 'Raita', 'Pickle', 'Papad', '2 Sweets'],
      tags: ['traditional'],
      category: 'wedding'
    },
    {
      id: 'wed-3',
      name: 'Wedding Sweet Boxes',
      description: 'Premium sweet boxes as wedding favors',
      price: 299,
      perPlate: false,
      image: '/sweet-box.jpg',
      type: 'veg',
      guestCount: [50, 100, 200],
      items: ['Kaju Katli', 'Ladoo', 'Barfi', 'Dry Fruits'],
      tags: ['gift'],
      category: 'wedding'
    },
    {
      id: 'wed-4',
      name: 'Welcome Drink Package',
      description: 'Refreshing welcome drinks for guests',
      price: 99,
      perPlate: true,
      image: '/welcome-drink.jpg',
      type: 'veg',
      guestCount: [100, 200, 500],
      items: ['Mocktails', 'Fresh Juice', 'Jaljeera', 'Coconut Water'],
      tags: ['beverages'],
      category: 'wedding'
    },
    {
      id: 'wed-5',
      name: 'Live Counter Package',
      description: 'Interactive live food stations',
      price: 499,
      perPlate: true,
      image: '/live-counter.jpg',
      type: 'veg',
      guestCount: [100, 200, 500],
      items: ['Dosa Counter', 'Chaat Counter', 'Pasta Counter', 'Ice Cream Counter'],
      tags: ['premium', 'live'],
      category: 'wedding'
    },
    {
      id: 'wed-6',
      name: 'Royal Non-Veg Feast',
      description: 'Luxurious non-vegetarian spread',
      price: 899,
      perPlate: true,
      image: '/royal-feast.jpg',
      type: 'non-veg',
      guestCount: [100, 200, 500],
      items: ['Tandoori Platter', 'Chicken Biryani', 'Mutton Curry', 'Fish Tikka', 'Kebabs', 'Desserts'],
      tags: ['premium', 'royal'],
      category: 'wedding'
    }
  ],

  houseParty: [
    {
      id: 'party-1',
      name: 'Starter Platter Special',
      description: 'Assorted starters to kick off your party',
      price: 349,
      perPlate: true,
      image: '/starters.jpg',
      type: 'both',
      guestCount: [10, 25, 50],
      items: ['Paneer Tikka', 'Chicken Wings', 'Spring Rolls', 'Fries', 'Dips'],
      tags: ['popular', 'starters'],
      category: 'houseParty'
    },
    {
      id: 'party-2',
      name: 'BBQ Combo Pack',
      description: 'Grilled delights for your house party',
      price: 499,
      perPlate: true,
      image: '/bbq.jpg',
      type: 'non-veg',
      guestCount: [10, 25, 50],
      items: ['BBQ Chicken', 'Grilled Fish', 'Kebabs', 'Garlic Bread', 'Salad'],
      tags: ['bbq', 'recommended'],
      category: 'houseParty'
    },
    {
      id: 'party-3',
      name: 'Dinner Combo Trays',
      description: 'Complete dinner solution for house parties',
      price: 399,
      perPlate: true,
      image: '/dinner-tray.jpg',
      type: 'veg',
      guestCount: [10, 25, 50],
      items: ['Dal Tadka', 'Paneer Butter Masala', 'Jeera Rice', 'Naan', 'Raita'],
      tags: ['dinner'],
      category: 'houseParty'
    },
    {
      id: 'party-4',
      name: 'Dessert Box Collection',
      description: 'Sweet endings for your celebration',
      price: 199,
      perPlate: true,
      image: '/party-desserts.jpg',
      type: 'veg',
      guestCount: [10, 25, 50],
      items: ['Chocolate Brownie', 'Gulab Jamun', 'Ice Cream', 'Fruit Custard'],
      tags: ['desserts'],
      category: 'houseParty'
    },
    {
      id: 'party-5',
      name: 'Pizza Party Pack',
      description: 'Multiple pizzas for your gathering',
      price: 899,
      perPlate: false,
      image: '/pizza-pack.jpg',
      type: 'veg',
      guestCount: [10, 25],
      items: ['3 Large Pizzas', 'Garlic Bread', 'Coleslaw', 'Soft Drinks'],
      tags: ['combo'],
      category: 'houseParty'
    },
    {
      id: 'party-6',
      name: 'Finger Food Fiesta',
      description: 'Easy-to-eat party snacks',
      price: 249,
      perPlate: true,
      image: '/finger-food.jpg',
      type: 'veg',
      guestCount: [10, 25, 50],
      items: ['Mini Samosas', 'Cutlets', 'Cheese Balls', 'Corn Cups', 'Sauces'],
      tags: ['snacks', 'popular'],
      category: 'houseParty'
    }
  ],

  pooja: [
    {
      id: 'pooja-1',
      name: 'Satvik Thali',
      description: 'Pure vegetarian meal without onion & garlic',
      price: 249,
      perPlate: true,
      image: '/satvik-thali.jpg',
      type: 'veg',
      guestCount: [10, 25, 50, 100],
      items: ['Aloo Sabzi', 'Dal', 'Rice', 'Puri', 'Raita', 'Pickle', 'Sweet'],
      tags: ['satvik', 'recommended'],
      category: 'pooja'
    },
    {
      id: 'pooja-2',
      name: 'Prasad Box',
      description: 'Sacred offerings for your pooja',
      price: 149,
      perPlate: false,
      image: '/prasad.jpg',
      type: 'veg',
      guestCount: [10, 25, 50],
      items: ['Ladoo', 'Rice Kheer', 'Dry Fruits', 'Fruits'],
      tags: ['prasad'],
      category: 'pooja'
    },
    {
      id: 'pooja-3',
      name: 'Sweet & Fruit Box',
      description: 'Traditional sweets and fresh fruits',
      price: 199,
      perPlate: false,
      image: '/sweet-fruit.jpg',
      type: 'veg',
      guestCount: [10, 25, 50],
      items: ['Mixed Sweets', 'Seasonal Fruits', 'Dry Fruits', 'Coconut'],
      tags: ['traditional'],
      category: 'pooja'
    },
    {
      id: 'pooja-4',
      name: 'Mini Pooja Meal Pack',
      description: 'Compact meal for small gatherings',
      price: 179,
      perPlate: true,
      image: '/pooja-meal.jpg',
      type: 'veg',
      guestCount: [10, 25, 50],
      items: ['Puri', 'Aloo Sabzi', 'Chana', 'Sweet', 'Pickle'],
      tags: ['satvik'],
      category: 'pooja'
    },
    {
      id: 'pooja-5',
      name: 'Bhandara Special Thali',
      description: 'Large-scale pooja meal service',
      price: 299,
      perPlate: true,
      image: '/bhandara.jpg',
      type: 'veg',
      guestCount: [50, 100, 200],
      items: ['2 Sabzi', 'Dal', 'Rice', 'Puri', 'Raita', 'Papad', 'Sweet', 'Pickle'],
      tags: ['satvik', 'premium'],
      category: 'pooja'
    },
    {
      id: 'pooja-6',
      name: 'Temple Style Lunch',
      description: 'Authentic temple-style preparation',
      price: 219,
      perPlate: true,
      image: '/temple-meal.jpg',
      type: 'veg',
      guestCount: [25, 50, 100],
      items: ['Rice', 'Sambar', 'Rasam', 'Poriyal', 'Curd', 'Pickle', 'Payasam'],
      tags: ['south-indian', 'satvik'],
      category: 'pooja'
    }
  ],

  other: [
    {
      id: 'other-1',
      name: 'Build Your Own Menu',
      description: 'Customize every aspect of your meal',
      price: 0,
      perPlate: true,
      image: '/custom-meal.jpg',
      type: 'both',
      guestCount: [10, 25, 50, 100, 200],
      items: ['Choose Your Items', 'Select Quantity', 'Customize Preferences'],
      tags: ['custom'],
      category: 'other',
      isCustom: true
    }
  ]
};

// Helper function to get menus by occasion
export const getMenusByOccasion = (occasion) => {
  return occasionMenus[occasion] || [];
};

// Helper function to filter menus
export const filterMenus = (menus, filters) => {
  let filtered = [...menus];

  // Filter by budget
  if (filters.budget && filters.budget !== 'all') {
    const budgetRanges = {
      '199': [0, 199],
      '299': [200, 299],
      '499': [300, 499],
      'premium': [500, 10000]
    };
    const [min, max] = budgetRanges[filters.budget];
    filtered = filtered.filter(item => item.price >= min && item.price <= max);
  }

  // Filter by type (veg/non-veg)
  if (filters.type && filters.type !== 'all') {
    filtered = filtered.filter(item => {
      if (filters.type === 'veg') return item.type === 'veg' || item.type === 'both';
      if (filters.type === 'non-veg') return item.type === 'non-veg' || item.type === 'both';
      return true;
    });
  }

  // Filter by guest count
  if (filters.guestCount) {
    filtered = filtered.filter(item => item.guestCount.includes(parseInt(filters.guestCount)));
  }

  return filtered;
};
