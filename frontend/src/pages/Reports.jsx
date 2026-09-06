import { useState, useEffect } from 'react';
import { getSalesByDateRange } from '../services/sales.service';
import { PRODUCT_LABEL, PAYMENT_LABEL } from '../utils/labels';
import { formatPrice } from '../utils/format';
import { StatCard } from '../components/ui/Card';
import { PaymentBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Toast from '../components/ui/Toast';
import './Reports.css';

const Reports = () => {
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    document.title = "Reportes | K'llao";
  }, []);

  const handleSearch = async () => {
    if (!startDate || !endDate) return;
    if (startDate > endDate) {
      setToast({ message: 'La fecha inicial no puede ser mayor a la final.', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const res = await getSalesByDateRange(startDate, endDate);
      setData(res.data);
    } catch (error) {
      setToast({ message: 'Error al cargar reportes.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const setQuickRange = (range) => {
    const now = new Date();
    const end = now.toISOString().split('T')[0];
    let start;
    if (range === 'today') start = end;
    else if (range === 'week') {
      const d = new Date(now);
      d.setDate(now.getDate() - 7);
      start = d.toISOString().split('T')[0];
    } else if (range === 'month') {
      start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    }
    setStartDate(start);
    setEndDate(end);
  };

  const handleExportCSV = () => {
    if (!data || !data.sales.length) return;

    const headers = ['Fecha', 'Hora', 'Productos', 'Metodo de pago', 'Total'];
    const rows = data.sales.map(sale => {
      const items = sale.items.map(item =>
        item.variant_id
          ? `Granizado ${item.size_name} ${item.has_liquor ? 'c/licor' : 's/licor'}`
          : PRODUCT_LABEL(item.product_name)
      ).join(' + ');
      return [sale.date, sale.time?.slice(0, 5), items, PAYMENT_LABEL(sale.payment_method), sale.total];
    });

    const summary = [
      [],
      ['RESUMEN'],
      ['Total vendido', data.summary.total],
      ['Efectivo', data.summary.cash],
      ['Transferencia', data.summary.transfer],
      ['Tarjeta', data.summary.card],
      ['Total ventas', data.summary.count]
    ];

    const csvContent = [headers, ...rows, ...summary]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte_${startDate}_${endDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setToast({ message: 'Reporte exportado', type: 'success' });
  };

  return (
    <div className="reports">
      <h1 className="reports-title">Reportes de ventas</h1>

      <div className="reports-filters">
        <div className="quick-filters">
          <Button variant="secondary" size="sm" onClick={() => setQuickRange('today')}>Hoy</Button>
          <Button variant="secondary" size="sm" onClick={() => setQuickRange('week')}>Esta semana</Button>
          <Button variant="secondary" size="sm" onClick={() => setQuickRange('month')}>Este mes</Button>
        </div>
        <div className="date-filters">
          <div className="input-group">
            <label>Desde</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="input-group">
            <label>Hasta</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <Button variant="primary" size="sm" loading={loading} onClick={handleSearch}>Consultar</Button>
          <Button variant="secondary" size="sm" disabled={!data} onClick={handleExportCSV}>Exportar CSV</Button>
        </div>
      </div>

      {data && (
        <>
          <div className="summary-cards">
            <StatCard label="Total vendido" value={formatPrice(data.summary.total)} sub={`${data.summary.count} ventas`} />
            <StatCard label="Efectivo" value={formatPrice(data.summary.cash)} />
            <StatCard label="Transferencia" value={formatPrice(data.summary.transfer)} />
            <StatCard label="Tarjeta" value={formatPrice(data.summary.card)} />
          </div>

          {Object.keys(data.slushBySize).length > 0 && (
            <div className="slush-section">
              <h2 className="section-title">Granizados por tamano</h2>
              <div className="slush-grid">
                {Object.entries(data.slushBySize)
                  .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
                  .map(([size, count]) => (
                    <div key={size} className="slush-card">
                      <span className="slush-size">{size}</span>
                      <span className="slush-count">{count} uds.</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="sales-section">
            <h2 className="section-title">Historial de ventas</h2>
            {data.sales.length === 0 ? (
              <p className="no-sales">No hay ventas en este periodo.</p>
            ) : (
              <table className="sales-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Productos</th>
                    <th>Pago</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.sales.map(sale => (
                    <tr key={sale.id}>
                      <td>{sale.date}</td>
                      <td>{sale.time?.slice(0, 5)}</td>
                      <td>
                        <div className="sale-items-list">
                          {sale.items.map(item => (
                            <span key={item.id} className="sale-item-tag">
                              {item.variant_id
                                ? `Granizado ${item.size_name} ${item.has_liquor ? 'c/licor' : 's/licor'}`
                                : PRODUCT_LABEL(item.product_name)
                              }
                              {item.quantity > 1 && ` x${item.quantity}`}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td><PaymentBadge method={sale.payment_method} /></td>
                      <td className="sale-total">{formatPrice(sale.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {!data && !loading && (
        <div className="reports-empty">
          <p>Selecciona un periodo y haz clic en Consultar para ver los reportes.</p>
        </div>
      )}

      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
    </div>
  );
};

export default Reports;
