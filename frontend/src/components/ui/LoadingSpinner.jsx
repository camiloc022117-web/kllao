import './LoadingSpinner.css';

const LoadingSpinner = ({ message = 'Cargando...' }) => {
  return (
    <div className="loading-spinner">
      <div className="loading-spinner__ring" />
      <span className="loading-spinner__text">{message}</span>
    </div>
  );
};

export default LoadingSpinner;
