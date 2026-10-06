"""
SmartTrafficAI - FastAPI Production Backend
Central API gateway for traffic simulation telemetry, machine learning predictions,
multi-emergency green corridor arbitration, and Arduino hardware status.
"""

import os
from datetime import datetime, timezone
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import traffic, emergency, ml, hardware
from app.schemas.health import HealthResponse
from app.services.hardware_service import get_hardware_status

app = FastAPI(
    title="SmartTrafficAI API",
    description="AI-Based Adaptive Traffic Signal Control and Emergency Green Corridor System API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://frontend-xi-green-89.vercel.app",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["System"])
def root():
    return {
        "system": "SmartTrafficAI",
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/api/health", response_model=HealthResponse, tags=["System"])
def health_check():
    """
    System health diagnostic reporting operational status of backend,
    SUMO simulation environment, Machine Learning model, and Arduino serial connection.
    """
    base_dir = Path(__file__).resolve().parents[2]
    project_root = base_dir.parent if (base_dir.parent / "models").exists() else base_dir
    
    # Check simulation engine
    sim_config = project_root / "simulation" / "sumo" / "configs" / "junction.sumocfg"
    sim_status = "available" if sim_config.exists() else "configuration_missing"
    
    # Check ML model
    model_file = project_root / "models" / "traffic_random_forest.joblib"
    ml_status = "loaded" if model_file.exists() else "missing"
    
    # Check Arduino hardware
    hw_status = get_hardware_status()
    arduino_status = "connected" if hw_status.get("connected") else "disconnected"

    return HealthResponse(
        status="online",
        system="SmartTrafficAI",
        backend="online",
        simulation=sim_status,
        ml_model=ml_status,
        arduino=arduino_status,
        timestamp=datetime.now(timezone.utc).isoformat()
    )


# Register modular routers
app.include_router(traffic.router)
app.include_router(emergency.router)
app.include_router(ml.router)
app.include_router(hardware.router)
