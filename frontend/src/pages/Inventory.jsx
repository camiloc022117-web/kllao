import { useState, useEffect } from 'react';
import { getProducts, updateProduct } from '../services/products.service';
import { createStockEntry } from '../services/stockEntries.service';
import { PRODUCT_LABEL, CATEGORY_LABEL } from '../utils/labels';
import { formatPrice } from '../utils/format';
import { StockBadge } from '../components/ui/Badge';
import DataTable from '../components/ui/DataTable';
import ProductCard from '../components/shared/ProductCard';
import PaymentSelector from '../components/shared/PaymentSelector';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Toast from '../components/ui/Toast';
import './Inventory.css';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inventory');
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({ cost_price: 0, base_price: 0, current_stock: 0 });
  const [saving, setSaving] = useState(false);

  const [entryItems, setEntryItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Inventario | K'lliao";
  }, []);

  const loadData = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data || res);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const openEditModal = (product) => {
    setEditingProduct(product);
    setEditForm({
      cost_price: product.cost_price || 0,
      base_price: product.base_price || 0,
      current_stock: product.current_stock || 0
    });
    setShowEditModal(true);
  };

  const handleSaveInventory = async () => {
    setSaving(true);
    try {
      await updateProduct(editingProduct.id, editForm);
      setToast({ message: 'Inventario actualizado', type: 'success' });
      setShowEditModal(false);
      await loadData();
    } catch (e) {
      setToast({ message: e.response?.data?.error || 'Error al guardar', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleProductClick = (product) => {
    if (entryItems.some(i => i.product_id === product.id)) return;
    setEntryItems(prev => [...prev, {
      product_id: product.id,
      name: PRODUCT_LABEL(product.name),
      quantity: 1,
      cost_price: product.cost_price || product.base_price || 0
    }]);
  };

  const updateEntryItem = (productId, field, value) => {
    setEntryItems(prev =>
      prev.map(i =>
        i.product_id === productId ? { ...i, [field]: Number(value) } : i
      )
    );
  };

  const removeEntryItem = (productId) => {
    setEntryItems(prev => prev.filter(i => i.product_id !== productId));
  };

  const entryTotal = entryItems.reduce((sum, i) => sum + i.quantity * i.cost_price, 0);

  const handleSubmitEntry = async () => {
    if (entryItems.length === 0) return;

    setSubmitting(true);
    try {
      await createStockEntry({
        date,
        payment_method: paymentMethod,
        items: entryItems.map(i => ({
          product_id: i.product_id,
          quantity: i.quantity,
          cost_price: i.cost_price
        }))
      });

      setEntryItems([]);
      setPaymentMethod('cash');
      await loadData();
      setToast({ message: 'Entrada registrada correctamente.', type: 'success' });
    } catch (error) {
      console.error('Error registering entry:', error);
      setToast({ message: 'Error al registrar la entrada.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const fmt = (n) => `$${Number(n).toLocaleString()}`;

  const inventoryColumns = [
    { key: 'name', header: 'Producto', accessor: (row) => PRODUCT_LABEL(row.name) },
    { key: 'category_name', header: 'Categoria', accessor: (row) => CATEGORY_LABEL(row.category_name) },
    { key: 'cost_price', header: 'Precio compra', accessor: (row) => fmt(row.cost_price) },
    { key: 'base_price', header: 'Precio venta', accessor: (row) => fmt(row.base_price) },
    { key: 'current_stock', header: 'Stock', render: (row) => <StockBadge stock={row.current_stock} /> },
    {
      key: 'actions', header: '', width: '60px', render: (row) => (
        <button className="products-action-btn" onClick={() => openEditModal(row)} title="Editar inventario">✏️</button>
      )
    }
  ];

  if (loading) return <LoadingSpinner />;

  const isInEntry = (productId) => entryItems.some(i => i.product_id === productId);

  const trackableProducts = products.filter(p => p.category_name !== 'slushies');

  return (
    <div className="inventory-view">
      <div className="inventory-header">
        <h1 className="inventory-title">Inventario</h1>
      </div>

      <div className="inventory-tabs">
        <button
          className={`inventory-tab ${activeTab === 'inventory' ? 'inventory-tab--active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          Inventario
        </button>
        <button
          className={`inventory-tab ${activeTab === 'entries' ? 'inventory-tab--active' : ''}`}
          onClick={() => setActiveTab('entries')}
        >
          Entradas
        </button>
      </div>

      <div className="inventory-content">
        {activeTab === 'inventory' ? (
          <DataTable
            columns={inventoryColumns}
            data={products}
            searchable
            searchPlaceholder="Buscar producto..."
            emptyMessage="No hay productos"
          />
        ) : (
          <div className="entry-layout">
            <div className="entry-catalog">
              <h2 className="entry-section-title">Productos</h2>
              <div className="entry-product-grid">
                {trackableProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    name={PRODUCT_LABEL(product.name)}
                    stock={product.current_stock}
                    inEntry={isInEntry(product.id)}
                    onClick={() => handleProductClick(product)}
                  />
                ))}
              </div>
            </div>

            <div className="entry-form">
              <h2 className="entry-section-title">Entrada de inventario</h2>

              <div className="entry-date">
                <label>Fecha</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </div>

              {entryItems.length === 0 ? (
                <p className="entry-empty">Selecciona productos del catalogo</p>
              ) : (
                <div className="entry-items">
                  {entryItems.map(item => (
                    <div key={item.product_id} className="entry-item">
                      <div className="entry-item-header">
                        <span className="entry-item-name">{item.name}</span>
                        <button className="remove-btn" onClick={() => removeEntryItem(item.product_id)}>×</button>
                      </div>
                      <div className="entry-item-inputs">
                        <div className="input-group">
                          <label>Cantidad</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={e => updateEntryItem(item.product_id, 'quantity', e.target.value)}
                          />
                        </div>
                        <div className="input-group">
                          <label>Costo unitario</label>
                          <input
                            type="number"
                            min="0"
                            value={item.cost_price}
                            onChange={e => updateEntryItem(item.product_id, 'cost_price', e.target.value)}
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
                  <span className="total-amount">{formatPrice(entryTotal)}</span>
                </div>

                <PaymentSelector value={paymentMethod} onChange={setPaymentMethod} />

                <Button
                  variant="primary"
                  size="lg"
                  loading={submitting}
                  disabled={entryItems.length === 0}
                  onClick={handleSubmitEntry}
                  className="entry-submit"
                >
                  Registrar entrada
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Editar inventario">
        <div className="modal-form">
          <div className="modal-form__product-name">
            {editingProduct && PRODUCT_LABEL(editingProduct.name)}
          </div>
          <div className="modal-form__row">
            <div className="modal-form__field">
              <label>Precio compra</label>
              <input type="number" min="0" value={editForm.cost_price} onChange={e => setEditForm({ ...editForm, cost_price: Number(e.target.value) })} />
            </div>
            <div className="modal-form__field">
              <label>Precio venta</label>
              <input type="number" min="0" value={editForm.base_price} onChange={e => setEditForm({ ...editForm, base_price: Number(e.target.value) })} />
            </div>
          </div>
          <div className="modal-form__field">
            <label>Stock actual</label>
            <input type="number" min="0" value={editForm.current_stock} onChange={e => setEditForm({ ...editForm, current_stock: Number(e.target.value) })} />
          </div>
          <div className="modal-form__actions">
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancelar</Button>
            <Button variant="primary" loading={saving} onClick={handleSaveInventory}>Guardar</Button>
          </div>
        </div>
      </Modal>

      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
    </div>
  );
};

export default Inventory;
