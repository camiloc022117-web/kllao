import { formatPrice } from '../../utils/format';
import './ProductCard.css';

const ProductCard = ({ name, price, stock, selected, inEntry, variant, onClick }) => {
  return (
    <button
      className={`product-card ${selected ? 'product-card--selected' : ''} ${inEntry ? 'product-card--in-entry' : ''} ${variant ? 'product-card--slush' : ''}`}
      onClick={onClick}
    >
      <span className="product-card__name">{name}</span>
      {price > 0 && <span className="product-card__price">{formatPrice(price)}</span>}
      {stock !== undefined && (
        <span className={`product-card__stock ${stock <= 5 ? 'product-card__stock--low' : ''}`}>
          Stock: {stock}
        </span>
      )}
      {variant && <span className="product-card__variant">{variant}</span>}
    </button>
  );
};

export default ProductCard;
