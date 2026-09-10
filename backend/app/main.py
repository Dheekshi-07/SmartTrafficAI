from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import traffic
from app.routers import emergency

app = FastAPI(
    title="SmartTrafficAI API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://frontend-xi-green-89.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "SmartTrafficAI API running"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "system": "SmartTrafficAI",
        "simulation_engine": "SUMO",
        "controller": "TraCI",
        "api": "FastAPI"
    }


app.include_router(traffic.router)
app.include_router(emergency.router)