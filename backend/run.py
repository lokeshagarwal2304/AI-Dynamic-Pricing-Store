import uvicorn
import os

if __name__ == "__main__":
    print("Starting AI Dynamic Pricing Backend...")
    print("API Documentation available at: http://localhost:8000/docs")
    print("API running at: http://localhost:8000")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )