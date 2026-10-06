"""
SmartTrafficAI - Robust Arduino Serial Communication Bridge
Facilitates non-blocking, reliable bidirectional serial communication with the
physical Arduino Uno traffic signal controller.
Includes port discovery, ACK validation, automatic retries, heartbeat pings,
and graceful failure recovery without backend interruption.
"""

import time
from typing import Optional, Dict, Any, Tuple
import serial
import serial.tools.list_ports

DEFAULT_BAUD_RATE = 9600
DEFAULT_TIMEOUT = 1.0


class ArduinoTrafficSignal:
    """
    Production-ready serial controller for physical traffic signal hardware.
    """

    def __init__(self, port: Optional[str] = None, baud_rate: int = DEFAULT_BAUD_RATE):
        self.port = port
        self.baud_rate = baud_rate
        self.serial_connection: Optional[serial.Serial] = None
        self.is_connected = False
        self.last_command: Optional[str] = None
        self.last_ack: Optional[str] = None
        self.last_state: str = "UNKNOWN"
        self.connection_attempts = 0
        self.last_error: Optional[str] = None

    def find_arduino(self) -> Optional[str]:
        """Scan system USB ports for connected Arduino / CH340 / FTDI devices."""
        ports = serial.tools.list_ports.comports()
        for p in ports:
            desc = (p.description or "").lower()
            dev = (p.device or "").lower()
            hwid = (p.hwid or "").lower()

            if any(k in desc or k in dev or k in hwid for k in ["arduino", "usbmodem", "usbserial", "ch340", "ftdi"]):
                return p.device
        return None

    def connect(self, port: Optional[str] = None) -> bool:
        """Establish serial connection to Arduino."""
        if port:
            self.port = port
        elif self.port is None:
            self.port = self.find_arduino()

        if self.port is None:
            self.is_connected = False
            self.last_error = "No physical Arduino port detected on system"
            return False

        try:
            self.serial_connection = serial.Serial(
                self.port,
                self.baud_rate,
                timeout=DEFAULT_TIMEOUT,
                write_timeout=DEFAULT_TIMEOUT
            )
            # Allow Arduino bootloader reset stabilization
            time.sleep(1.8)
            self.serial_connection.reset_input_buffer()
            self.serial_connection.reset_output_buffer()
            self.is_connected = True
            self.last_error = None
            return True
        except serial.SerialException as err:
            self.is_connected = False
            self.last_error = str(err)
            self.serial_connection = None
            return False

    def disconnect(self):
        """Safely close serial connection."""
        if self.serial_connection:
            try:
                self.serial_connection.close()
            except Exception:
                pass
            finally:
                self.serial_connection = None
                self.is_connected = False

    def wait_for_ack(self, expected_command: Optional[str] = None, timeout: float = DEFAULT_TIMEOUT) -> Tuple[bool, str]:
        """Wait for ACK message from Arduino within timeout window."""
        if not self.serial_connection or not self.is_connected:
            return False, "DISCONNECTED"

        start_time = time.time()
        buffer = ""
        while (time.time() - start_time) < timeout:
            if self.serial_connection.in_waiting > 0:
                line = self.serial_connection.readline().decode("utf-8", errors="ignore").strip()
                if line:
                    self.last_ack = line
                    if line.startswith("ACK:") or line.startswith("SIGNAL:"):
                        if expected_command is None or expected_command in line:
                            return True, line
                    elif line.startswith("ERR:"):
                        return False, line
            time.sleep(0.01)

        return False, "TIMEOUT"

    def send_signal(self, command: str, wait_ack: bool = True, timeout: float = DEFAULT_TIMEOUT, max_retries: int = 1) -> bool:
        """Send command string to Arduino with optional retry and ACK verification."""
        valid_commands = {"RED", "YELLOW", "GREEN", "EMERGENCY_GREEN", "ALL_OFF", "PING", "STATUS"}
        cmd = command.strip().upper()
        if cmd not in valid_commands:
            self.last_error = f"Invalid command: {command}"
            return False

        self.last_command = cmd

        if not self.serial_connection or not self.is_connected:
            # Simulation/Mock mode - safe no-op
            self.last_state = cmd
            return False

        for attempt in range(max_retries + 1):
            try:
                msg = f"{cmd}\n"
                self.serial_connection.write(msg.encode("utf-8"))
                self.serial_connection.flush()

                if not wait_ack:
                    self.last_state = cmd
                    return True

                success, response = self.wait_for_ack(expected_command=cmd, timeout=timeout)
                if success:
                    self.last_state = cmd
                    self.last_error = None
                    return True
                else:
                    self.last_error = f"ACK failed on attempt {attempt + 1}: {response}"
            except (serial.SerialException, OSError) as err:
                self.last_error = f"Transmission error: {err}"
                self.is_connected = False
                break
            time.sleep(0.05)

        return False

    def red(self) -> bool:
        return self.send_signal("RED")

    def yellow(self) -> bool:
        return self.send_signal("YELLOW")

    def green(self) -> bool:
        return self.send_signal("GREEN")

    def emergency_green(self) -> bool:
        return self.send_signal("EMERGENCY_GREEN")

    def all_off(self) -> bool:
        return self.send_signal("ALL_OFF")

    def ping(self) -> bool:
        return self.send_signal("PING")

    def get_status(self) -> Dict[str, Any]:
        """Return current serial connection telemetry without raising exceptions."""
        return {
            "connected": self.is_connected,
            "port": self.port or "None",
            "baud_rate": self.baud_rate,
            "last_command": self.last_command or "None",
            "last_ack": self.last_ack or "None",
            "current_state": self.last_state,
            "last_error": self.last_error,
            "mode": "PHYSICAL_HARDWARE" if self.is_connected else "SIMULATION_ONLY"
        }

    def close(self):
        self.disconnect()


# Global singleton instance for backend reuse
_global_bridge: Optional[ArduinoTrafficSignal] = None


def get_arduino_bridge() -> ArduinoTrafficSignal:
    global _global_bridge
    if _global_bridge is None:
        _global_bridge = ArduinoTrafficSignal()
        # Attempt auto-connection non-destructively
        _global_bridge.connect()
    return _global_bridge
