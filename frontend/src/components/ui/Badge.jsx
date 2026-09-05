import './Badge.css';

const Badge = ({ children, variant = 'default', size = 'sm' }) => {
  return (
    <span className={`badge badge--${variant} badge--${size}`}>
      {children}
    </span>
  );
};

export const StockBadge = ({ stock }) => {
  if (stock <= 0) return <Badge variant="danger">Agotado</Badge>;
  if (stock <= 5) return <Badge variant="warning">{stock} uds</Badge>;
  return <Badge variant="success">{stock} uds</Badge>;
};

export const PaymentBadge = ({ method }) => {
  const variants = {
    cash: 'primary',
    transfer: 'info',
    card: 'purple'
  };
  const labels = { cash: 'Efectivo', transfer: 'Transferencia', card: 'Tarjeta' };
  return <Badge variant={variants[method] || 'default'}>{labels[method] || method}</Badge>;
};

export const LiquorBadge = ({ hasLiquor }) => {
  return hasLiquor
    ? <Badge variant="primary">Con licor</Badge>
    : <Badge variant="default">Sin licor</Badge>;
};

export default Badge;
