function MetricCard({ title, value, subtitle, icon: Icon }) {
  return (
    <div className="metric-card">
      <div className="metric-icon">
        {Icon && <Icon size={22} />}
      </div>

      <div>
        <p className="metric-title">{title}</p>
        <h2>{value}</h2>
        <span>{subtitle}</span>
      </div>
    </div>
  );
}

export default MetricCard;