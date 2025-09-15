@echo off
echo ============================================================
echo 🔍 Quick Image Display Verification
echo ============================================================
echo.

python -c "
import pandas as pd
import os

print('📊 Dataset Check:')
df = pd.read_csv('backend/dataset.csv')
product_1 = df[df['product_id'] == 1].iloc[0]
print(f'  🆔 Product ID 1: {product_1[\"product_name\"]}')
print(f'  📂 Category: {product_1[\"category\"]}')
print(f'  💰 Price: ${product_1[\"base_price\"]}')
print()

print('🖼️ Image Check:')
if os.path.exists('assets/1.jpg'):
    size = os.path.getsize('assets/1.jpg')
    print(f'  ✅ assets/1.jpg exists ({size:,} bytes)')
else:
    print('  ❌ assets/1.jpg NOT FOUND')

print()
print('🌐 Server Status:')
import subprocess
try:
    result = subprocess.run(['netstat', '-an'], capture_output=True, text=True, shell=True)
    if '8080' in result.stdout:
        print('  ✅ Server running on port 8080')
        print('  🔗 Open: http://localhost:8080')
    else:
        print('  ❌ Server not running on port 8080')
        print('  💡 Run: python -m http.server 8080')
except:
    print('  ⚠️ Could not check server status')
"

echo.
echo ============================================================
echo 🎯 VERIFICATION COMPLETE
echo.
echo ✅ What should work:
echo    • Product ID 1 shows "Premium Cotton T-Shirt"
echo    • Image loads from assets/1.jpg (91KB file)
echo    • Card displays: ID badge, category, price
echo    • Image shows with 250px height, clear visibility
echo.
echo 🌐 Open http://localhost:8080 to test!
echo 🧪 Open http://localhost:8080/test_images.html for detailed testing
echo ============================================================
pause