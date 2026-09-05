import { useState, useEffect } from 'react'
import { getProducts } from '../services/products.service'
import { getVariants } from '../services/variants.service'
import { createSale } from '../services/sales.service'
import './POS.css'
import Toast from '../components/Toast'

const POS = () => {
    const [products, setProducts] = useState([])
    const [variants, setVariants] = useState([])
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [orderItems, setOrderItems] = useState([])
    const [paymentMethod, setPaymentMethod] = useState('cash')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [toast, setToast] = useState({ message: '', type: 'success' })

  
    useEffect(() => {
      document.title = "Ventas | K'llao"
    }, [])
    useEffect(() => {
    const loadData = async () => {
        try {
            const [productsRes, variantsRes] = await Promise.all([
                getProducts(),
                getVariants()
            ])
        setProducts(productsRes.data)
        setVariants(variantsRes.data)
        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setLoading(false)
        }
    }

        loadData()
    }, [])

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

const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(price)
}

const handleProductClick = (product) => {
    if (product.category_name === 'slushies') {
        setSelectedProduct(product)
    } else {
        addToOrder({
            product_id: product.id,
            variant_id: null,
            name: getProductLabel(product.name),
            price: product.base_price,
            quantity: 1
    })
    }
}

const handleVariantClick = (variant) => {
    const label = `Granizado ${variant.size_name} ${variant.has_liquor ? 'c/licor' : 's/licor'}`
    addToOrder({
        product_id: variant.product_id,
        variant_id: variant.id,
        name: label,
        price: variant.price,
        quantity: 1
    })
    setSelectedProduct(null)
}

const addToOrder = (item) => {
    setOrderItems(prev => {
        const existing = prev.find(i =>
        i.product_id === item.product_id && i.variant_id === item.variant_id
        )
            if (existing) {
                return prev.map(i =>
            i.product_id === item.product_id && i.variant_id === item.variant_id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
    }
        return [...prev, item]
    })
}

const removeFromOrder = (productId, variantId) => {
    setOrderItems(prev =>
        prev.filter(i => !(i.product_id === productId && i.variant_id === variantId))
    )
}

const updateQuantity = (productId, variantId, delta) => {
    setOrderItems(prev =>
        prev.map(i => {
            if (i.product_id === productId && i.variant_id === variantId) {
                const newQty = i.quantity + delta
                    return newQty <= 0 ? null : { ...i, quantity: newQty }
            }
            return i
        }).filter(Boolean)
    )
}

const total = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0)

const handleSubmit = async () => {
  if (orderItems.length === 0) return

  setSubmitting(true)
  try {
    const now = new Date()
    const date = now.toISOString().split('T')[0]
    const time = now.toTimeString().split(' ')[0]

    await createSale({
      date,
      time,
      payment_method: paymentMethod,
      items: orderItems.map(i => ({
        product_id: i.product_id,
        variant_id: i.variant_id,
        quantity: i.quantity
      }))
    })

    setOrderItems([])
    setSelectedProduct(null)
    setPaymentMethod('cash')
    setToast({ message: 'Venta registrada correctamente.', type: 'success' })
  } catch (error) {
    console.error('Error registering sale:', error)
    setToast({ message: 'Error al registrar la venta. Intenta de nuevo.', type: 'error' })
  } finally {
    setSubmitting(false)
  }
}

  if (loading) return <div className="pos-loading">Cargando...</div>

  const slushVariants = variants.filter(v => v.product_id === 1)
  const nonSlushProducts = products.filter(p => p.category_name !== 'slushies')

  return (
    <div className="pos">
      <div className="pos-catalog">
        {selectedProduct ? (
          <div className="variant-selector">
            <div className="variant-header">
              <button className="back-btn" onClick={() => setSelectedProduct(null)}>
                ← Volver
              </button>
              <h2>Selecciona el tamaño</h2>
            </div>
            <div className="variant-grid">
              {slushVariants.map(variant => (
                <button
                  key={variant.id}
                  className="variant-btn"
                  onClick={() => handleVariantClick(variant)}
                >
                  <span className="variant-size">{variant.size_name}</span>
                  <span className="variant-liquor">
                    {variant.has_liquor ? 'Con licor' : 'Sin licor'}
                  </span>
                  <span className="variant-price">{formatPrice(variant.price)}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="product-grid-wrapper">
            <div className="catalog-section">
              <h2 className="catalog-title">Granizado</h2>
              <div className="product-grid">
                {products
                  .filter(p => p.category_name === 'slushies')
                  .map(product => (
                    <button
                      key={product.id}
                      className="product-btn slush-btn"
                      onClick={() => handleProductClick(product)}
                    >
                      {getProductLabel(product.name)}
                    </button>
                  ))}
              </div>
            </div>

            <div className="catalog-section">
              <h2 className="catalog-title">Mecatos</h2>
              <div className="product-grid">
                {nonSlushProducts
                  .filter(p => p.category_name === 'snacks')
                  .map(product => (
                    <button
                      key={product.id}
                      className="product-btn"
                      onClick={() => handleProductClick(product)}
                    >
                      <span className="product-name">{getProductLabel(product.name)}</span>
                      <span className="product-price">{formatPrice(product.base_price)}</span>
                    </button>
                  ))}
              </div>
            </div>

            <div className="catalog-section">
              <h2 className="catalog-title">Bebidas</h2>
              <div className="product-grid">
                {nonSlushProducts
                  .filter(p => p.category_name === 'drinks')
                  .map(product => (
                    <button
                      key={product.id}
                      className="product-btn"
                      onClick={() => handleProductClick(product)}
                    >
                      <span className="product-name">{getProductLabel(product.name)}</span>
                      <span className="product-price">{formatPrice(product.base_price)}</span>
                    </button>
                  ))}
              </div>
            </div>

            <div className="catalog-section">
              <h2 className="catalog-title">Adicionales</h2>
              <div className="product-grid">
                {nonSlushProducts
                  .filter(p => p.category_name === 'extras')
                  .map(product => (
                    <button
                      key={product.id}
                      className="product-btn"
                      onClick={() => handleProductClick(product)}
                    >
                      <span className="product-name">{getProductLabel(product.name)}</span>
                      <span className="product-price">{formatPrice(product.base_price)}</span>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="pos-order">
        <h2 className="order-title">Pedido actual</h2>

        {orderItems.length === 0 ? (
          <p className="order-empty">Selecciona productos del catálogo</p>
        ) : (
          <div className="order-items">
            {orderItems.map((item, index) => (
              <div key={index} className="order-item">
                <div className="order-item-info">
                  <span className="order-item-name">{item.name}</span>
                  <span className="order-item-price">{formatPrice(item.price * item.quantity)}</span>
                </div>
                <div className="order-item-controls">
                  <button onClick={() => updateQuantity(item.product_id, item.variant_id, -1)}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product_id, item.variant_id, 1)}>+</button>
                  <button className="remove-btn" onClick={() => removeFromOrder(item.product_id, item.variant_id)}>×</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="order-footer">
          <div className="order-total">
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
            disabled={orderItems.length === 0 || submitting}
          >
            {submitting ? 'Registrando...' : 'Registrar venta'}
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

export default POS