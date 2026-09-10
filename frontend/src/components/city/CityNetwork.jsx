import {
  Ambulance,
  ArrowRight,
  MapPin,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const junctions = [
  {
    id: "J1",
    name: "Central Junction",
    queue: 4,
    density: "Moderate",
    signal: "NS Green",
    emergency: false,
  },
  {
    id: "J2",
    name: "Hospital Road",
    queue: 7,
    density: "High",
    signal: "EW Green",
    emergency: true,
  },
  {
    id: "J3",
    name: "Market Junction",
    queue: 2,
    density: "Low",
    signal: "NS Green",
    emergency: false,
  },
  {
    id: "J4",
    name: "Tech Park Junction",
    queue: 5,
    density: "Moderate",
    signal: "EW Green",
    emergency: false,
  },
];

function CityNetwork() {
  const navigate = useNavigate();

  return (
    <section className="city-network-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">
            CITY NETWORK
          </p>

          <h2>
            Multi-Junction Traffic Network
          </h2>

          <p>
            Monitor connected adaptive intersections
            across the SmartTrafficAI network.
          </p>
        </div>
      </div>

      <div className="city-map">
        <div className="network-line line-j1-j2" />
        <div className="network-line line-j2-j3" />
        <div className="network-line line-j2-j4" />

        {junctions.map((junction, index) => (
          <button
            key={junction.id}
            className={`city-junction city-junction-${
              index + 1
            } ${
              junction.emergency
                ? "junction-emergency"
                : ""
            }`}
            onClick={() =>
              navigate(`/junction/${junction.id}`)
            }
          >
            <div className="city-junction-icon">
              {junction.emergency ? (
                <Ambulance size={19} />
              ) : (
                <MapPin size={19} />
              )}
            </div>

            <strong>{junction.id}</strong>

            <span>{junction.name}</span>

            <small>
              Queue {junction.queue} • {junction.density}
            </small>

            <ArrowRight size={13} />
          </button>
        ))}

        <div className="hospital-marker">
          🏥 HOSPITAL
        </div>
      </div>
    </section>
  );
}

export default CityNetwork;