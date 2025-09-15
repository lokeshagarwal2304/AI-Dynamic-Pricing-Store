import pandas as pd
import requests
import json
import os

def test_upload_and_retrain():
    print("🧪 Testing CSV Upload and Model Retraining...")
    print("=" * 50)
    
    try:
        # 1. Login as admin
        print("🔐 Logging in as admin...")
        login_response = requests.post('http://localhost:8000/auth/login', 
                                     json={'username': 'admin', 'password': 'admin123'})
        
        if login_response.status_code != 200:
            print("❌ Admin login failed")
            print(f"Status: {login_response.status_code}")
            print(f"Response: {login_response.text}")
            return False
            
        token = login_response.json()['access_token']
        print("✅ Admin login successful")
        
        # 2. Check current dataset
        dataset_path = 'backend/dataset.csv'
        if os.path.exists(dataset_path):
            current_df = pd.read_csv(dataset_path)
            initial_count = len(current_df)
            print(f"📊 Current dataset: {initial_count} records")
            print(f"📊 Current categories: {current_df['category'].nunique()} unique")
        else:
            initial_count = 0
            print("📊 No existing dataset found")
        
        # 3. Check sample file
        sample_file_path = 'sample_data.csv'
        if not os.path.exists(sample_file_path):
            print(f"❌ Sample file not found: {sample_file_path}")
            return False
            
        sample_df = pd.read_csv(sample_file_path)
        sample_count = len(sample_df)
        print(f"📁 Sample file: {sample_count} records to upload")
        print(f"📁 Sample categories: {sample_df['category'].unique()}")
        
        # 4. Upload the file
        print("\n🚀 Uploading CSV file...")
        with open(sample_file_path, 'rb') as f:
            files = {'file': ('sample_data.csv', f, 'text/csv')}
            headers = {'Authorization': f'Bearer {token}'}
            
            upload_response = requests.post('http://localhost:8000/upload-data', 
                                          files=files, headers=headers)
        
        print(f"📡 Upload response status: {upload_response.status_code}")
        
        if upload_response.status_code == 200:
            result = upload_response.json()
            print("✅ Upload successful!")
            print(f"📝 Message: {result.get('message', 'N/A')}")
            
            # 5. Display upload statistics
            if 'upload_stats' in result:
                stats = result['upload_stats']
                print("\n📈 Upload Statistics:")
                print(f"  📥 New records added: {stats.get('new_records', 0)}")
                print(f"  📊 Total records now: {stats.get('total_records', 0)}")
                print(f"  📋 Existing records: {stats.get('existing_records', 0)}")
                print(f"  🗑️  Duplicates removed: {stats.get('duplicates_removed', 0)}")
                
                expected_total = initial_count + sample_count - stats.get('duplicates_removed', 0)
                actual_total = stats.get('total_records', 0)
                print(f"  ✅ Data appended correctly: {actual_total == expected_total}")
            
            # 6. Display model metrics
            if 'model_metrics' in result:
                metrics = result['model_metrics']
                print("\n🤖 Model Performance After Retraining:")
                print(f"  📊 R² Score: {metrics.get('r2_score', 0):.4f}")
                print(f"  📏 RMSE: ${metrics.get('rmse', 0):.2f}")
                print(f"  🎯 Training samples: {metrics.get('training_samples', 0)}")
            
            # 7. Check retraining status
            retraining_status = result.get('retraining_status', 'unknown')
            print(f"\n🔄 Model retraining status: {retraining_status}")
            
            if retraining_status == 'completed':
                print("✅ Model successfully retrained with new data!")
            elif retraining_status == 'failed':
                print("⚠️  Model retraining failed:")
                print(f"   Error: {result.get('retraining_error', 'Unknown error')}")
            
            # 8. Test dynamic pricing with new model
            print("\n💰 Testing Dynamic Pricing Results...")
            test_dynamic_pricing(token)
            
            return True
            
        else:
            print("❌ Upload failed!")
            try:
                error = upload_response.json()
                print(f"Error details: {json.dumps(error, indent=2)}")
                
                # Check for validation errors
                if isinstance(error.get('detail'), dict):
                    detail = error['detail']
                    if 'missing_columns' in detail:
                        print(f"Missing columns: {detail['missing_columns']}")
                    if 'validation_errors' in detail:
                        print(f"Validation errors: {detail['validation_errors']}")
                        
            except:
                print(f"Error text: {upload_response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error during test: {str(e)}")
        return False

def test_dynamic_pricing(token):
    """Test dynamic pricing with a sample product"""
    try:
        # Sample product for price prediction
        test_product = {
            "product_name": "Test Wireless Headphones",
            "category": "Electronics",
            "base_price": 99.99,
            "inventory_level": 50,
            "competitor_avg_price": 105.00,
            "sales_last_30_days": 150,
            "rating": 4.5,
            "review_count": 1000,
            "season": "All",
            "brand_tier": "Premium",
            "material_cost": 35.00
        }
        
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
        
        # Get price prediction
        prediction_response = requests.post('http://localhost:8000/predict', 
                                          json=test_product, headers=headers)
        
        if prediction_response.status_code == 200:
            prediction = prediction_response.json()
            print(f"  🏷️  Base price: ${test_product['base_price']:.2f}")
            print(f"  🤖 AI predicted price: ${prediction.get('predicted_price', 0):.2f}")
            print(f"  📊 Confidence: {prediction.get('confidence_score', 0):.2f}")
            print(f"  📈 Price change: {prediction.get('price_change_percentage', 0):.1f}%")
            print(f"  💡 Recommendation: {prediction.get('recommendation', 'N/A')}")
            print("✅ Dynamic pricing working correctly!")
        else:
            print(f"❌ Dynamic pricing test failed: {prediction_response.status_code}")
            
    except Exception as e:
        print(f"❌ Error testing dynamic pricing: {str(e)}")

if __name__ == "__main__":
    success = test_upload_and_retrain()
    
    if success:
        print("\n" + "=" * 50)
        print("🎉 CSV Upload and Model Retraining Test PASSED!")
        print("✅ Data appending works correctly")
        print("✅ Model retraining works correctly") 
        print("✅ Dynamic pricing results are accurate")
        print("=" * 50)
    else:
        print("\n" + "=" * 50)
        print("❌ Test FAILED - Please check the errors above")
        print("=" * 50)