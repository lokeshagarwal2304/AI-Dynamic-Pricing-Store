#!/usr/bin/env python3
import subprocess
import sys
import os

def install_requirements():
    """Install required packages"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Requirements installed successfully!")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing requirements: {e}")
        sys.exit(1)

def run_server():
    """Run the FastAPI server"""
    try:
        print("🚀 Starting AI Dynamic Pricing API server...")
        print("📊 Server will be available at: http://localhost:8000")
        print("📖 API Documentation: http://localhost:8000/docs")
        subprocess.run([sys.executable, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"])
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"❌ Error running server: {e}")

if __name__ == "__main__":
    print("🔧 Setting up AI Dynamic Pricing Backend...")
    
    # Change to backend directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Install requirements
    install_requirements()
    
    # Run server
    run_server()