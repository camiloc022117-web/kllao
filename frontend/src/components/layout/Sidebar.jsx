import { NavLink } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import logoLight from '../../assets/logo_light.png';
import logoDark from '../../assets/logo_dark.png';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: '📊', end: true },
  { to: '/ventas', label: 'Ventas', icon: '🛒' },
  { to: '/inventory', label: 'Inventario', icon: '📦' },
  { to: '/products', label: 'Productos', icon: '🏷️' },
  { to: '/reports', label: 'Reportes', icon: '📈' },
];

const Sidebar = ({ collapsed, onToggle }) => {
  const { theme } = useTheme();

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="sidebar__header">
        <img
          src={theme === 'light' ? logoLight : logoDark}
          alt="Logo"
          className="sidebar__logo"
        />
        {!collapsed && <span className="sidebar__brand">K'lliao</span>}
      </div>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
            }
            title={collapsed ? item.label : ''}
          >
            <span className="sidebar__icon">{item.icon}</span>
            {!collapsed && <span className="sidebar__label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <button className="sidebar__toggle" onClick={onToggle}>
          {collapsed ? '→' : '←'}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
