const int RED_LED = 8;
const int YELLOW_LED = 9;
const int GREEN_LED = 10;

void setSignal(bool red, bool yellow, bool green) {
  digitalWrite(RED_LED, red ? HIGH : LOW);
  digitalWrite(YELLOW_LED, yellow ? HIGH : LOW);
  digitalWrite(GREEN_LED, green ? HIGH : LOW);
}

void setup() {
  Serial.begin(9600);

  pinMode(RED_LED, OUTPUT);
  pinMode(YELLOW_LED, OUTPUT);
  pinMode(GREEN_LED, OUTPUT);

  // Safe default
  setSignal(true, false, false);

  Serial.println("SMARTTRAFFICAI_READY");
}

void loop() {
  if (Serial.available() > 0) {

    String command = Serial.readStringUntil('\n');
    command.trim();

    if (command == "RED") {
      setSignal(true, false, false);
      Serial.println("SIGNAL:RED");
    }

    else if (command == "YELLOW") {
      setSignal(false, true, false);
      Serial.println("SIGNAL:YELLOW");
    }

    else if (command == "GREEN") {
      setSignal(false, false, true);
      Serial.println("SIGNAL:GREEN");
    }

    else if (command == "EMERGENCY_GREEN") {
      setSignal(false, false, true);
      Serial.println("SIGNAL:EMERGENCY_GREEN");
    }

    else if (command == "ALL_OFF") {
      setSignal(false, false, false);
      Serial.println("SIGNAL:ALL_OFF");
    }

    else {
      Serial.print("UNKNOWN_COMMAND:");
      Serial.println(command);
    }
  }
}