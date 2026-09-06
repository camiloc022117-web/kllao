const variantRepo = require('../repositories/VariantRepository');
const productRepo = require('../repositories/ProductRepository');
const sizeRepo = require('../repositories/SizeRepository');

class VariantService {
  async getAll() {
    return variantRepo.findAll();
  }

  async getById(id) {
    const variant = await variantRepo.findById(id);
    if (!variant) {
      const err = new Error('Variante no encontrada');
      err.status = 404;
      throw err;
    }
    return variant;
  }

  async create({ product_id, size_id, has_liquor, price }) {
    if (!product_id) {
      const err = new Error('El producto es requerido');
      err.status = 400;
      throw err;
    }
    if (!size_id) {
      const err = new Error('El tamano es requerido');
      err.status = 400;
      throw err;
    }
    if (price === undefined || price < 0) {
      const err = new Error('El precio es requerido');
      err.status = 400;
      throw err;
    }

    const [product, size] = await Promise.all([
      productRepo.findById(product_id),
      sizeRepo.findById(size_id)
    ]);

    if (!product) {
      const err = new Error('Producto no encontrado');
      err.status = 404;
      throw err;
    }
    if (!size) {
      const err = new Error('Tamano no encontrado');
      err.status = 404;
      throw err;
    }

    const existing = await variantRepo.findUnique(product_id, size_id, !!has_liquor);
    if (existing) {
      const err = new Error('La variante ya existe');
      err.status = 409;
      throw err;
    }

    return variantRepo.create({
      product_id,
      size_id,
      has_liquor: !!has_liquor,
      price
    });
  }

  async update(id, { size_id, has_liquor, price }) {
    const variant = await this.getById(id);

    if (size_id && size_id !== variant.size_id) {
      const size = await sizeRepo.findById(size_id);
      if (!size) {
        const err = new Error('Tamano no encontrado');
        err.status = 404;
        throw err;
      }
      const existing = await variantRepo.findUnique(variant.product_id, size_id, has_liquor !== undefined ? !!has_liquor : variant.has_liquor);
      if (existing && existing.id !== id) {
        const err = new Error('La variante ya existe para ese tamano');
        err.status = 409;
        throw err;
      }
    }

    return variantRepo.update(id, {
      size_id: size_id !== undefined ? size_id : variant.size_id,
      has_liquor: has_liquor !== undefined ? !!has_liquor : variant.has_liquor,
      price: price !== undefined ? price : variant.price
    });
  }

  async delete(id) {
    await this.getById(id);
    return variantRepo.delete(id);
  }
}

module.exports = new VariantService();
