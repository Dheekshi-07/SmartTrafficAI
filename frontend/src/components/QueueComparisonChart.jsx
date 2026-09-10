import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function QueueComparisonChart({ data }) {
  return (
    <div className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">TRAFFIC OPTIMIZATION</p>
          <h3>Average Queue Length</h3>
        </div>

        <span className="success-badge">
          ↓ 69.73%
        </span>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis dataKey="Controller" />
            <YAxis />

            <Tooltip />

            <Bar
  dataKey="Average Queue"
  fill="#32d6c5"
  radius={[8, 8, 0, 0]}
/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default QueueComparisonChart;