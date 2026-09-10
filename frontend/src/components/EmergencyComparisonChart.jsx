import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function EmergencyComparisonChart({ data }) {
  return (
    <div className="panel emergency-panel">

      <div className="panel-heading">
        <div>
          <p className="eyebrow emergency-text">
            EMERGENCY RESPONSE
          </p>

          <h3>Ambulance Priority Performance</h3>
        </div>

        <span className="emergency-badge">
          AMB_001
        </span>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis dataKey="mode" />
            <YAxis />

            <Tooltip />
            <Legend />

            <Bar
  dataKey="travel_time"
  name="Travel Time"
  fill="#ff6b6b"
  radius={[5, 5, 0, 0]}
/>

<Bar
  dataKey="waiting_time"
  name="Waiting Time"
  fill="#ff9f43"
  radius={[5, 5, 0, 0]}
/>

<Bar
  dataKey="time_loss"
  name="Time Loss"
  fill="#c56cf0"
  radius={[5, 5, 0, 0]}
/>
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}

export default EmergencyComparisonChart;