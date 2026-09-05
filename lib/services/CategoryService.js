const categoryRepo = require('../repositories/CategoryRepository');

class CategoryService {
  async getAll() {
    return categoryRepo.findAll();
  }

  async getById(id) {
    const category = await categoryRepo.findById(id);
    if (!category) {
      const err = new Error('Categoría no encontrada');
      err.status = 404;
      throw err;
    }
    return category;
  }

  async create({ name }) {
    if (!name || name.trim() === '') {
      const err = new Error('El nombre es requerido');
      err.status = 400;
      throw err;
    }
    return categoryRepo.create({ name: name.trim() });
  }

  async update(id, { name }) {
    if (!name || name.trim() === '') {
      const err = new Error('El nombre es requerido');
      err.status = 400;
      throw err;
    }
    await this.getById(id);
    return categoryRepo.update(id, { name: name.trim() });
  }

  async delete(id) {
    await this.getById(id);
    return categoryRepo.delete(id);
  }
}

module.exports = new CategoryService();
