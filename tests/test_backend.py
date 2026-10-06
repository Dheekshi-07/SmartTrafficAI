import pytest
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1] / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert data["system"] == "SmartTrafficAI"
    assert data["status"] == "online"

def test_health_endpoint():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "online"
    assert "backend" in data
    assert "simulation" in data
    assert "ml_model" in data
    assert "arduino" in data
    assert "timestamp" in data

def test_traffic_comparison():
    res = client.get("/api/traffic/comparison")
    assert res.status_code == 200
    data = res.json()
    assert "queue_comparison" in data
    assert "trip_metrics" in data
    assert len(data["queue_comparison"]) >= 2

def test_traffic_latest():
    res = client.get("/api/traffic/latest")
    assert res.status_code == 200
    data = res.json()
    assert "step" in data
    assert "current_direction" in data

def test_emergency_status():
    res = client.get("/api/emergency/status")
    assert res.status_code == 200
    data = res.json()
    assert data["ambulance_id"] == "AMB_001"
    assert data["status"] == "ready"

def test_emergency_comparison():
    res = client.get("/api/emergency/comparison")
    assert res.status_code == 200
    data = res.json()
    assert "ambulance_metrics" in data

def test_emergency_priority():
    res = client.get("/api/emergency/priority")
    assert res.status_code == 200
    data = res.json()
    assert "total_active" in data
    assert "total_queued" in data
    assert "active_emergencies" in data

def test_ml_metrics():
    res = client.get("/api/ml/metrics")
    assert res.status_code == 200
    data = res.json()
    assert "mae" in data
    assert "rmse" in data
    assert "r2_score" in data
    assert data["r2_score"] > 0.9

def test_hardware_status():
    res = client.get("/api/hardware/status")
    assert res.status_code == 200
    data = res.json()
    assert "connected" in data
    assert "mode" in data

def test_404_not_found():
    res = client.get("/api/nonexistent_endpoint")
    assert res.status_code == 404
