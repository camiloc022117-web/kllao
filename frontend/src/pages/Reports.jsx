import { useState, useEffect } from 'react'
import { getSalesByDateRange } from '../services/sales.service'
import Toast from '../components/Toast'
import './Reports.css'

const Reports = () => {
  const today = new Date().toISOString().split('T')[0]

  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({ message: '', type: 'success' })

  useEffect(() => {
    document.title = "Reportes | K'llao"
  }, [])
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const getProductLabel = (name) => {
    const labels = {
      'Slush': 'Granizado',
      'DeTodito': 'DeTodito',
      'Doritos': 'Doritos',
      'Choclitos': 'Choclitos',
      'Aguila Light': 'Águila Light',
      'Pilsen': 'Pilsen',
      'Water bottle': 'Agua',
      'Syringe': 'Jeringa',
      'Watermelon tape': 'Cinta sandía',
      'Gummy': 'Gomita',
      'Red Lips': 'Labios rojos'
    }
    return labels[name] || name
  }

  const handleSearch = async () => {
    if (!startDate || !endDate) return
    if (startDate > endDate) {
      setToast({ message: 'La fecha inicial no puede ser mayor a la final.', type: 'error' })
      return
    }

    setLoading(true)
    try {
      const res = await getSalesByDateRange(startDate, endDate)
      setData(res.data)
    } catch (error) {
      console.error('Error loading reports:', error)
      setToast({ message: 'Error al cargar los reportes. Verifica la conexión.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const setQuickRange = (range) => {
    const now = new Date()
    const end = now.toISOString().split('T')[0]
    let start

    if (range === 'today') {
      start = end
    } else if (range === 'week') {
      const weekAgo = new Date(now)
      weekAgo.setDate(now.getDate() - 7)
      start = weekAgo.toISOString().split('T')[0]
    } else if (range === 'month') {
      start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
    }

    setStartDate(start)
    setEndDate(end)
  }

  const paymentLabel = {
    cash: 'Efectivo',
    transfer: 'Transferencia',
    card: 'Tarjeta'
  }

  const handleExport = () => {
  if (!startDate || !endDate) return
  window.open(`http://localhost:5000/export?start=${startDate}&end=${endDate}`, '_blank')
}

  return (
    <div className="reports">
      <h1 className="reports-title">Reportes de ventas</h1>

      <div className="reports-filters">
        <div className="quick-filters">
          <button className="quick-btn" onClick={() => setQuickRange('today')}>Hoy</button>
          <button className="quick-btn" onClick={() => setQuickRange('week')}>Esta semana</button>
          <button className="quick-btn" onClick={() => setQuickRange('month')}>Este mes</button>
        </div>

        <div className="date-filters">
          <div className="input-group">
            <label>Desde</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>Hasta</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </div>
          <button
            className="search-btn"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Consultar'}
          </button>
          
          <button
            className="export-btn"
            onClick={handleExport}
            disabled={!data}
          >
            Descargar Excel
          </button>
        </div>
      </div>

      {data && (
        <>
          <div className="summary-cards">
            <div className="summary-card total">
              <span className="card-label">Total vendido</span>
              <span className="card-amount">{formatPrice(data.summary.total)}</span>
              <span className="card-sub">{data.summary.count} ventas</span>
            </div>
            <div className="summary-card">
              <span className="card-label">Efectivo</span>
              <span className="card-amount">{formatPrice(data.summary.cash)}</span>
            </div>
            <div className="summary-card">
              <span className="card-label">Transferencia</span>
              <span className="card-amount">{formatPrice(data.summary.transfer)}</span>
            </div>
            <div className="summary-card">
              <span className="card-label">Tarjeta</span>
              <span className="card-amount">{formatPrice(data.summary.card)}</span>
            </div>
          </div>

          {Object.keys(data.slushBySize).length > 0 && (
            <div className="slush-section">
              <h2 className="section-title">Granizados por tamaño</h2>
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
              <p className="no-sales">No hay ventas en este período.</p>
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
                      <td>{sale.time.slice(0, 5)}</td>
                      <td>
                        <div className="sale-items-list">
                          {sale.items.map(item => (
                            <span key={item.id} className="sale-item-tag">
                              {item.variant_id
                                ? `Granizado ${item.size_name} ${item.has_liquor ? 'c/licor' : 's/licor'}`
                                : getProductLabel(item.product_name)
                              }
                              {item.quantity > 1 && ` ×${item.quantity}`}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>{paymentLabel[sale.payment_method]}</td>
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
          <p>Selecciona un período y haz clic en Consultar para ver los reportes.</p>
        </div>
      )}

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  )
}

export default Reports