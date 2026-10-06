import pytest
import sys
from pathlib import Path

HARDWARE_DIR = Path(__file__).resolve().parents[1] / "hardware" / "python"
if str(HARDWARE_DIR) not in sys.path:
    sys.path.insert(0, str(HARDWARE_DIR))

from serial_bridge import ArduinoTrafficSignal, get_arduino_bridge

def test_command_validation():
    bridge = ArduinoTrafficSignal()
    
    # Valid commands return in disconnected mode without crashing
    assert bridge.send_signal("RED") is False  # returns False because no physical serial port
    assert bridge.last_command == "RED"
    
    assert bridge.send_signal("YELLOW") is False
    assert bridge.last_command == "YELLOW"
    
    assert bridge.send_signal("GREEN") is False
    assert bridge.last_command == "GREEN"
    
    assert bridge.send_signal("EMERGENCY_GREEN") is False
    assert bridge.last_command == "EMERGENCY_GREEN"
    
    # Invalid command rejected
    assert bridge.send_signal("INVALID_STATE") is False
    assert "Invalid command" in (bridge.last_error or "")

def test_status_dictionary():
    bridge = ArduinoTrafficSignal()
    status = bridge.get_status()
    
    assert "connected" in status
    assert "port" in status
    assert "mode" in status
    assert status["connected"] is False
    assert status["mode"] == "SIMULATION_ONLY"

def test_global_bridge_singleton():
    b1 = get_arduino_bridge()
    b2 = get_arduino_bridge()
    assert b1 is b2
