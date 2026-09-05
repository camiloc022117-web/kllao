import { useState, useEffect } from 'react'
import { getProducts } from '../services/products.service'
import { createStockEntry } from '../services/stockEntries.service'
import './Inventory.css'
import Toast from '../components/Toast'

const Inventory = () => {
  const [products, setProducts] = useState([])
  const [entryItems, setEntryItems] = useState([])
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState({ message: '', type: 'success' })

  useEffect(() => {
    document.title = "Inventario | K'llao"
  }, [])
  
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await getProducts()
        const trackeable = res.data.filter(p => p.category_name !== 'slushies')
        setProducts(trackeable)
      } catch (error) {
        console.error('Error loading products:', error)
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

  const getProductLabel = (name) => {
    const labels = {
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const handleProductClick = (product) => {
    const existing = entryItems.find(i => i.product_id === product.id)
    if (existing) return

    setEntryItems(prev => [...prev, {
      product_id: product.id,
      name: getProductLabel(product.name),
      quantity: 1,
      cost_price: product.base_price
    }])
  }

  const updateItem = (productId, field, value) => {
    setEntryItems(prev =>
      prev.map(i =>
        i.product_id === productId
          ? { ...i, [field]: Number(value) }
          : i
      )
    )
  }

  const removeItem = (productId) => {
    setEntryItems(prev => prev.filter(i => i.product_id !== productId))
  }

  const total = entryItems.reduce((sum, i) => sum + i.quantity * i.cost_price, 0)

  const handleSubmit = async () => {
    if (entryItems.length === 0) return

    const invalidItem = entryItems.find(i => i.quantity <= 0 || i.cost_price <= 0)
    if (invalidItem) {
      alert('Verifica que todos los productos tengan cantidad y costo válidos.')
      return
    }

    setSubmitting(true)
    try {
      await createStockEntry({
        date,
        payment_method: paymentMethod,
        items: entryItems.map(i => ({
          product_id: i.product_id,
          quantity: i.quantity,
          cost_price: i.cost_price
        }))
      })

      setEntryItems([])
      setPaymentMethod('cash')
      setTimeout(() => setSuccessMessage(''), 3000)

      const res = await getProducts()
      const trackeable = res.data.filter(p => p.category_name !== 'slushies')
      setProducts(trackeable)
      setToast({ message: 'Entrada registrada correctamente.', type: 'success' })
    } catch (error) {
      console.error('Error registering entry:', error)
      setToast({ message: 'Error al registrar la entrada. Intenta de nuevo.', type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="inventory-loading">Cargando...</div>

  const isInEntry = (productId) => entryItems.some(i => i.product_id === productId)

  return (
    <div className="inventory">
      <div className="inventory-catalog">
        <h2 className="catalog-title">Productos</h2>
        <div className="product-grid">
          {products.map(product => (
            <button
              key={product.id}
              className={`product-btn ${isInEntry(product.id) ? 'in-entry' : ''}`}
              onClick={() => handleProductClick(product)}
            >
              <span className="product-name">{getProductLabel(product.name)}</span>
              <span className="product-stock">Stock: {product.current_stock}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="inventory-entry">
        <h2 className="entry-title">Entrada de inventario</h2>

        <div className="entry-date">
          <label>Fecha</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>

        {entryItems.length === 0 ? (
          <p className="entry-empty">Selecciona productos del catálogo</p>
        ) : (
          <div className="entry-items">
            {entryItems.map(item => (
              <div key={item.product_id} className="entry-item">
                <div className="entry-item-header">
                  <span className="entry-item-name">{item.name}</span>
                  <button className="remove-btn" onClick={() => removeItem(item.product_id)}>×</button>
                </div>
                <div className="entry-item-inputs">
                  <div className="input-group">
                    <label>Cantidad</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={e => updateItem(item.product_id, 'quantity', e.target.value)}
                    />
                  </div>
                  <div className="input-group">
                    <label>Costo unitario</label>
                    <input
                      type="number"
                      min="0"
                      value={item.cost_price}
                      onChange={e => updateItem(item.product_id, 'cost_price', e.target.value)}
                    />
                  </div>
                  <span className="entry-item-subtotal">
                    {formatPrice(item.quantity * item.cost_price)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="entry-footer">
          <div className="entry-total">
            <span>Total</span>
            <span className="total-amount">{formatPrice(total)}</span>
          </div>

          <div className="payment-methods">
            <button
              className={`payment-btn ${paymentMethod === 'cash' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('cash')}
            >
              Efectivo
            </button>
            <button
              className={`payment-btn ${paymentMethod === 'transfer' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('transfer')}
            >
              Transferencia
            </button>
            <button
              className={`payment-btn ${paymentMethod === 'card' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('card')}
            >
              Tarjeta
            </button>
          </div>

          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={entryItems.length === 0 || submitting}
          >
            {submitting ? 'Registrando...' : 'Registrar entrada'}
          </button>
        </div>
      </div>
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  )
}

export default Inventory