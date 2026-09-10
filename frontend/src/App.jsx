import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";

import Dashboard from "./pages/Dashboard";
import LiveTraffic from "./pages/LiveTraffic";
import JunctionDetails from "./pages/JunctionDetails";
import Analytics from "./pages/Analytics";
import EmergencyMobility from "./pages/EmergencyMobility";
import SimulationLab from "./pages/SimulationLab";
import Hardware from "./pages/Hardware";
import Architecture from "./pages/Architecture";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/traffic"
          element={<LiveTraffic />}
        />

        <Route
          path="/junction/:junctionId"
          element={<JunctionDetails />}
        />

        <Route
          path="/analytics"
          element={<Analytics />}
        />

        <Route
          path="/emergency"
          element={<EmergencyMobility />}
        />

        <Route
          path="/simulation"
          element={<SimulationLab />}
        />

        <Route
          path="/hardware"
          element={<Hardware />}
        />

        <Route
          path="/architecture"
          element={<Architecture />}
        />
      </Route>
    </Routes>
  );
}

export default App;