import uvicorn
from main import app

if __name__ == "__main__":
    print("\n" + "="*60)
    print("🚀 Starting AI Dynamic Pricing API Server...")
    print("="*60)
    print("📡 Server URL: http://localhost:8000")
    print("📚 API Docs: http://localhost:8000/docs")
    print("🔐 Admin Login: admin/admin123")
    print("="*60 + "\n")
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000,
        reload=False,  # Set to True for development
        access_log=True
    )