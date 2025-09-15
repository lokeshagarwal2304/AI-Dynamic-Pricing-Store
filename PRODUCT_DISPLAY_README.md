# 🛍️ Product Display Page - Setup Guide

## 📁 Project Structure

Your project should have this structure:
```
AI-Driven_DynamicPricingQuoteForProducts/
├── index.html          (✅ Created - main product display page)
├── dataset.csv          (✅ Exists - your product data)
├── assets/              (✅ Exists - folder for product images)
│   ├── 1.jpg
│   ├── 2.jpg
│   ├── 101.jpg
│   ├── 102.jpg
│   └── ... (images named by product_id)
└── PRODUCT_DISPLAY_README.md (this file)
```

## 🎯 What the HTML Page Does

### ✅ **Core Functionality:**
1. **Reads CSV Data:** Automatically fetches and parses your `dataset.csv` file
2. **Creates Product Cards:** Generates beautiful cards for each product
3. **Displays Images:** Shows product images from `assets/` folder using `product_id`
4. **Shows Statistics:** Displays total products, categories, and average price
5. **Interactive Design:** Hover effects, click-to-view details, responsive layout

### 🎨 **Features Include:**
- **Modern UI:** Gradient background, card animations, loading spinner
- **Responsive Design:** Works on desktop, tablet, and mobile
- **Error Handling:** Graceful fallbacks for missing images or data
- **CSV Parsing:** Robust parsing that handles quotes, commas, and various formats
- **Product Details:** Shows category, rating, stock, brand, and pricing
- **Statistics Bar:** Real-time stats about your product catalog

## 🚀 How to Use

### **Step 1: Prepare Images**
Place product images in the `assets/` folder named by `product_id`:
- For product_id `1` → `assets/1.jpg`
- For product_id `101` → `assets/101.jpg`
- For product_id `205` → `assets/205.jpg`

**Supported formats:** `.jpg`, `.jpeg`, `.png`, `.webp`

### **Step 2: Verify CSV Format**
Your `dataset.csv` should have these columns (minimum required):
- `product_id` - Used for image matching
- `product_name` - Displayed as the product title

**Optional columns** (automatically displayed if present):
- `category` - Product category
- `base_price` - Original price
- `target_price` - AI-optimized price
- `rating` - Product rating (0-5)
- `inventory_level` - Stock quantity
- `brand_tier` - Brand level (Premium, Standard, etc.)

### **Step 3: Run the Page**

**Option A: Simple Local Server**
```bash
# Using Python (if installed)
python -m http.server 8000

# Using Node.js (if installed)
npx http-server

# Then open: http://localhost:8000
```

**Option B: Live Server (VS Code)**
1. Install "Live Server" extension
2. Right-click `index.html` → "Open with Live Server"

**Option C: Direct File Open**
Simply double-click `index.html` (may have CORS limitations)

## 📊 Expected Results

When you open the page, you should see:

1. **Header:** "AI Dynamic Pricing Store" title
2. **Stats Bar:** 
   - Total products count
   - Number of categories
   - Average price
3. **Product Grid:** Cards showing:
   - Product image (from assets folder)
   - Product name
   - Product ID badge
   - Category, rating, stock (if available)
   - Price information (base/target prices)

## 🛠️ Customization Options

### **Change Colors/Styling:**
Edit the `<style>` section in `index.html`:
```css
/* Main gradient background */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Card hover effects */
.product-card:hover {
    transform: translateY(-5px);
}
```

### **Add More Product Details:**
Modify the `createProductDetails()` function to include more fields:
```javascript
if (product.description) {
    details.push(`<div class="detail-item"><span class="detail-label">Description:</span><span class="detail-value">${product.description}</span></div>`);
}
```

### **Change Image Path:**
Modify line 388 in the JavaScript:
```javascript
const imagePath = `assets/${productId}.jpg`;  // Change folder or extension
```

## 🐛 Troubleshooting

### **Images Not Loading:**
- ✅ Check image files exist in `assets/` folder
- ✅ Verify image names match `product_id` values
- ✅ Ensure correct file extensions (.jpg, .png, etc.)
- ✅ Run from a local server (not direct file open)

### **CSV Not Loading:**
- ✅ Verify `dataset.csv` exists in same folder as `index.html`
- ✅ Check CSV format (proper commas, no missing quotes)
- ✅ Run from a local server to avoid CORS issues
- ✅ Check browser console (F12) for error messages

### **No Products Showing:**
- ✅ Verify CSV has `product_id` and `product_name` columns
- ✅ Check for empty rows or malformed data
- ✅ Look in browser console for parsing errors

### **CORS Errors:**
```
Access to fetch at 'file:///dataset.csv' from origin 'null' has been blocked by CORS policy
```
**Solution:** Use a local web server instead of opening the HTML file directly.

## 💡 Advanced Features

### **Add Search/Filter:**
You can extend the code to add search functionality:
```javascript
// Add search input to HTML
<input type="text" id="searchInput" placeholder="Search products...">

// Add to JavaScript
filterProducts(searchTerm) {
    const filtered = this.products.filter(product => 
        product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    // Re-display filtered products
}
```

### **Add Category Filter:**
```javascript
// Create category buttons dynamically
const categories = [...new Set(this.products.map(p => p.category))];
// Add click handlers to filter by category
```

## 🎉 Success!

If everything works correctly, you'll have a beautiful, responsive product display page that:
- ✅ Automatically loads your CSV data
- ✅ Shows product images from the assets folder
- ✅ Displays product information in elegant cards
- ✅ Provides interactive features and statistics
- ✅ Handles errors gracefully

Enjoy your new AI Dynamic Pricing product display page! 🚀