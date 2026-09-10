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

function TrafficPerformanceChart({ data }) {
  return (
    <div className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">PERFORMANCE</p>
          <h3>Controller Performance</h3>
        </div>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis dataKey="controller" />
            <YAxis />

            <Tooltip />
            <Legend />

            <Bar
  dataKey="avg_travel_time"
  name="Travel Time"
  fill="#4f8cff"
  radius={[5, 5, 0, 0]}
/>

<Bar
  dataKey="avg_waiting_time"
  name="Waiting Time"
  fill="#35d6c3"
  radius={[5, 5, 0, 0]}
/>

<Bar
  dataKey="avg_time_loss"
  name="Time Loss"
  fill="#f0b45d"
  radius={[5, 5, 0, 0]}
/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default TrafficPerformanceChart;