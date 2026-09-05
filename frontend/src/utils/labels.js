const PRODUCT_LABELS = {
  'Slush': 'Granizado',
  'DeTodito': 'DeTodito',
  'Doritos': 'Doritos',
  'Choclitos': 'Choclitos',
  'Aguila Light': 'Águila Light',
  'Pilsen': 'Pilsen',
  'Water bottle': 'Agua',
  'Syringe': 'Jeringa',
  'Watermelon tape': 'Cinta sandía',
  'Gummy': 'Gomita',
  'Red Lips': 'Labios rojos'
};

const CATEGORY_LABELS = {
  'slushies': 'Granizado',
  'snacks': 'Mecatos',
  'drinks': 'Bebidas',
  'extras': 'Adicionales'
};

const PAYMENT_LABELS = {
  'cash': 'Efectivo',
  'transfer': 'Transferencia',
  'card': 'Tarjeta'
};

const PRODUCT_LABEL = (name) => PRODUCT_LABELS[name] || name;
const CATEGORY_LABEL = (name) => CATEGORY_LABELS[name] || name;
const PAYMENT_LABEL = (method) => PAYMENT_LABELS[method] || method;

export {
  PRODUCT_LABEL,
  CATEGORY_LABEL,
  PAYMENT_LABEL,
  PRODUCT_LABELS,
  CATEGORY_LABELS,
  PAYMENT_LABELS
};
