// Import all product images statically so Vite can process them
import image1 from '../assets/1.jpg';
import image2 from '../assets/2.jpg';
import image3 from '../assets/3.jpg';
import image4 from '../assets/4.jpg';
import image5 from '../assets/5.jpg';
import image6 from '../assets/6.jpg';
import image7 from '../assets/7.jpg';
import image8 from '../assets/8.jpg';
import image9 from '../assets/9.jpg';
import image10 from '../assets/10.jpg';
import image11 from '../assets/11.jpg';
import image12 from '../assets/12.jpg';
import image13 from '../assets/13.jpg';
import image14 from '../assets/14.jpg';
import image15 from '../assets/15.jpg';
import image16 from '../assets/16.jpg';
import image17 from '../assets/17.jpg';
import image18 from '../assets/18.jpg';
import image19 from '../assets/19.jpg';
import image20 from '../assets/20.jpg';
import defaultImage from '../assets/default.jpg';

// Create a mapping of product IDs to their images
const imageMap: Record<number, string> = {
  1: image1,
  2: image2,
  3: image3,
  4: image4,
  5: image5,
  6: image6,
  7: image7,
  8: image8,
  9: image9,
  10: image10,
  11: image11,
  12: image12,
  13: image13,
  14: image14,
  15: image15,
  16: image16,
  17: image17,
  18: image18,
  19: image19,
  20: image20,
};

/**
 * Utility function to dynamically get product images with fallback support
 * @param productId - The numeric ID of the product
 * @returns The image path for the product or default image if not found
 */
export const getProductImage = (productId: number): string => {
  // Check if we have a specific image for this product ID
  if (imageMap[productId]) {
    return imageMap[productId];
  }
  
  // If no specific image found, return default image
  if (defaultImage) {
    return defaultImage;
  }
  
  // If even default image is not available, return placeholder
  console.warn(`Product image ${productId}.jpg not found, and default.jpg is also missing`);
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjhmOSIvPgogIDx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2Yjc0ODQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIwLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPg==';
};

/**
 * Alternative function for getting product images with better error logging
 * @param productId - The numeric ID of the product
 * @param enableLogging - Whether to log errors (default: false for production)
 * @returns The image path for the product or default image if not found
 */
export const getProductImageWithLogging = (productId: number, enableLogging: boolean = false): string => {
  // Check if we have a specific image for this product ID
  if (imageMap[productId]) {
    if (enableLogging) {
      console.log(`Found image for product ${productId}`);
    }
    return imageMap[productId];
  }
  
  if (enableLogging) {
    console.log(`Image for product ${productId} not found, using default`);
  }
  
  // If no specific image found, return default image
  if (defaultImage) {
    return defaultImage;
  }
  
  if (enableLogging) {
    console.error('Default image not found, using placeholder');
  }
  
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjhmOSIvPgogIDx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2Yjc0ODQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIwLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPg==';
};

export default getProductImage;