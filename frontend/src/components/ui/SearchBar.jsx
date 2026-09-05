import './SearchBar.css';

const SearchBar = ({ value, onChange, placeholder = 'Buscar...', className = '' }) => {
  return (
    <div className={`search-bar ${className}`}>
      <span className="search-bar__icon">🔍</span>
      <input
        type="text"
        className="search-bar__input"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      {value && (
        <button className="search-bar__clear" onClick={() => onChange('')}>×</button>
      )}
    </div>
  );
};

export default SearchBar;
