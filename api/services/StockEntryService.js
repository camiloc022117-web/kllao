const stockEntryRepo = require('../repositories/StockEntryRepository');
const productRepo = require('../repositories/ProductRepository');

class StockEntryService {
  async getAll() {
    return stockEntryRepo.findAll();
  }

  async getById(id) {
    const entry = await stockEntryRepo.findById(id);
    if (!entry) {
      const err = new Error('Entrada no encontrada');
      err.status = 404;
      throw err;
    }
    return entry;
  }

  async create({ date, payment_method, items }) {
    if (!date) {
      const err = new Error('La fecha es requerida');
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

    const productIds = items.map(i => i.product_id);
    const products = await Promise.all(productIds.map(id => productRepo.findById(id)));

    for (let i = 0; i < items.length; i++) {
      if (!items[i].product_id || !items[i].quantity || !items[i].cost_price) {
        const err = new Error('Cada producto debe tener product_id, quantity y cost_price');
        err.status = 400;
        throw err;
      }
      if (items[i].quantity <= 0 || items[i].cost_price < 0) {
        const err = new Error('La cantidad debe ser mayor a 0 y el costo positivo');
        err.status = 400;
        throw err;
      }
      if (!products[i]) {
        const err = new Error(`Producto ${items[i].product_id} no encontrado`);
        err.status = 404;
        throw err;
      }
    }

    const total = items.reduce((sum, item) => sum + item.quantity * item.cost_price, 0);

    const entryData = await stockEntryRepo.createWithItems(
      { date, payment_method: payment_method.trim(), total },
      items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        cost_price: item.cost_price,
        subtotal: item.quantity * item.cost_price
      }))
    );

    await Promise.all(items.map((item, i) =>
      productRepo.update(item.product_id, {
        current_stock: products[i].current_stock + item.quantity
      })
    ));

    return stockEntryRepo.findById(entryData.id);
  }
}

module.exports = new StockEntryService();
