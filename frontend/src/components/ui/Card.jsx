import './Card.css';

const Card = ({ children, variant = 'default', className = '', ...props }) => {
  return (
    <div className={`card card--${variant} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const StatCard = ({ label, value, sub, icon, trend, className = '' }) => {
  return (
    <Card variant="stat" className={`stat-card ${className}`}>
      <div className="stat-card__header">
        {icon && <span className="stat-card__icon">{icon}</span>}
        <span className="stat-card__label">{label}</span>
      </div>
      <span className="stat-card__value">{value}</span>
      {sub && <span className="stat-card__sub">{sub}</span>}
      {trend && (
        <span className={`stat-card__trend ${trend > 0 ? 'up' : 'down'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </Card>
  );
};

export default Card;
