import { useState, useEffect } from 'react';
import { getProducts } from '../services/products.service';
import { getSales } from '../services/sales.service';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalProducts: 0, lowStock: 0, totalSales: 0, revenue: 0 });
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    Promise.all([getProducts(), getSales()])
      .then(([p, s]) => {
        if (cancel) return;
        const products = p.data || p;
        const sales = s.data || s;
        const lowStock = products.filter(p => p.current_stock <= 5).length;
        const revenue = sales.reduce((sum, s) => sum + Number(s.total), 0);
        setStats({ totalProducts: products.length, lowStock, totalSales: sales.length, revenue });
        setRecentSales(sales.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => { if (!cancel) setLoading(false); });
    return () => { cancel = true; };
  }, []);

  const fmt = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

  if (loading) {
    return <div className="loading-spinner"><div className="loading-spinner__ring" /><span className="loading-spinner__text">Cargando...</span></div>;
  }

  return (
    <div className="dashboard">
      <h1 className="dashboard__title">Dashboard</h1>

      <div className="dashboard__kpi">
        <div className="kpi-card">
          <div className="kpi-card__icon">💰</div>
          <div className="kpi-card__info">
            <span className="kpi-card__label">Total Ventas</span>
            <span className="kpi-card__value">{stats.totalSales}</span>
          </div>
        </div>
        <div className="kpi-card kpi-card--primary">
          <div className="kpi-card__icon">📈</div>
          <div className="kpi-card__info">
            <span className="kpi-card__label">Ingresos</span>
            <span className="kpi-card__value">{fmt(stats.revenue)}</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card__icon">🏷️</div>
          <div className="kpi-card__info">
            <span className="kpi-card__label">Productos</span>
            <span className="kpi-card__value">{stats.totalProducts}</span>
          </div>
        </div>
        <div className="kpi-card kpi-card--warning">
          <div className="kpi-card__icon">⚠️</div>
          <div className="kpi-card__info">
            <span className="kpi-card__label">Stock Bajo</span>
            <span className="kpi-card__value">{stats.lowStock}</span>
          </div>
        </div>
      </div>

      <div className="dashboard__grid">
        <div className="dashboard__card">
          <h3 className="dashboard__card-title">Ventas Recientes</h3>
          {recentSales.length === 0 ? (
            <p className="dashboard__empty">No hay ventas</p>
          ) : (
            <div className="recent-sales">
              {recentSales.map(sale => (
                <div key={sale.id} className="recent-sale">
                  <div className="recent-sale__info">
                    <span className="recent-sale__date">{sale.date}</span>
                    <span className="recent-sale__time">{sale.time}</span>
                  </div>
                  <span className="recent-sale__total">{fmt(sale.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard__card">
          <h3 className="dashboard__card-title">Resumen</h3>
          <div className="quick-stats">
            <div className="quick-stat">
              <span className="quick-stat__label">Promedio/venta</span>
              <span className="quick-stat__value">
                {stats.totalSales > 0 ? fmt(stats.revenue / stats.totalSales) : '$0'}
              </span>
            </div>
            <div className="quick-stat">
              <span className="quick-stat__label">Stock bajo</span>
              <span className="quick-stat__value quick-stat__value--warning">{stats.lowStock}</span>
            </div>
            <div className="quick-stat">
              <span className="quick-stat__label">Productos</span>
              <span className="quick-stat__value">{stats.totalProducts}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
