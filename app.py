import os
import sys
import subprocess
import uvicorn
from dotenv import load_dotenv

load_dotenv()

def start_frontend():
    frontend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'frontend')
    print("Starting frontend (Vite)...")
    try:
        # Use shell=True to ensure npm is resolved correctly in the user's environment
        process = subprocess.Popen(
            "npm run dev",
            shell=True,
            cwd=frontend_dir,
            stdout=sys.stdout,
            stderr=sys.stderr
        )
        return process
    except Exception as e:
        print(f"Failed to start frontend: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == '__main__':
    env = os.getenv("APP_ENV", "development")
    frontend_process = None
    if env == "development":
        frontend_process = start_frontend()
    else:
        print("Running in production mode. Static frontend will be served by FastAPI.")
    
    port = int(os.getenv('BACKEND_PORT', 5000))
    try:
        # Run FastAPI backend in the main process
        uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=(env == "development"))
    finally:
        if frontend_process:
            print("Stopping frontend...")
            frontend_process.terminate()
            frontend_process.wait()
