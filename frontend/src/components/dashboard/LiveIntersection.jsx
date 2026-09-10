import {
  Ambulance,
  CarFront,
  MapPin,
  Radio,
} from "lucide-react";

function LiveIntersection({
  queues = { N: 3, S: 2, E: 1, W: 1 },
  activeDirection = "NS",
  emergencyActive = false,
}) {
  const northSouthGreen =
    activeDirection === "NS" && !emergencyActive;

  const eastWestGreen =
    activeDirection === "EW" || emergencyActive;

  const Signal = ({ green }) => (
    <div className="command-signal">
      <span
        className={`signal-bulb red ${
          !green ? "signal-on" : ""
        }`}
      />

      <span
        className="signal-bulb yellow"
      />

      <span
        className={`signal-bulb green ${
          green ? "signal-on" : ""
        }`}
      />
    </div>
  );

  return (
    <section className="command-card live-intersection-card">

      {/* HEADER */}

      <div className="command-card-header">

        <div>
          <div className="section-kicker">
            <Radio size={13} />
            LIVE INTERSECTION
          </div>

          <h2>Junction J1</h2>

          <p>
            Real-time adaptive traffic control
            visualization
          </p>
        </div>

        <div
          className={
            emergencyActive
              ? "controller-pill emergency"
              : "controller-pill"
          }
        >
          <span />

          {emergencyActive
            ? "EMERGENCY PREEMPTION"
            : "ADAPTIVE CONTROL"}
        </div>

      </div>

      {/* INTERSECTION */}

      <div className="smart-intersection">

        {/* GRID BACKGROUND */}

        <div className="map-grid" />

        {/* ROAD SURFACES */}

        <div className="smart-road road-ns" />
        <div className="smart-road road-ew" />

        {/* CENTRE LANE LINES */}

        <div className="center-line line-ns" />
        <div className="center-line line-ew" />

        {/* ROAD LABELS */}

        <div className="road-label label-north">
          <span>NORTH</span>
          <strong>N</strong>
        </div>

        <div className="road-label label-south">
          <strong>S</strong>
          <span>SOUTH</span>
        </div>

        <div className="road-label label-east">
          <strong>E</strong>
          <span>EAST</span>
        </div>

        <div className="road-label label-west">
          <span>WEST</span>
          <strong>W</strong>
        </div>

        {/* QUEUES */}

        <div className="live-queue queue-top">
          <span>NORTH QUEUE</span>
          <strong>{queues.N}</strong>
          <small>vehicles</small>
        </div>

        <div className="live-queue queue-bottom">
          <span>SOUTH QUEUE</span>
          <strong>{queues.S}</strong>
          <small>vehicles</small>
        </div>

        <div className="live-queue queue-right">
          <span>EAST QUEUE</span>
          <strong>{queues.E}</strong>
          <small>vehicles</small>
        </div>

        <div className="live-queue queue-left">
          <span>WEST QUEUE</span>
          <strong>{queues.W}</strong>
          <small>vehicles</small>
        </div>

        {/* TRAFFIC SIGNALS */}

        <div className="signal-position signal-pos-n">
          <Signal green={northSouthGreen} />
        </div>

        <div className="signal-position signal-pos-s">
          <Signal green={northSouthGreen} />
        </div>

        <div className="signal-position signal-pos-e">
          <Signal green={eastWestGreen} />
        </div>

        <div className="signal-position signal-pos-w">
          <Signal green={eastWestGreen} />
        </div>

        {/* VEHICLES */}

        <CarFront
          className="map-vehicle vehicle-n1"
          size={21}
        />

        <CarFront
          className="map-vehicle vehicle-n2"
          size={21}
        />

        <CarFront
          className="map-vehicle vehicle-s1"
          size={21}
        />

        <CarFront
          className="map-vehicle vehicle-e1"
          size={21}
        />

        <CarFront
          className="map-vehicle vehicle-w1"
          size={21}
        />

        {/* JUNCTION CORE */}

        <div className="junction-core">

          <div className="junction-ring">
            <MapPin size={17} />
          </div>

          <strong>J1</strong>

          <span>
            AI CONTROLLED
          </span>

        </div>

        {/* EMERGENCY VEHICLE */}

        {emergencyActive && (
          <div className="live-ambulance">

            <Ambulance size={28} />

            <div>
              <strong>AMB_001</strong>
              <span>PRIORITY</span>
            </div>

          </div>
        )}

        {/* EMERGENCY BANNER */}

        {emergencyActive && (
          <div className="intersection-alert">

            <Ambulance size={16} />

            <div>
              <strong>
                EMERGENCY VEHICLE DETECTED
              </strong>

              <span>
                East / West green corridor active
              </span>
            </div>

          </div>
        )}

      </div>

      {/* BOTTOM STATUS */}

      <div className="intersection-status-grid">

        <div>
          <span>CONTROL MODE</span>

          <strong>
            {emergencyActive
              ? "Emergency"
              : "Adaptive"}
          </strong>
        </div>

        <div>
          <span>ACTIVE CORRIDOR</span>

          <strong>
            {activeDirection === "NS" &&
            !emergencyActive
              ? "North / South"
              : "East / West"}
          </strong>
        </div>

        <div>
          <span>TOTAL QUEUE</span>

          <strong>
            {queues.N +
              queues.S +
              queues.E +
              queues.W}{" "}
            vehicles
          </strong>
        </div>

        <div>
          <span>JUNCTION</span>

          <strong className="healthy-text">
            ● Operational
          </strong>
        </div>

      </div>

    </section>
  );
}

export default LiveIntersection;