import os
import sys
from pathlib import Path
from typing import Dict, Any

BASE_DIR = Path(__file__).resolve().parents[2]
PROJECT_ROOT = BASE_DIR.parent
HARDWARE_DIR = PROJECT_ROOT / "hardware" / "python"
if str(HARDWARE_DIR) not in sys.path:
    sys.path.insert(0, str(HARDWARE_DIR))

try:
    from serial_bridge import get_arduino_bridge
    HAS_BRIDGE = True
except ImportError:
    HAS_BRIDGE = False


def get_hardware_status() -> Dict[str, Any]:
    if HAS_BRIDGE:
        bridge = get_arduino_bridge()
        return bridge.get_status()
    return {
        "connected": False,
        "port": "None",
        "baud_rate": 9600,
        "last_command": "None",
        "last_ack": "None",
        "current_state": "SAFE_RED",
        "mode": "SIMULATION_ONLY",
        "last_error": "Hardware bridge module uninitialized"
    }
