@echo off
echo ============================================================
echo 🛍️ AI Dynamic Pricing Store - Product Display Page
echo ============================================================
echo.
echo 📊 Dataset Analysis:
python -c "
import pandas as pd
import os
if os.path.exists('backend/dataset.csv'):
    df = pd.read_csv('backend/dataset.csv')
    print(f'  📦 Products: {len(df)}')
    print(f'  📂 Categories: {df.category.nunique()}')
    print(f'  💰 Price range: ${df.base_price.min():.2f} - ${df.base_price.max():.2f}')
    
    if os.path.exists('assets'):
        import os
        assets = [f for f in os.listdir('assets') if f.lower().endswith(('.jpg', '.png', '.jpeg', '.webp'))]
        product_ids = set(str(pid) for pid in df.product_id.tolist())
        image_ids = set(f.split('.')[0] for f in assets)
        matching = len(product_ids.intersection(image_ids))
        print(f'  🖼️ Images: {len(assets)} total, {matching} matching product IDs')
else:
    print('  ❌ No dataset found')
"

echo.
echo 🚀 Starting Web Server...
echo 📡 Server will run on: http://localhost:8080
echo 🌐 Open this URL in your browser to view the product display
echo.
echo 💡 Features:
echo    • Beautiful product cards with images
echo    • Real-time statistics
echo    • Responsive design
echo    • Interactive hover effects
echo    • Error handling for missing images
echo.
echo ============================================================
echo ⚠️  Keep this window open while using the product display
echo 🔴 Press Ctrl+C to stop the server when done
echo ============================================================

python -m http.server 8080