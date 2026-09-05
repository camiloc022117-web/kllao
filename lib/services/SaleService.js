const saleRepo = require('../repositories/SaleRepository');
const productRepo = require('../repositories/ProductRepository');
const variantRepo = require('../repositories/VariantRepository');

class SaleService {
  async getAll() {
    return saleRepo.findAll();
  }

  async getById(id) {
    const sale = await saleRepo.findById(id);
    if (!sale) {
      const err = new Error('Venta no encontrada');
      err.status = 404;
      throw err;
    }
    return sale;
  }

  async create({ date, time, payment_method, items }) {
    if (!date) {
      const err = new Error('La fecha es requerida');
      err.status = 400;
      throw err;
    }
    if (!time) {
      const err = new Error('La hora es requerida');
      err.status = 400;
      throw err;
    }
    if (!payment_method || payment_method.trim() === '') {
      const err = new Error('El metodo de pago es requerido');
      err.status = 400;
      throw err;
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      const err = new Error('Se requiere al menos un producto');
      err.status = 400;
      throw err;
    }

    for (const item of items) {
      if (!item.product_id || !item.quantity) {
        const err = new Error('Cada producto debe tener product_id y quantity');
        err.status = 400;
        throw err;
      }
      if (item.quantity <= 0) {
        const err = new Error('La cantidad debe ser mayor a 0');
        err.status = 400;
        throw err;
      }
    }

    const productIds = [...new Set(items.map(i => i.product_id))];
    const variantIds = [...new Set(items.filter(i => i.variant_id).map(i => i.variant_id))];

    const [products, variants] = await Promise.all([
      Promise.all(productIds.map(id => productRepo.findById(id))),
      variantIds.length > 0 ? Promise.all(variantIds.map(id => variantRepo.findById(id))) : []
    ]);

    const productMap = {};
    productIds.forEach((id, i) => { productMap[id] = products[i]; });

    const variantMap = {};
    variantIds.forEach((id, i) => { variantMap[id] = variants[i]; });

    for (const item of items) {
      const product = productMap[item.product_id];
      if (!product) {
        const err = new Error(`Producto ${item.product_id} no encontrado`);
        err.status = 404;
        throw err;
      }
      if (item.variant_id) {
        const variant = variantMap[item.variant_id];
        if (!variant) {
          const err = new Error(`Variante ${item.variant_id} no encontrada`);
          err.status = 404;
          throw err;
        }
        if (variant.product_id !== product.id) {
          const err = new Error(`La variante ${item.variant_id} no pertenece al producto ${item.product_id}`);
          err.status = 400;
          throw err;
        }
      }
    }

    const resolvedItems = items.map(item => {
      const product = productMap[item.product_id];
      const variant = item.variant_id ? variantMap[item.variant_id] : null;
      const unit_price = variant ? variant.price : product.base_price;
      return {
        product_id: item.product_id,
        variant_id: item.variant_id || null,
        quantity: item.quantity,
        unit_price,
        subtotal: item.quantity * unit_price
      };
    });

    const total = resolvedItems.reduce((sum, item) => sum + item.subtotal, 0);

    const saleData = await saleRepo.createWithItems(
      { date, time, payment_method: payment_method.trim(), total },
      resolvedItems
    );

    const stockUpdates = resolvedItems
      .filter(item => !item.variant_id)
      .map(item => {
        const product = productMap[item.product_id];
        return productRepo.update(item.product_id, {
          current_stock: product.current_stock - item.quantity
        });
      });

    if (stockUpdates.length > 0) {
      await Promise.all(stockUpdates);
    }

    return saleRepo.findById(saleData.id);
  }

  async getByDateRange(startDate, endDate) {
    if (!startDate || !endDate) {
      const err = new Error('Las fechas de inicio y fin son requeridas');
      err.status = 400;
      throw err;
    }

    const sales = await saleRepo.findByDateRange(startDate, endDate);

    const summary = {
      total: 0,
      cash: 0,
      transfer: 0,
      card: 0,
      count: sales.length
    };

    const slushBySize = {};

    for (const sale of sales) {
      const t = Number(sale.total);
      summary.total += t;
      if (sale.payment_method === 'cash') summary.cash += t;
      else if (sale.payment_method === 'transfer') summary.transfer += t;
      else if (sale.payment_method === 'card') summary.card += t;

      for (const item of sale.items) {
        if (item.variant_id && item.size_name) {
          slushBySize[item.size_name] = (slushBySize[item.size_name] || 0) + item.quantity;
        }
      }
    }

    return { summary, sales, slushBySize };
  }
}

module.exports = new SaleService();
