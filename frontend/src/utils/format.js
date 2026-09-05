const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(price);
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date + 'T00:00:00').toLocaleDateString('es-CO');
};

const formatTime = (time) => {
  if (!time) return '';
  return time.slice(0, 5);
};

const formatNumber = (num) => {
  return new Intl.NumberFormat('es-CO').format(num);
};

export { formatPrice, formatDate, formatTime, formatNumber };
