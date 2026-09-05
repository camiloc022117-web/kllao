import { useEffect, useState } from 'react';
import './Toast.css';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  const [visible, setVisible] = useState(!!message);

  useEffect(() => {
    if (!message) return;
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!visible || !message) return null;

  return (
    <div className={`toast toast--${type}`}>
      <span className="toast__icon">
        {type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}
      </span>
      <span className="toast__message">{message}</span>
      <button className="toast__close" onClick={() => { setVisible(false); onClose?.(); }}>×</button>
    </div>
  );
};

export default Toast;
