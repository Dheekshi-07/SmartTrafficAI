import serial
import serial.tools.list_ports
import time


BAUD_RATE = 9600


class ArduinoTrafficSignal:
    def __init__(self, port=None):
        self.port = port
        self.serial_connection = None

    def find_arduino(self):
        """Automatically search for a likely Arduino serial port."""

        ports = serial.tools.list_ports.comports()

        for port in ports:
            description = (port.description or "").lower()
            device = (port.device or "").lower()

            if (
                "arduino" in description
                or "usbmodem" in device
                or "usbserial" in device
            ):
                return port.device

        return None

    def connect(self):
        if self.port is None:
            self.port = self.find_arduino()

        if self.port is None:
            print("[HARDWARE] Arduino not connected.")
            print("[HARDWARE] Running without physical signal output.")
            return False

        try:
            self.serial_connection = serial.Serial(
                self.port,
                BAUD_RATE,
                timeout=1,
            )

            time.sleep(2)

            print(f"[HARDWARE] Arduino connected: {self.port}")
            return True

        except serial.SerialException as error:
            print(f"[HARDWARE] Connection failed: {error}")
            return False

    def send(self, command):
        if self.serial_connection is None:
            print(f"[SIMULATION ONLY] Hardware command: {command}")
            return False

        try:
            message = f"{command}\n"

            self.serial_connection.write(message.encode("utf-8"))
            self.serial_connection.flush()

            print(f"[ARDUINO] Sent: {command}")

            return True

        except serial.SerialException as error:
            print(f"[HARDWARE] Serial error: {error}")
            return False

    def red(self):
        return self.send("RED")

    def yellow(self):
        return self.send("YELLOW")

    def green(self):
        return self.send("GREEN")

    def emergency_green(self):
        return self.send("EMERGENCY_GREEN")

    def all_off(self):
        return self.send("ALL_OFF")

    def close(self):
        if self.serial_connection:
            self.serial_connection.close()
            self.serial_connection = None

            print("[HARDWARE] Arduino connection closed.")


if __name__ == "__main__":
    signal = ArduinoTrafficSignal()

    connected = signal.connect()

    if connected:
        print("Testing SmartTrafficAI physical traffic signal...")

        signal.red()
        time.sleep(3)

        signal.yellow()
        time.sleep(1)

        signal.green()
        time.sleep(3)

        signal.all_off()

        signal.close()

    else:
        print()
        print("Arduino hardware unavailable.")
        print("Serial bridge code is ready for later physical validation.")