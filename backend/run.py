import uvicorn
import os
import socket

def find_free_port(start_port=8000, max_port=8100):
    """Find a free port starting from start_port"""
    for port in range(start_port, max_port):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('localhost', port))
                return port
        except OSError:
            continue
    raise OSError("No free ports found")

if __name__ == "__main__":
    try:
        # Find an available port
        port = find_free_port()
        
        print("🚀 Starting AI Dynamic Pricing Backend...")
        print(f"📊 API Documentation: http://localhost:{port}/docs")
        print(f"🔗 API Endpoint: http://localhost:{port}")
        print("🤖 Training ML model on startup...")
        print(f"🌐 Server will start on port {port}")
        
        uvicorn.run(
            "main:app",
            host="127.0.0.1",
            port=port,
            reload=True,
            log_level="info"
        )
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        print("💡 Try running as administrator or check if another service is using the ports.")
        input("Press Enter to exit...")
