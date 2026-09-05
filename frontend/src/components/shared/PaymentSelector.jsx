import { PAYMENT_METHODS } from '../../utils/constants';
import './PaymentSelector.css';

const PaymentSelector = ({ value, onChange }) => {
  return (
    <div className="payment-selector">
      {PAYMENT_METHODS.map(method => (
        <button
          key={method.value}
          className={`payment-selector__btn ${value === method.value ? 'payment-selector__btn--active' : ''}`}
          onClick={() => onChange(method.value)}
        >
          {method.label}
        </button>
      ))}
    </div>
  );
};

export default PaymentSelector;
