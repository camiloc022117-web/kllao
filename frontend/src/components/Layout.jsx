import { Outlet, NavLink } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import './Layout.css'
import logoLight from '../assets/logo_light.png'
import logoDark from '../assets/logo_dark.png'

const Layout = () => {
    const { theme, toggleTheme } = useTheme()

    return (
        <div className="app">
        <header className="navbar">
            <div className="navbar-brand">
                <img 
                    src={theme === 'light' ? logoLight : logoDark} 
                    alt="Logo" 
                    className="logo" 
                />
            </div>

            <nav className="navbar-nav">
            <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Ventas
            </NavLink>
            <NavLink to="/inventory" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Inventario
            </NavLink>
            <NavLink to="/products" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Productos
            </NavLink>
            <NavLink to="/reports" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Reportes
            </NavLink>
            </nav>

            <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
            {theme === 'light' ? '🌙' : '☀️'}
            </button>
        </header>

        <main className="main-content">
            <Outlet />
        </main>
        </div>
    )
}

export default Layout