const productRepo = require('../repositories/ProductRepository');
const categoryRepo = require('../repositories/CategoryRepository');

class ProductService {
  async getAll() {
    return productRepo.findAll();
  }

  async getById(id) {
    const product = await productRepo.findById(id);
    if (!product) {
      const err = new Error('Producto no encontrado');
      err.status = 404;
      throw err;
    }
    return product;
  }

  async create({ name, description, category_id, base_price, cost_price, current_stock }) {
    if (!name || name.trim() === '') {
      const err = new Error('El nombre es requerido');
      err.status = 400;
      throw err;
    }
    if (!category_id) {
      const err = new Error('La categoria es requerida');
      err.status = 400;
      throw err;
    }

    const category = await categoryRepo.findById(category_id);
    if (!category) {
      const err = new Error('Categoria no encontrada');
      err.status = 404;
      throw err;
    }

    return productRepo.create({
      name: name.trim(),
      description: description?.trim() || null,
      category_id,
      base_price: base_price ?? 0,
      cost_price: cost_price ?? 0,
      current_stock: current_stock ?? 0
    });
  }

  async update(id, { name, description, category_id, base_price, cost_price, current_stock }) {
    const product = await this.getById(id);

    if (category_id) {
      const category = await categoryRepo.findById(category_id);
      if (!category) {
        const err = new Error('Categoria no encontrada');
        err.status = 404;
        throw err;
      }
    }

    return productRepo.update(id, {
      name: name ? name.trim() : product.name,
      description: description !== undefined ? (description?.trim() || null) : product.description,
      category_id: category_id ?? product.category_id,
      base_price: base_price !== undefined ? base_price : product.base_price,
      cost_price: cost_price !== undefined ? cost_price : product.cost_price,
      current_stock: current_stock !== undefined ? current_stock : product.current_stock
    });
  }

  async delete(id) {
    await this.getById(id);
    return productRepo.delete(id);
  }
}

module.exports = new ProductService();
