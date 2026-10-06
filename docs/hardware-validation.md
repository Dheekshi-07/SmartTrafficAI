# Hardware Integration & Physical Validation — SmartTrafficAI

## 1. Hardware Architecture Overview
The physical layer of SmartTrafficAI implements a miniature, actuated traffic signal driven by an **Arduino Uno** microcontroller board communicating bidirectionally with the Python TraCI / FastAPI control layer over USB serial.

---

## 2. Hardware Bill of Materials (BOM) & Wiring

### 2.1. Component Specifications
* **Microcontroller**: Arduino Uno Rev3 (Microchip ATmega328P @ 16 MHz, 5V operating logic)
* **Signal Actuators**:
  * 1 × 5mm Red LED (Stop / Safe State)
  * 1 × 5mm Yellow LED (Clearance / Transition)
  * 1 × 5mm Green LED (Go / Emergency Corridor)
* **Current-Limiting Resistors**: 3 × 220 $\Omega$ $\pm 5\%$ (1/4W metal film)
* **Prototyping Medium**: Half-size solderless breadboard + jumper wires (M-to-M)
* **Host Interface**: Standard USB-A to USB-B cable

### 2.2. Schematic Wiring Pinout

| Arduino Pin | Connection Component | Current-Limiting Resistor | Target Indicator |
| :--- | :--- | :--- | :--- |
| **Digital Pin 8** | Red LED Anode ($+$) | $220\,\Omega$ in series | North-South / East-West RED |
| **Digital Pin 9** | Yellow LED Anode ($+$) | $220\,\Omega$ in series | Clearance YELLOW |
| **Digital Pin 10** | Green LED Anode ($+$) | $220\,\Omega$ in series | Normal GREEN / Emergency Priority |
| **GND Pin** | Common Ground Rail | Direct bus wire | LED Cathodes ($-$ flat edge) |

---

## 3. Serial Communication Protocol

* **Baud Rate**: 9600 bps
* **Data Format**: 8 Data Bits, No Parity, 1 Stop Bit (8-N-1)
* **Framing**: Newline-delimited ASCII strings (`\n`)

### Command & Acknowledgement Matrix

| Host Command | Target State | Arduino Response | Description / Fail-Safe Behavior |
| :--- | :--- | :--- | :--- |
| `RED` | Pin 8 HIGH, others LOW | `ACK:RED` | Standard stop signal; default bootloader state. |
| `YELLOW` | Pin 9 HIGH, others LOW | `ACK:YELLOW` | 3-second clearance phase before direction switch. |
| `GREEN` | Pin 10 HIGH, others LOW | `ACK:GREEN` | Normal adaptive green signal for active approach. |
| `EMERGENCY_GREEN` | Pin 10 HIGH, others LOW | `ACK:EMERGENCY_GREEN` | Preemptive green corridor for approaching ambulance. |
| `ALL_OFF` | Pins 8, 9, 10 LOW | `ACK:ALL_OFF` | Maintenance / dark intersection mode. |
| `PING` | No pin change | `ACK:PONG` | Heartbeat keep-alive check for bridge watchdog. |
| `STATUS` | No pin change | `STATUS:<STATE>` | Queries instantaneous state of Arduino outputs. |

---

## 4. Software Architecture & Fail-Safe Handling

### 4.1. Arduino Firmware (`hardware/arduino/smart_traffic_signal.ino`)
* **Non-Blocking Execution**: Serial reading processes characters asynchronously without blocking `delay()` calls.
* **Buffer Overflow Protection**: Cyclic 32-byte circular buffer with automatic overflow flush.
* **Watchdog Fallback**: An internal `millis()` timer resets the signal to **RED** if no valid host serial communication is received within 60 seconds (`TIMEOUT_FALLBACK_MS = 60000`).

### 4.2. Python Serial Bridge (`hardware/python/serial_bridge.py`)
* **Auto-Port Detection**: Scans USB devices identifying vendor IDs (`Arduino`, `usbmodem`, `usbserial`, `CH340`, `FTDI`).
* **Non-Breaking Simulation Mode**: When physical hardware is unplugged, the bridge operates gracefully in `SIMULATION_ONLY` mode, preventing backend crashes.
* **ACK Verification & Retries**: Verifies exact microcontroller confirmation with configurable retry timeout.

---

## 5. Serial Reliability Benchmark (`hardware/python/test_serial_reliability.py`)

A repeatable test harness transmits command bursts to measure transmission latency, packet loss, and ACK reliability.

### Output Serialization (`results/serial_reliability.csv`)
* **Commands Sent**: Total test packets transmitted.
* **ACKs Received**: Confirmed microcontroller acknowledgements.
* **Packet Loss**: Percentage of lost / timed-out frames.
* **Latency Profile**: Minimum, Maximum, Mean, and P95 round-trip latency in milliseconds.

---

## 6. Physical Validation Status

| Subsystem Component | Implementation Status | Validation Mode | Evidence Reference |
| :--- | :--- | :--- | :--- |
| Arduino Firmware (`.ino`) | **Complete** | Code Verified / Non-blocking Logic | `hardware/arduino/smart_traffic_signal.ino` |
| Python Serial Bridge (`.py`) | **Complete** | Tested with Mock & Live TraCI | `hardware/python/serial_bridge.py` |
| Serial Test Harness (`.py`) | **Complete** | Automated Test Suite Passing | `hardware/python/test_serial_reliability.py` |
| Fast-Fail Backend Protection | **Complete** | Automated pytest verification | `tests/test_serial_bridge.py` |
| **Physical Arduino Execution** | **Ready for Hardware Run** | Physical USB Device Execution | `results/serial_reliability.csv` (Logged as `PHYSICAL_HARDWARE_PENDING`) |

> [!NOTE]
> When physical Arduino hardware is connected to the USB port, execute:
> ```bash
> python hardware/python/test_serial_reliability.py --packets 100
> ```
> This populates `results/serial_reliability.csv` with live physical hardware latency and packet-loss metrics.
