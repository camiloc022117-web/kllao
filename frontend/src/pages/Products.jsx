import { useState, useEffect } from 'react'
import { getProducts } from '../services/products.service'
import { getVariants } from '../services/variants.service'
import './Products.css'

const Products = () => {
  const [products, setProducts] = useState([])
  const [variants, setVariants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = "Productos | K'llao"
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

  const getCategoryLabel = (name) => {
    const labels = {
      'slushies': 'Granizado',
      'snacks': 'Mecatos',
      'drinks': 'Bebidas',
      'extras': 'Adicionales'
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

  if (loading) return <div className="products-loading">Cargando...</div>

  const categories = ['slushies', 'snacks', 'drinks', 'extras']

  return (
    <div className="products-view">
      <h1 className="products-title">Catálogo de productos</h1>

      {categories.map(category => {
        const categoryProducts = products.filter(p => p.category_name === category)
        if (categoryProducts.length === 0) return null

        return (
          <div key={category} className="category-section">
            <h2 className="category-title">{getCategoryLabel(category)}</h2>

            {category === 'slushies' ? (
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Variante</th>
                    <th>Tamaño</th>
                    <th>Licor</th>
                    <th>Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map(variant => (
                    <tr key={variant.id}>
                      <td>Granizado {variant.size_name}</td>
                      <td>{variant.size_name}</td>
                      <td>
                        <span className={`badge ${variant.has_liquor ? 'badge-liquor' : 'badge-no-liquor'}`}>
                          {variant.has_liquor ? 'Con licor' : 'Sin licor'}
                        </span>
                      </td>
                      <td className="price-cell">{formatPrice(variant.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Precio</th>
                    <th>Stock actual</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryProducts.map(product => (
                    <tr key={product.id}>
                      <td>{getProductLabel(product.name)}</td>
                      <td className="price-cell">{formatPrice(product.base_price)}</td>
                      <td>
                        <span className={`stock-badge ${product.current_stock <= 0 ? 'stock-low' : 'stock-ok'}`}>
                          {product.current_stock} uds.
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default Products