import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const initials = user?.email?.split('@')[0]?.slice(0, 2).toUpperCase() || 'U';

  return (
    <header className="header">
      <div className="header__spacer" />
      <div className="header__actions">
        <button className="header__theme-btn" onClick={toggleTheme} title="Cambiar tema">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <div className="header__user">
          <div className="header__avatar">
            <span>{initials}</span>
          </div>
          <button className="header__logout" onClick={logout} title="Cerrar sesion">
            Salir
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
