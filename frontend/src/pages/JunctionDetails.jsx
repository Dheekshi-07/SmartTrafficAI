import { useParams } from "react-router-dom";
import LiveIntersection from "../components/dashboard/LiveIntersection";

function JunctionDetails() {
  const { junctionId } = useParams();

  const queueSets = {
    J1: { N: 4, S: 2, E: 3, W: 1 },
    J2: { N: 6, S: 5, E: 7, W: 4 },
    J3: { N: 2, S: 1, E: 2, W: 1 },
    J4: { N: 5, S: 3, E: 4, W: 2 },
  };

  const queues =
    queueSets[junctionId] || queueSets.J1;

  return (
    <>
      <p className="eyebrow">
        JUNCTION CONTROL
      </p>

      <h1>Junction {junctionId}</h1>

      <p className="header-description">
        Live traffic signal status, queue conditions,
        and adaptive traffic control.
      </p>

      <div style={{ marginTop: "25px" }}>
        <LiveIntersection
          queues={queues}
          activeDirection={
            junctionId === "J2" ||
            junctionId === "J4"
              ? "EW"
              : "NS"
          }
          emergencyActive={
            junctionId === "J2"
          }
        />
      </div>
    </>
  );
}

export default JunctionDetails;