import { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/products.service';
import { getVariants, updateVariant, createVariant, deleteVariant } from '../services/variants.service';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/categories.service';
import { PRODUCT_LABEL, CATEGORY_LABEL } from '../utils/labels';
import { CATEGORIES_ORDER } from '../utils/constants';
import { LiquorBadge } from '../components/ui/Badge';
import DataTable from '../components/ui/DataTable';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Toast from '../components/ui/Toast';
import './Products.css';

const emptyProduct = { name: '', description: '', category_id: '' };
const emptyVariant = { product_id: '', size_id: '', has_liquor: false, price: 0 };
const emptyCategory = { name: '', description: '' };

const Products = () => {
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const [showProductModal, setShowProductModal] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingVariant, setEditingVariant] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [variantForm, setVariantForm] = useState(emptyVariant);
  const [categoryForm, setCategoryForm] = useState(emptyCategory);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const [p, v, c] = await Promise.all([getProducts(), getVariants(), getCategories()]);
      setProducts(p.data || p);
      setVariants(v.data || v);
      setCategories(c.data || c);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const openNewProduct = () => {
    setEditingProduct(null);
    setProductForm(emptyProduct);
    setShowProductModal(true);
  };

  const openEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      category_id: product.category_id
    });
    setShowProductModal(true);
  };

  const openNewVariant = () => {
    setEditingVariant(null);
    setVariantForm(emptyVariant);
    setShowVariantModal(true);
  };

  const openEditVariant = (variant) => {
    setEditingVariant(variant);
    setVariantForm({
      product_id: variant.product_id,
      size_id: variant.size_id,
      has_liquor: variant.has_liquor,
      price: variant.price
    });
    setShowVariantModal(true);
  };

  const openNewCategory = () => {
    setEditingCategory(null);
    setCategoryForm(emptyCategory);
    setShowCategoryModal(true);
  };

  const openEditCategory = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({ name: cat.name, description: cat.description || '' });
    setShowCategoryModal(true);
  };

  const handleSaveProduct = async () => {
    setSaving(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productForm);
        setToast({ message: 'Producto actualizado', type: 'success' });
      } else {
        await createProduct(productForm);
        setToast({ message: 'Producto creado', type: 'success' });
      }
      setShowProductModal(false);
      await loadData();
    } catch (e) {
      setToast({ message: e.response?.data?.error || 'Error al guardar', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveVariant = async () => {
    setSaving(true);
    try {
      if (editingVariant) {
        await updateVariant(editingVariant.id, { has_liquor: variantForm.has_liquor, price: variantForm.price });
        setToast({ message: 'Variante actualizada', type: 'success' });
      } else {
        await createVariant(variantForm);
        setToast({ message: 'Variante creada', type: 'success' });
      }
      setShowVariantModal(false);
      await loadData();
    } catch (e) {
      setToast({ message: e.response?.data?.error || 'Error al guardar', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCategory = async () => {
    setSaving(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryForm);
        setToast({ message: 'Categoria actualizada', type: 'success' });
      } else {
        await createCategory(categoryForm);
        setToast({ message: 'Categoria creada', type: 'success' });
      }
      setShowCategoryModal(false);
      await loadData();
    } catch (e) {
      setToast({ message: e.response?.data?.error || 'Error al guardar', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Eliminar este producto?')) return;
    try {
      await deleteProduct(id);
      setToast({ message: 'Producto eliminado', type: 'success' });
      await loadData();
    } catch (e) {
      setToast({ message: e.response?.data?.error || 'Error al eliminar', type: 'error' });
    }
  };

  const handleDeleteVariant = async (id) => {
    if (!confirm('Eliminar esta variante?')) return;
    try {
      await deleteVariant(id);
      setToast({ message: 'Variante eliminada', type: 'success' });
      await loadData();
    } catch (e) {
      setToast({ message: e.response?.data?.error || 'Error al eliminar', type: 'error' });
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Eliminar esta categoria?')) return;
    try {
      await deleteCategory(id);
      setToast({ message: 'Categoria eliminada', type: 'success' });
      await loadData();
    } catch (e) {
      setToast({ message: e.response?.data?.error || 'Error al eliminar', type: 'error' });
    }
  };

  const fmt = (n) => `$${Number(n).toLocaleString()}`;

  const productColumns = [
    { key: 'name', header: 'Producto', accessor: (row) => PRODUCT_LABEL(row.name) },
    { key: 'category_name', header: 'Categoria', accessor: (row) => CATEGORY_LABEL(row.category_name) },
    {
      key: 'actions', header: '', width: '90px', render: (row) => (
        <div className="products-actions">
          <button className="products-action-btn" onClick={() => openEditProduct(row)} title="Editar">✏️</button>
          <button className="products-action-btn products-action-btn--danger" onClick={() => handleDeleteProduct(row.id)} title="Eliminar">🗑️</button>
        </div>
      )
    }
  ];

  const variantColumns = [
    { key: 'product_name', header: 'Producto', accessor: (row) => `Granizado ${row.size_name}` },
    { key: 'size_name', header: 'Tamano' },
    { key: 'has_liquor', header: 'Licor', render: (row) => <LiquorBadge hasLiquor={row.has_liquor} /> },
    { key: 'price', header: 'Precio', accessor: (row) => fmt(row.price) },
    {
      key: 'actions', header: '', width: '90px', render: (row) => (
        <div className="products-actions">
          <button className="products-action-btn" onClick={() => openEditVariant(row)} title="Editar">✏️</button>
          <button className="products-action-btn products-action-btn--danger" onClick={() => handleDeleteVariant(row.id)} title="Eliminar">🗑️</button>
        </div>
      )
    }
  ];

  const categoryColumns = [
    { key: 'name', header: 'Nombre', accessor: (row) => CATEGORY_LABEL(row.name) },
    { key: 'description', header: 'Descripcion', accessor: (row) => row.description || '-' },
    {
      key: 'actions', header: '', width: '90px', render: (row) => (
        <div className="products-actions">
          <button className="products-action-btn" onClick={() => openEditCategory(row)} title="Editar">✏️</button>
          <button className="products-action-btn products-action-btn--danger" onClick={() => handleDeleteCategory(row.id)} title="Eliminar">🗑️</button>
        </div>
      )
    }
  ];

  if (loading) return <LoadingSpinner />;

  const tabs = [
    { key: 'all', label: 'Todos' },
    ...CATEGORIES_ORDER.map(c => ({ key: c, label: CATEGORY_LABEL(c) })),
    { key: 'variants', label: 'Variantes' },
    { key: 'categories', label: 'Categorias' }
  ];

  const filteredProducts = activeTab === 'all'
    ? products
    : products.filter(p => p.category_name === activeTab);

  const handleNewClick = () => {
    if (activeTab === 'categories') openNewCategory();
    else if (activeTab === 'variants') openNewVariant();
    else openNewProduct();
  };

  const newLabel = activeTab === 'categories' ? 'Nueva categoria' : activeTab === 'variants' ? 'Nueva variante' : 'Nuevo producto';

  return (
    <div className="products-view">
      <div className="products-header">
        <h1 className="products-title">Catalogo de productos</h1>
        <Button variant="primary" onClick={handleNewClick}>
          + {newLabel}
        </Button>
      </div>

      <div className="products-tabs">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`products-tab ${activeTab === tab.key ? 'products-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="products-content">
        {activeTab === 'categories' ? (
          <DataTable
            columns={categoryColumns}
            data={categories}
            searchable
            searchPlaceholder="Buscar categoria..."
            emptyMessage="No hay categorias"
          />
        ) : activeTab === 'variants' ? (
          <DataTable
            columns={variantColumns}
            data={variants}
            searchable
            searchPlaceholder="Buscar variante..."
            emptyMessage="No hay variantes"
          />
        ) : (
          <DataTable
            columns={productColumns}
            data={filteredProducts}
            searchable
            searchPlaceholder="Buscar producto..."
            emptyMessage="No hay productos"
          />
        )}
      </div>

      <Modal isOpen={showProductModal} onClose={() => setShowProductModal(false)} title={editingProduct ? 'Editar producto' : 'Nuevo producto'}>
        <div className="modal-form">
          <div className="modal-form__field">
            <label>Nombre</label>
            <input value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} placeholder="Nombre del producto" />
          </div>
          <div className="modal-form__field">
            <label>Descripcion</label>
            <input value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} placeholder="Descripcion opcional" />
          </div>
          <div className="modal-form__field">
            <label>Categoria</label>
            <select value={productForm.category_id} onChange={e => setProductForm({ ...productForm, category_id: e.target.value })}>
              <option value="">Seleccionar</option>
              {categories.map(c => <option key={c.id} value={c.id}>{CATEGORY_LABEL(c.name)}</option>)}
            </select>
          </div>
          <div className="modal-form__actions">
            <Button variant="secondary" onClick={() => setShowProductModal(false)}>Cancelar</Button>
            <Button variant="primary" loading={saving} onClick={handleSaveProduct}>{editingProduct ? 'Guardar' : 'Crear'}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showVariantModal} onClose={() => setShowVariantModal(false)} title={editingVariant ? 'Editar variante' : 'Nueva variante'}>
        <div className="modal-form">
          {!editingVariant && (
            <>
              <div className="modal-form__field">
                <label>Producto</label>
                <select value={variantForm.product_id} onChange={e => setVariantForm({ ...variantForm, product_id: e.target.value })}>
                  <option value="">Seleccionar</option>
                  {products.filter(p => p.category_name === 'slushies').map(p => <option key={p.id} value={p.id}>{PRODUCT_LABEL(p.name)}</option>)}
                </select>
              </div>
              <div className="modal-form__field">
                <label>Tamano</label>
                <select value={variantForm.size_id} onChange={e => setVariantForm({ ...variantForm, size_id: e.target.value })}>
                  <option value="">Seleccionar</option>
                  <option value="1">10oz</option>
                  <option value="2">16oz</option>
                  <option value="3">20oz</option>
                  <option value="4">32oz</option>
                  <option value="5">Litro</option>
                </select>
              </div>
            </>
          )}
          <div className="modal-form__row">
            <div className="modal-form__field">
              <label>Licor</label>
              <select value={variantForm.has_liquor} onChange={e => setVariantForm({ ...variantForm, has_liquor: e.target.value === 'true' })}>
                <option value="false">Sin licor</option>
                <option value="true">Con licor</option>
              </select>
            </div>
            <div className="modal-form__field">
              <label>Precio</label>
              <input type="number" min="0" value={variantForm.price} onChange={e => setVariantForm({ ...variantForm, price: Number(e.target.value) })} />
            </div>
          </div>
          <div className="modal-form__actions">
            <Button variant="secondary" onClick={() => setShowVariantModal(false)}>Cancelar</Button>
            <Button variant="primary" loading={saving} onClick={handleSaveVariant}>{editingVariant ? 'Guardar' : 'Crear'}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showCategoryModal} onClose={() => setShowCategoryModal(false)} title={editingCategory ? 'Editar categoria' : 'Nueva categoria'}>
        <div className="modal-form">
          <div className="modal-form__field">
            <label>Nombre</label>
            <input value={categoryForm.name} onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })} placeholder="Nombre de la categoria" />
          </div>
          <div className="modal-form__field">
            <label>Descripcion</label>
            <input value={categoryForm.description} onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })} placeholder="Descripcion opcional" />
          </div>
          <div className="modal-form__actions">
            <Button variant="secondary" onClick={() => setShowCategoryModal(false)}>Cancelar</Button>
            <Button variant="primary" loading={saving} onClick={handleSaveCategory}>{editingCategory ? 'Guardar' : 'Crear'}</Button>
          </div>
        </div>
      </Modal>

      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
    </div>
  );
};

export default Products;
