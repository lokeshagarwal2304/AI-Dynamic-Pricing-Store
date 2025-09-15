export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  brand: string;
  inStock: boolean;
  rating: number;
  reviews: number;
  discount?: number;
  features?: string[];
  specifications?: Record<string, string>;
}

export const sampleProducts: Product[] = [
  {
    id: 1,
    name: "Wireless Bluetooth Headphones",
    description: "Premium quality wireless headphones with active noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.",
    price: 199.99,
    originalPrice: 249.99,
    category: "Electronics",
    brand: "TechSound",
    inStock: true,
    rating: 4.5,
    reviews: 1247,
    discount: 20,
    features: ["Active Noise Cancellation", "30-hour Battery", "Quick Charge", "Voice Assistant Compatible"],
    specifications: {
      "Battery Life": "30 hours",
      "Charging Time": "2 hours",
      "Weight": "250g",
      "Connectivity": "Bluetooth 5.0"
    }
  },
  {
    id: 2,
    name: "Smart Fitness Tracker",
    description: "Advanced fitness tracker with heart rate monitoring, sleep tracking, and waterproof design for all your activities.",
    price: 89.99,
    originalPrice: 119.99,
    category: "Fitness",
    brand: "FitLife",
    inStock: true,
    rating: 4.2,
    reviews: 834,
    discount: 25,
    features: ["Heart Rate Monitor", "Sleep Tracking", "Waterproof", "7-day Battery"],
    specifications: {
      "Display": "1.4 inch AMOLED",
      "Battery Life": "7 days",
      "Water Resistance": "5ATM",
      "Sensors": "HR, GPS, Accelerometer"
    }
  },
  {
    id: 3,
    name: "Professional Coffee Maker",
    description: "Programmable coffee maker with built-in grinder and thermal carafe. Brew the perfect cup every time.",
    price: 299.99,
    category: "Kitchen",
    brand: "BrewMaster",
    inStock: true,
    rating: 4.7,
    reviews: 592,
    features: ["Built-in Grinder", "Thermal Carafe", "Programmable", "Auto-shutoff"],
    specifications: {
      "Capacity": "12 cups",
      "Grinder": "Burr grinder",
      "Carafe": "Thermal stainless steel",
      "Timer": "24-hour programmable"
    }
  },
  {
    id: 4,
    name: "Gaming Mechanical Keyboard",
    description: "RGB backlit mechanical gaming keyboard with tactile switches and programmable keys for ultimate gaming performance.",
    price: 149.99,
    originalPrice: 179.99,
    category: "Gaming",
    brand: "GameTech",
    inStock: true,
    rating: 4.6,
    reviews: 1156,
    discount: 17,
    features: ["RGB Backlighting", "Tactile Switches", "Programmable Keys", "Anti-ghosting"],
    specifications: {
      "Switch Type": "Mechanical Blue",
      "Backlighting": "RGB",
      "Key Layout": "Full-size 104 keys",
      "Connection": "USB-C"
    }
  },
  {
    id: 5,
    name: "Organic Cotton T-Shirt",
    description: "Comfortable and sustainable organic cotton t-shirt available in multiple colors. Perfect for everyday wear.",
    price: 29.99,
    category: "Clothing",
    brand: "EcoWear",
    inStock: true,
    rating: 4.3,
    reviews: 423,
    features: ["100% Organic Cotton", "Pre-shrunk", "Multiple Colors", "Sustainable"],
    specifications: {
      "Material": "100% Organic Cotton",
      "Sizes": "XS-XXL",
      "Care": "Machine washable",
      "Origin": "Fair Trade Certified"
    }
  },
  {
    id: 6,
    name: "Wireless Phone Charger",
    description: "Fast wireless charging pad compatible with all Qi-enabled devices. Sleek design with LED indicator.",
    price: 39.99,
    originalPrice: 59.99,
    category: "Electronics",
    brand: "ChargeTech",
    inStock: false,
    rating: 4.1,
    reviews: 278,
    discount: 33,
    features: ["Fast Charging", "Qi Compatible", "LED Indicator", "Non-slip Base"],
    specifications: {
      "Output": "15W Fast Charge",
      "Compatibility": "Qi-enabled devices",
      "Dimensions": "4 x 4 x 0.4 inches",
      "Cable": "USB-C included"
    }
  },
  {
    id: 7,
    name: "Yoga Mat Premium",
    description: "Extra thick yoga mat with superior grip and cushioning. Made from eco-friendly materials.",
    price: 49.99,
    category: "Fitness",
    brand: "ZenFit",
    inStock: true,
    rating: 4.4,
    reviews: 689,
    features: ["Extra Thick", "Non-slip Surface", "Eco-friendly", "Carrying Strap"],
    specifications: {
      "Thickness": "8mm",
      "Dimensions": "72 x 24 inches",
      "Material": "TPE (Eco-friendly)",
      "Weight": "2.5 lbs"
    }
  },
  {
    id: 8,
    name: "Smart Home Security Camera",
    description: "HD security camera with night vision, motion detection, and smartphone app integration.",
    price: 129.99,
    originalPrice: 169.99,
    category: "Home Security",
    brand: "SecureHome",
    inStock: true,
    rating: 4.5,
    reviews: 756,
    discount: 24,
    features: ["1080p HD", "Night Vision", "Motion Detection", "Mobile App"],
    specifications: {
      "Resolution": "1080p Full HD",
      "Field of View": "110 degrees",
      "Night Vision": "Up to 30 feet",
      "Storage": "Cloud & Local"
    }
  },
  {
    id: 9,
    name: "Stainless Steel Water Bottle",
    description: "Double-walled insulated water bottle that keeps drinks cold for 24 hours or hot for 12 hours.",
    price: 24.99,
    category: "Outdoor",
    brand: "HydroLife",
    inStock: true,
    rating: 4.8,
    reviews: 1324,
    features: ["Double-walled", "Temperature Retention", "BPA-free", "Wide Mouth"],
    specifications: {
      "Capacity": "32 oz",
      "Material": "Stainless Steel 18/8",
      "Insulation": "Vacuum sealed",
      "Mouth Width": "2.16 inches"
    }
  },
  {
    id: 10,
    name: "Bluetooth Portable Speaker",
    description: "Waterproof portable speaker with 360-degree sound and 20-hour battery life. Perfect for outdoor adventures.",
    price: 79.99,
    originalPrice: 99.99,
    category: "Electronics",
    brand: "SoundWave",
    inStock: true,
    rating: 4.3,
    reviews: 543,
    discount: 20,
    features: ["Waterproof", "360-degree Sound", "20-hour Battery", "Voice Assistant"],
    specifications: {
      "Battery Life": "20 hours",
      "Water Rating": "IPX7",
      "Connectivity": "Bluetooth 5.0",
      "Dimensions": "7.8 x 3.1 inches"
    }
  },
  {
    id: 11,
    name: "Ergonomic Office Chair",
    description: "Professional ergonomic office chair with lumbar support and adjustable height. Designed for all-day comfort.",
    price: 299.99,
    originalPrice: 399.99,
    category: "Furniture",
    brand: "ComfortWork",
    inStock: true,
    rating: 4.6,
    reviews: 892,
    discount: 25,
    features: ["Lumbar Support", "Adjustable Height", "Breathable Mesh", "360-degree Swivel"],
    specifications: {
      "Max Weight": "300 lbs",
      "Height Range": "17-21 inches",
      "Material": "Breathable mesh",
      "Warranty": "5 years"
    }
  },
  {
    id: 12,
    name: "LED Desk Lamp",
    description: "Adjustable LED desk lamp with touch controls and USB charging port. Eye-care technology reduces strain.",
    price: 59.99,
    category: "Home & Office",
    brand: "BrightDesk",
    inStock: true,
    rating: 4.4,
    reviews: 367,
    features: ["Touch Controls", "USB Charging", "Eye-care LED", "Adjustable Arm"],
    specifications: {
      "LED Lifespan": "50,000 hours",
      "Brightness Levels": "5 levels",
      "Color Temperature": "3000K-6000K",
      "USB Port": "5V/1A"
    }
  }
];

// Helper functions for working with sample data
export const getProductById = (id: number): Product | undefined => {
  return sampleProducts.find(product => product.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  return sampleProducts.filter(product => 
    product.category.toLowerCase() === category.toLowerCase()
  );
};

export const getProductsByBrand = (brand: string): Product[] => {
  return sampleProducts.filter(product => 
    product.brand.toLowerCase() === brand.toLowerCase()
  );
};

export const getFeaturedProducts = (count: number = 4): Product[] => {
  // Return products with highest ratings
  return sampleProducts
    .sort((a, b) => b.rating - a.rating)
    .slice(0, count);
};

export const getDiscountedProducts = (): Product[] => {
  return sampleProducts.filter(product => product.originalPrice && product.originalPrice > product.price);
};

export const searchProducts = (query: string): Product[] => {
  const lowercaseQuery = query.toLowerCase();
  return sampleProducts.filter(product =>
    product.name.toLowerCase().includes(lowercaseQuery) ||
    product.description.toLowerCase().includes(lowercaseQuery) ||
    product.category.toLowerCase().includes(lowercaseQuery) ||
    product.brand.toLowerCase().includes(lowercaseQuery)
  );
};

export const getCategories = (): string[] => {
  return Array.from(new Set(sampleProducts.map(product => product.category)));
};

export const getBrands = (): string[] => {
  return Array.from(new Set(sampleProducts.map(product => product.brand)));
};

export default sampleProducts;