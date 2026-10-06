import pytest
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from controllers.adaptive_controller import (
    calculate_green_time,
    MIN_GREEN,
    MAX_GREEN,
    DECISION_INTERVAL
)

def test_min_green_bound():
    # Zero pressure should return MIN_GREEN (15)
    assert calculate_green_time(0) == MIN_GREEN
    # Negative pressure should still respect MIN_GREEN
    assert calculate_green_time(-5) == MIN_GREEN

def test_max_green_bound():
    # Very high pressure should be capped at MAX_GREEN (60)
    assert calculate_green_time(100) == MAX_GREEN
    assert calculate_green_time(50) == MAX_GREEN

def test_proportional_green_scaling():
    # Pressure of 5 should give 15 + (5 * 3) = 30
    assert calculate_green_time(5) == 30
    # Pressure of 10 should give 15 + (10 * 3) = 45
    assert calculate_green_time(10) == 45

def test_timing_constants():
    assert MIN_GREEN == 15
    assert MAX_GREEN == 60
    assert DECISION_INTERVAL == 5
